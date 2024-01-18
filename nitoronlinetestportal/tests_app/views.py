"""
    Request JSON:

    {
      "name" : "WellSky Backend Test",
      "total_questions" : 25,
      "question_details": [
          {
            "python": {
              "mcq_count": 5,
              "easy_program_count": 1,
              "medium_program_count": 2,
              "hard_program_count": 3
            }
          },
          {
            "javascript": {
              "mcq_count": 5,
              "easy_program_count": 1,
              "medium_program_count": 2,
              "hard_program_count": 1
            }
          },
          {
            "graphql": {
              "mcq_count": 5,
              "easy_program_count": 0,
              "medium_program_count": 0,
              "hard_program_count": 0
            }
          }
      ]
    }
"""
import base64
import json
import random
from datetime import datetime

from django.conf import settings
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from questions.models import MultipleChoicesAnswer, ProgramTestCase, Question
from questions.serializers import (MultipleChoicesAnswerSerializer,
                                   ProgramTestCaseSerializer)
from tests_app.models import TestAllocations, TestsDetails, UserTests
from tests_app.serializers import (TestAllocationsSerialiazer,
                                   TestDetailSerializer, UserTestsSerialiazer)
from utils.response_handlers import standard_json_response
from datetime import datetime
from .utils import get_total_duration

@api_view(('POST',))
@permission_classes((IsAuthenticated, ))
def create_update_test(request):
    """
    Request JSON:
    {
        "name" : "WellSky Backend Test",
        "question_details": [
            {
                "language": "python",
                "mcq_count": 5,
                "easy_program_count": 1,
                "medium_program_count": 2,
                "hard_program_count": 3
            },
            {
                "language": "javascript",
                "mcq_count": 5,
                "easy_program_count": 1,
                "medium_program_count": 2,
                "hard_program_count": 1
            },
            {
                "language": "graphql",
                "mcq_count": 5,
                "easy_program_count": 0,
                "medium_program_count": 0,
                "hard_program_count": 0
            }
        ]
    }
    """
    test = None
    if "id" in request.data:
        try:
            test = TestsDetails.objects.get(id=request.data["id"])
        except TestsDetails.DoesNotExist as e:
            return standard_json_response(message='Test does not exist', status_code=status.HTTP_404_NOT_FOUND)

    request.data["duration"] = get_total_duration(request.data["question_details"])
    tds = TestDetailSerializer(data=request.data, instance=test)

    if not tds.is_valid():
        return standard_json_response(message=tds.errors, status_code=status.HTTP_400_BAD_REQUEST)

    valid_question_types = ['mcq_count', 'easy_program_count', 'medium_program_count', 'hard_program_count']
    tds.validated_data['total_questions'] = 0
    for details in tds.validated_data['question_details']:
        for question_type, question_count in details.items():
            if question_type not in valid_question_types:
                continue
            tds.validated_data['total_questions'] += question_count

    tds.validated_data['is_active'] = True

    tds.save()

    return standard_json_response(data=tds.data, status_code=status.HTTP_201_CREATED)


@api_view(('GET',))
@permission_classes((IsAuthenticated, ))
def get_test_list(request):
    tests_details_list = TestsDetails.objects.all().order_by('-is_active')
    test_details_json = TestDetailSerializer(tests_details_list, many=True).data
    return standard_json_response(data=test_details_json)


@api_view(('POST',))
@permission_classes((IsAuthenticated, ))
def generate_test(request):
    generated_questions = {}
    today = datetime.today().date()
    if not 'key' in request.query_params: 
        return standard_json_response(message='Key does not exist', status_code=status.HTTP_404_NOT_FOUND)

    try:
        test_allocation = TestAllocations.objects.get(key=request.query_params['key'])
    except TestAllocations.DoesNotExist as e:
        return standard_json_response(message='Object does not exist', status_code=status.HTTP_404_NOT_FOUND)

    if today > test_allocation.end_date.date():
        return standard_json_response(data=True, message="LinkExpired")

    if 'testId' not in request.query_params:
        return standard_json_response(message='Required parameter testId is missing.', status_code=status.HTTP_400_BAD_REQUEST)

    test_id = 0
    try:
        test_id = int(request.query_params['testId'])
        if test_id <= 0:
            raise
    except:
        return standard_json_response(message='testId must be positive integer.', status_code=status.HTTP_400_BAD_REQUEST)

    try:
        test_details = TestsDetails.objects.get(id=test_id)
    except TestsDetails.DoesNotExist as e:
        return standard_json_response(message='Test does not exist', status_code=status.HTTP_404_NOT_FOUND)
    
    if 'candidate' in request.query_params:
        try:
            user = UserTests.objects.get(email=request.query_params['candidate'])
            generated_questions = user.generated_question
        except Exception as exc:
            return standard_json_response(message=str(exc), status_code=status.HTTP_400_BAD_REQUEST)
    else:
        generated_questions = {}    

        tds = TestDetailSerializer(test_details)
        question_details = tds.data['question_details']
        for details in question_details:
            h, m, s = tds.data["duration"].split(':')
            total_duration = int(h) * 3600 + int(m) * 60 + int(s)
            language = details['language']
            mcq_count = details['mcq_count']
            mcq_difficulty = details['mcq_difficulty']
            easy_program_count = details['easy_program_count']
            hard_program_count = details['hard_program_count']
            medium_program_count = details['medium_program_count']

            generated_questions["duration"] = total_duration
            generated_questions["weightage"] = tds.data['weightage']
            generated_questions[language] = []
            generated_questions[language].extend(get_random_mcq_answers(language=language, difficulty=mcq_difficulty, limit=mcq_count))
            generated_questions[language].extend(get_random_program_testcases(language=language, difficulty=Question.EASY, limit=easy_program_count))
            generated_questions[language].extend(get_random_program_testcases(language=language, difficulty=Question.MEDIUM, limit=medium_program_count))
            generated_questions[language].extend(get_random_program_testcases(language=language, difficulty=Question.HARD, limit=hard_program_count))

    json_question_data = json.loads(json.dumps(generated_questions))

    return standard_json_response(data=json_question_data)


def get_random_mcq_answers(language, difficulty, limit):
    if not limit:
        return []

    all_questions = list(Question.objects.filter(type=Question.MULTIPLE_CHOICES, difficulty=difficulty, language__icontains=language).values_list('id', flat=True))

    if limit > len(all_questions):
        limit = len(all_questions)

    limited_random_questions = random.sample(all_questions, limit)
    question_answers = MultipleChoicesAnswerSerializer(MultipleChoicesAnswer.objects.filter(question__in=limited_random_questions), many=True)

    if question_answers:
        return question_answers.data

    return []


def get_random_program_testcases(language, difficulty, limit):
    if not limit:
        return []

    all_questions = list(Question.objects.filter(type=Question.PROGRAMS, difficulty=difficulty, language__icontains=language).values_list('id', flat=True))

    if limit > len(all_questions):
        limit = len(all_questions)

    limited_random_questions = random.sample(all_questions, limit)
    question_answers = ProgramTestCaseSerializer(ProgramTestCase.objects.filter(question__in=limited_random_questions), many=True)

    if question_answers:
        return question_answers.data

    return []


@api_view(('PATCH',))
@permission_classes((IsAuthenticated, ))
def deactivate_test(request):
    if 'testId' not in request.query_params:
        return standard_json_response(message='Required parameter testId is missing.', status_code=status.HTTP_400_BAD_REQUEST)

    test_id = int(request.query_params['testId'])
    if test_id <= 0:
        return standard_json_response(message='testId must be positive integer.', status_code=status.HTTP_400_BAD_REQUEST)

    try:
        test_details = TestsDetails.objects.get(id=test_id)
        # deactiavte test
        test_details.is_active = not test_details.is_active
        test_details.save()
        return standard_json_response(message='Test Deactivated')
    
    except TestsDetails.DoesNotExist as e:
        return standard_json_response(message='Test does not exist', status_code=status.HTTP_404_NOT_FOUND)

@api_view(('POST',))
@permission_classes((IsAuthenticated, ))
def generate_test_link(request):
    tas = TestAllocationsSerialiazer(data=request.data)

    if not tas.is_valid():
        return standard_json_response(message=tas.errors, status_code=status.HTTP_400_BAD_REQUEST)

    tas.save()

    return standard_json_response(data=tas.data, status_code=status.HTTP_201_CREATED)


@api_view(('GET',))
@permission_classes((IsAuthenticated, ))
def get_test_link(request):
    test_link = TestAllocations.objects.all()
    test_link_json = TestAllocationsSerialiazer(test_link, many=True).data
    return standard_json_response(data=test_link_json)


@api_view(('POST',))
def add_user_test_details(request):
    user_details = request.data
    try:
        test_allocation = TestAllocations.objects.get(key=request.data.pop('key'))
        user_details["test_allocation"] = test_allocation.id
    except TestAllocations.DoesNotExist as e:
        return standard_json_response(message='Test does not exist', status_code=status.HTTP_404_NOT_FOUND)
    
    user_exists = UserTests.objects.filter(email=user_details['email']).last()
    user_details = UserTestsSerialiazer(instance = user_exists, data=user_details)
    
    if not user_details.is_valid():
        return standard_json_response(message=user_details.errors, status_code=status.HTTP_400_BAD_REQUEST)

    user_details.save()

    return standard_json_response(data=user_details.data, status_code=status.HTTP_201_CREATED)


@api_view(('POST',))
def upload_captured_image(request):
    user_test_id = request.data.get('userTestId')
    image_src = request.data.get('imageSrc')
    if not user_test_id or not image_src or not image_src.startswith('data:image/jpeg;base64,'):
        return standard_json_response(message='User Test Id & Image required', status_code=status.HTTP_400_BAD_REQUEST)

    try:
        user_test = UserTests.objects.get(id=user_test_id)
    except UserTests.DoesNotExist:
        return standard_json_response(message='Test does not exist', status_code=status.HTTP_404_NOT_FOUND)

    # TODO: See if scope for image compression, in order to save space
    image_data = bytes(image_src.split('data:image/jpeg;base64,')[1], 'utf-8')
    image_file_name = str(user_test_id) + "_" + timezone.now().strftime('%Y%m%d_%H%M%S') + ".png"
    with open(settings.UPLOAD_DIR + image_file_name, "wb") as fh:
        fh.write(base64.decodebytes(image_data))

    if not user_test.captured_image_locations:
        user_test.captured_image_locations = []

    user_test.captured_image_locations.append(image_file_name)
    user_test.save()

    return standard_json_response(message='Upload success')

@api_view(('POST',))
def save_candidate_answer(request):
    """
    Request JSON:
    for question_type = 1
        {
            "userTestId": 76,
            "question_details": {
                "id": 77,
                "all_languages": "[{\"language\": \"python\"}]",
                "name": "Is python a programming language?",
                "type": 1,
                "difficulty": 1,
                "language": "python",
                "duration": null
            },
            "candidate_answers": "Yes",
            "completed": false,
            "score": {
                "score": 1,
                "correctAnswers": 1,
                "wrongAnswers": 0
            }
        }
    for question_type = 2
        {
        "method": "POST",
        "url": "https://code-compiler.p.rapidapi.com/v2",
        "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "X-RapidAPI-Key": "2358689225msh15b5fa9413dee5dp15f73fjsn537192df7f4f",
            "X-RapidAPI-Host": "code-compiler.p.rapidapi.com"
        },
        "data": {
            "LanguageChoice": "5",
            "Program": "a,b=[int(x) for x in input().split()]\nprint(a+b)",
            "Input": ""
        },
        "userTestId": 76,
        "q_type": 2
    }
    """

    user_test_id = request.data.get('userTestId')
    user_details = request.data
    if not user_test_id:
        return standard_json_response(message='User Test Id required', status_code=status.HTTP_400_BAD_REQUEST)

    try:
        user_test = UserTests.objects.get(id=user_test_id)
    except UserTests.DoesNotExist:
        return standard_json_response(message='Test does not exist', status_code=status.HTTP_404_NOT_FOUND)

    data = user_test.generated_question

    # Find the variable key dynamically
    variable_key = next(key for key in data.keys() if isinstance(data[key], list))
    if "question_details" in user_details:
        q_type = user_details["question_details"]["type"]
        question_id = user_details["question_details"]["id"]
    else:
        q_type = None

    data_dict = data[variable_key][0]  
    for key, value in data_dict.items():
        if key.startswith('question_details'):
            lang = value["language"]
            if q_type == 1:
                user_test.completed = user_details["completed"]
                score = 0
                if user_details["question_details"]["id"] == question_id:
                    if "candidate_answers" in  user_details:
                        user_test.generated_question["Python"][0]["candidate_answers"] = user_details["candidate_answers"]
                    
                    if user_details["score"]:
                        user_score, user_test.correct_answers,  user_test.wrong_answer  = user_details["score"].values()
                        if q_type == 1:
                            score = user_test.correct_answers * 5
                            user_test.score += score

            else:
                score = verify_coding_answer(request, None)
                user_test.score += score

        if user_test.completed:
            user_test.submission_date = datetime.today()
            
        user_test.save()

    user_details = UserTestsSerialiazer(instance = user_test)
  
    return standard_json_response(data=user_details.data, status_code=status.HTTP_201_CREATED)


def verify_coding_answer(request, q_type):
    # data = {
    #     'python': [
                    # {
                    #     'option1': 'Yes',
                    #     'option2': 'No',
                    #     'option3': None,
                    #     'option4': None,
                    #     'question': 77,
                    #     'correct_value': 'Yes',
                    #     'question_details': {
                    #         'id': 77,
                    #         'name': 'Is python a programming language?',
                    #         'type': 1,
                    #         'duration': None,
                    #         'language': 'python',
                    #         'difficulty': 1,
                    #         'all_languages': '[{"language": "python"}]'
                    #     },
                    #     'candidate_answers': 'Yes'
                    # }, {
                    #     'case1': "{'arg1': 2, 'arg2': 5, 'res': 7}",
                    #     'case2': "{'arg1': 1, 'arg2': 3, 'res': 4}",
                    #     'case3': "{'arg1': 2, 'arg2': 1, 'res': 3}",
                    #     'case4': "{'arg1': 2, 'arg2': 10, 'res': 12}",
                    #     'question': 79,
                    #     'question_details': {
                    #         'id': 79,
                    #         'name': 'Is python a programming language?',
                    #         'type': 2,
                    #         'duration': None,
                    #         'language': 'python',
                    #         'difficulty': 2,
                    #         'all_languages': '[{"language": "python"}]'
                    #     },
                    #     'candidate_answers': None
                    # }]
    #     'duration': 1800,
    #     'weightage': None
    # }

    import requests
    if not q_type:
        return 0
    weightage_map = {1: 5, 2: 10, 3: 15}
    total_score = 0
    user_test_id = request.data.get('userTestId')
    if not user_test_id:
        return standard_json_response(message='User Test Id required', status_code=status.HTTP_400_BAD_REQUEST)

    try:
        user_test = UserTests.objects.get(id=user_test_id)
    except UserTests.DoesNotExist:
        return standard_json_response(message='Test does not exist', status_code=status.HTTP_404_NOT_FOUND)

    data = user_test.generated_question


    variable_key = next(key for key in data.keys() if isinstance(data[key], list))

    cases = []

    for item in data[variable_key]:
        # Check if the dictionary contains 'case1', 'case2', 'case3', and 'case4' keys
        if all(f'case{i}' in item for i in range(1, 5)):
            cases.append(item)

    parsed_cases = {}
    difficulty = 0
    for key, value in cases[0].items():
        if key.startswith('question_details'):
            difficulty = value["difficulty"]
    
        if key.startswith('case'):
            parsed_cases[key] = eval(value)
    non_blank_case_count = sum(1 for case_data in parsed_cases.values() if any(case_data.values()))
    print("Number of non-blank cases:", non_blank_case_count)
    weightage_per_question = weightage_map[difficulty] / non_blank_case_count

    for case_name, case_data in parsed_cases.items():
        args = {key: value for key, value in case_data.items() if key.startswith('arg')}
        result = case_data['res']
        
        values_str = ' '.join(str(value) for value in args.values())

        code = request.data["data"]["Program"].replace("\n", ";")
        request.data["data"]["Program"] = code
        request.data["data"]["Input"] = values_str
        payload = request.data["data"]
        url = request.data["url"]
        headers = request.data["headers"]
        response = requests.post(url, data=payload, headers=headers)
        
        res = response.json()
        if res["Result"].replace("\n", "") == str(result):
            total_score += weightage_per_question
    
    return total_score