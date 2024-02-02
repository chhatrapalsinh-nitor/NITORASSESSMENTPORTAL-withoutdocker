import random
from datetime import timedelta
from questions.serializers import (MultipleChoicesAnswerSerializer,
                                   ProgramTestCaseSerializer)
from questions.models import MultipleChoicesAnswer, ProgramTestCase, Question

def get_total_duration(question_details):
    duration = timedelta(minutes=0)
    EASY_MCQ_COUNT = "easy_mcq_count"
    MEDIUM_MCQ_COUNT = "medium_mcq_count"
    HARD_MCQ_COUNT = "hard_mcq_count"

    time_mapping = {
        EASY_MCQ_COUNT: timedelta(minutes=1),
        MEDIUM_MCQ_COUNT: timedelta(minutes=3),
        HARD_MCQ_COUNT: timedelta(minutes=5)
    }

    program_mapping = {
        'easy_program_count': timedelta(minutes=15),
        'medium_program_count': timedelta(minutes=30),
        'hard_program_count': timedelta(minutes=45)
    }

    for i in question_details:
        easy_mcq_count = int(i.get(EASY_MCQ_COUNT, 0))
        medium_mcq_count = int(i.get(MEDIUM_MCQ_COUNT, 0))
        hard_mcq_count = int(i.get(HARD_MCQ_COUNT, 0))
        duration += (time_mapping.get(EASY_MCQ_COUNT, timedelta()) * easy_mcq_count +
                    time_mapping.get(MEDIUM_MCQ_COUNT, timedelta()) * medium_mcq_count +
                    time_mapping.get(HARD_MCQ_COUNT, timedelta()) * hard_mcq_count)

        for key, value in program_mapping.items():
            program_count = int(i.get(key, 0))
            duration += value * program_count
    return duration


def get_random_mcq_answers(language, difficulty, limit):
    if not limit:
        return []

    all_questions = list(Question.objects.filter(type=Question.MULTIPLE_CHOICES, difficulty=difficulty, language__icontains=language).values_list('id', flat=True))

    if limit > len(all_questions):
        if difficulty == Question.EASY :
            difficulty_level = "Easy"
        elif difficulty == Question.MEDIUM :
            difficulty_level = "Medium"
        elif difficulty == Question.HARD :
            difficulty_level = "Hard"
        raise Exception(f"There are not enough {difficulty_level} MCQ question, As, we have only {len(all_questions)} Existing {difficulty_level} MCQs")


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
        if difficulty == Question.EASY :
            difficulty_level = "Easy"
        elif difficulty == Question.MEDIUM :
            difficulty_level = "Medium"
        elif difficulty == Question.HARD :
            difficulty_level = "Hard"
        raise Exception(f"There are not enough {difficulty_level} Programs. As, we have only {len(all_questions)} Existing {difficulty_level} Programs")

    limited_random_questions = random.sample(all_questions, limit)
    question_answers = ProgramTestCaseSerializer(ProgramTestCase.objects.filter(question__in=limited_random_questions), many=True)

    if question_answers:
        return question_answers.data

    return []


def validate_single_question_details(details):
    language = details['language']
    easy_mcq_count = details['easy_mcq_count']
    medium_mcq_count = details['medium_mcq_count']
    hard_mcq_count = details['hard_mcq_count']
    easy_program_count = details['easy_program_count']
    hard_program_count = details['hard_program_count']
    medium_program_count = details['medium_program_count']
    
    random_easy_mcq = get_random_mcq_answers(language=language, difficulty=Question.EASY, limit=easy_mcq_count)
    random_medium_mcq = get_random_mcq_answers(language=language, difficulty=Question.MEDIUM, limit=medium_mcq_count)
    random_hard_mcq = get_random_mcq_answers(language=language, difficulty=Question.HARD, limit=hard_mcq_count)
    random_easy_program = get_random_program_testcases(language=language, difficulty=Question.EASY, limit=easy_program_count)
    random_medium_program = get_random_program_testcases(language=language, difficulty=Question.MEDIUM, limit=medium_program_count)
    random_hard_program = get_random_program_testcases(language=language, difficulty=Question.HARD, limit=hard_program_count)

    return random_easy_mcq, random_medium_mcq, random_hard_mcq, random_easy_program, random_medium_program, random_hard_program
