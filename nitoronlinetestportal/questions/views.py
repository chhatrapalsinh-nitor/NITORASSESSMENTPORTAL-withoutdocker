from django.core.paginator import EmptyPage, Paginator
from django.db import transaction

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from questions.models import MultipleChoicesAnswer, ProgramTestCase, Question
from utils.response_handlers import standard_json_response

from .serializers import (MultipleChoicesAnswerSerializer,
                          ProgramTestCaseSerializer, QuestionSerializer)


@api_view(('GET',))
@permission_classes((IsAuthenticated, ))
def get_question_list(request):
    """
        Returns list of questions
    """
    filter_params = {
        'language': request.query_params["language"] if "language" in request.query_params else "python"
    }
    allowed_keys = ['id', 'language', 'type', 'difficulty']
    for key, value in request.query_params.items():
        if key in allowed_keys:
            filter_params[key] = value

    page = request.query_params.get('page', 1)
    page_size = request.query_params.get('page_size', 10)

    questions = Question.objects.filter(**filter_params)
    paginator = Paginator(questions, page_size)
    try:
        paginated_data = paginator.page(page)
    except EmptyPage:
        # if we exceed the page limit we return the last page 
        paginated_data = paginator.page(paginator.num_pages)
    questions_data = QuestionSerializer(paginated_data, many=True).data

    return standard_json_response(data=questions_data)


@api_view(('POST',))
@permission_classes((IsAuthenticated, ))
def add_question(request):
    """
    JSON for add questions :

        For MCQ :
        {
            "name" : "Question 2",
            "type" : 2,
            "difficulty": 1,
            "language": "python
            "multiple_options": {
                "option1": "A",
                "option2": "B",
                "correct_value": "A"
            }
        }
        For programs:
        {
        "name" : "Question 2",
        "type" : 2,
        "difficulty": 1,
        "program_test_cases": {
            "case1": "A",
            "case2": "B",
            "case3": "C",
            "case4": "D"
        }
        }
    """
    if not isinstance(request.data, dict) or not request.data:
        return standard_json_response(message='request data must be non-emtpy object', status_code=status.HTTP_400_BAD_REQUEST)

    request_body = request.data.get("values")

    if not isinstance(request_body, dict) or not request_body:
        return standard_json_response(message='request body must be non-emtpy object', status_code=status.HTTP_400_BAD_REQUEST)

    mcq = request_body.get('multiple_options')
    programs = request_body.get('program_test_cases')

    if not mcq and not programs:
        return standard_json_response(message='either multiple_options or program_test_cases must be present', status_code=status.HTTP_400_BAD_REQUEST)

    if (mcq and not isinstance(mcq, dict)) or (programs and not isinstance(programs, dict)):
        return standard_json_response(message='multiple_options or program_test_cases must be dictionary', status_code=status.HTTP_400_BAD_REQUEST)

    question = None
    if "id" in request.data:
        question = Question.objects.filter(id=request.data.get("id"))

    qs = QuestionSerializer(instance=question, data=request_body)
    
    if not qs.is_valid():
        return standard_json_response(message='question with name, type, diffiulty and langauge is required', status_code=status.HTTP_400_BAD_REQUEST)

    response = {}
    try:
        with transaction.atomic():
            question_obj = qs.save()
            if question_obj.type == Question.MULTIPLE_CHOICES:
                if not mcq:
                    raise Exception('question type 1 should have multiple_options')
                mcq['question'] = question_obj.id
                mcq_detail = MultipleChoicesAnswer.objects.filter(question_id=question_obj.id).last()
                mca_serializer = MultipleChoicesAnswerSerializer(instance=mcq_detail, data=mcq)
                if not mca_serializer.is_valid():
                    raise Exception(str(mca_serializer.errors))
                mca_serializer.save()
                response = mca_serializer.data
            else:
                if not programs:
                    raise Exception('question type 2 should have program_test_cases')
                programs['question'] = question_obj.id
                program_detail = ProgramTestCase.objects.filter(question_id=question_obj.id).last()
                ptc_serializer = ProgramTestCaseSerializer(instance=program_detail, data=programs)

                if not ptc_serializer.is_valid():
                    raise Exception(str(ptc_serializer.errors))
                ptc_serializer.save()
                response = ptc_serializer.data
    except Exception as exc:
        return standard_json_response(message=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    return standard_json_response(data=response, status_code=status.HTTP_201_CREATED)


@api_view(('POST',))
@permission_classes((IsAuthenticated, ))
def bulk_questions(request):
    """
    Sample valide request body = {
        "mcq": [
            {
                "name": "Q1",
                "type": 1,
                "difficulty": 2,
                "language": "python",
                "option1": "False",
                "option2": "True",
                "correct_value": "False"
            },
            {
                "name": "Q2",
                "type": 1,
                "difficulty": 2,
                "language": "python",
                "option1": "1",
                "option2": "2",
                "option3": "3",
                "option4": "4",
                "correct_value": "2"
            }
        ],
        "programs": [
            {
                "name": "Q3",
                "type": 2,
                "difficulty": 2,
                "language": "python",
                "case1": "1",
                "case2": "2",
                "case3": "3",
                "case4": "4"
            }
        ]
    }
    """

    request_body = request.data

    if not isinstance(request_body, dict) or not request_body:
        return standard_json_response(message='request body must be non-emtpy object', status_code=status.HTTP_400_BAD_REQUEST)

    mcq = request_body.get('mcq')
    programs = request_body.get('programs')

    if not mcq and not programs:
        return standard_json_response(message='either mcq or programs must be present and should not be empty', status_code=status.HTTP_400_BAD_REQUEST)

    if (mcq and not isinstance(mcq, list)) or (programs and not isinstance(programs, list)):
        return standard_json_response(message='mcq must be list', status_code=status.HTTP_400_BAD_REQUEST)

    if mcq:
        try:
            validated_mcq_questions = validate_questions(mcq)
            bulk_create_objects(validated_mcq_questions, mcq, MultipleChoicesAnswerSerializer, MultipleChoicesAnswer)
        except Exception as exc:
            return standard_json_response(message=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    if programs:
        try:
            validated_programs_questions = validate_questions(programs)
            bulk_create_objects(validated_programs_questions, programs, ProgramTestCaseSerializer, ProgramTestCase)
        except Exception as exc:
            return standard_json_response(message=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    return standard_json_response(message='Questions uploaded successfully', status_code=status.HTTP_201_CREATED)


def validate_questions(question_data):
    """
    Validates json data if matching with QuestionSerializer requirement and returns Question model instances

    Args:
        question_data (list) - List of dictionaries containing question model data

    Returns:
        List of Question model object

    Raises:
        Exception object | Can throw custom exception as per need

    e.g.
        question_data = [
            {
                "name": "Q1",
                "type": 1,
                "difficulty": 2,
                "language": "python",
                ...
            },
            ...
        ]
        validated_questions = [
            Question(...),
            ...
        ]
    """
    validated_questions = []
    for obj in question_data:
        q_serializer = QuestionSerializer(data=obj)
        if not q_serializer.is_valid():
            raise Exception('question with name, type, diffiulty and langauge is required')
        validated_questions.append(Question(**q_serializer.validated_data))
    return validated_questions


def bulk_create_objects(validated_questions, model_data, model_serializer, model):
    """
    Bulk creates Question objects.
    Validates model_data if matching with model_serializer requirement. If matching then bulk creates model objects.

    Args:
        validated_questions (list) - List of Question model objects
        model_data (list) - List of dictionaries containing model data
        model_serializer - Serializer class for validaing model_data
        model - Model class for creating model object & doing bulk_create operation

    Returns:
        None

    Raises:
        Exception object | Can throw custom exception as per need
    """
    with transaction.atomic():
        # Need to improve this by writing in batches
        question_objects = Question.objects.bulk_create(validated_questions)
        validated_model_data = []
        for index, obj in enumerate(model_data):
            # Note: below line works only for postgresql database
            # Read more: https://docs.djangoproject.com/en/3.0/ref/models/querysets/#bulk-create
            obj['question'] = question_objects[index].id
            serializer = model_serializer(data=obj)
            if not serializer.is_valid():
                raise Exception(str(serializer.errors))
            validated_model_data.append(model(**serializer.validated_data))

        model.objects.bulk_create(validated_model_data)

@api_view(('DELETE',))
@permission_classes((IsAuthenticated, ))
def delete_question(request):
    request_body = request.data
    if not isinstance(request_body, dict) or not request_body:
        return standard_json_response(message='request body must be non-emtpy object', status_code=status.HTTP_400_BAD_REQUEST)
   

    question_id = request_body.get('id')

    if question_id:
        Question.objects.filter(id=question_id).delete()        
        return standard_json_response(message='Question Deleted successfully', status_code=status.HTTP_200_OK)

    return standard_json_response(message='Question Id is required', status_code=status.HTTP_400_BAD_REQUEST)


@api_view(('GET',))
@permission_classes((IsAuthenticated, ))
def get_question_details(request, question_id, question_type):
    if question_id:
        if question_type=="1":
            questions = MultipleChoicesAnswer.objects.filter(question_id=question_id).last()
            detail_json = MultipleChoicesAnswerSerializer(questions).data
        if question_type=="2":
            program_detail = ProgramTestCase.objects.filter(question_id=question_id).last()
            detail_json = ProgramTestCaseSerializer(program_detail).data
        return standard_json_response(data=detail_json)
    return standard_json_response(message='Question Id is required', status_code=status.HTTP_400_BAD_REQUEST)
