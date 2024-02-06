from django.db import models
from datetime import timedelta

from questions.basemodel import BaseModel
from django.contrib.auth.models import User


class Question(BaseModel):
    MULTIPLE_CHOICES = 1
    PROGRAMS = 2

    EASY = 1
    MEDIUM = 2
    HARD = 3

    QUESTIONS_TYPE = (
        (MULTIPLE_CHOICES, 'Multiple Choices'),
        (PROGRAMS, 'Programs'),
    )

    DIFFICULTY = (
        (EASY, 'Easy'),
        (MEDIUM, 'Medium'),
        (HARD, 'Hard'),
    )

    name = models.CharField(max_length=5000, null=False)
    type = models.IntegerField(default=MULTIPLE_CHOICES, choices=QUESTIONS_TYPE)
    difficulty = models.IntegerField(default=EASY, choices=DIFFICULTY)
    language = models.CharField(max_length=500, null=True)
    duration = models.DurationField(null=True)
    created_by = models.ForeignKey(User, related_name="question_created_by", null=True, on_delete=models.CASCADE)
    updated_by = models.ForeignKey(User, related_name="question_updated_by", null=True, on_delete=models.CASCADE)

    @property
    def question_duration(self):
        "returns duration based on the type and level of difficulty of the question"
        durations = {
            (1, 1): timedelta(minutes=1),
            (1, 2): timedelta(minutes=3),
            (1, 3): timedelta(minutes=5),
            (2, 1): timedelta(minutes=15),
            (2, 2): timedelta(minutes=30),
            (2, 3): timedelta(minutes=45)
        }

        return durations.get((self.type, self.difficulty)).seconds


class MultipleChoicesAnswer(BaseModel):
    option1 = models.CharField(max_length=5000, null=True)
    option2 = models.CharField(max_length=5000, null=True)
    option3 = models.CharField(max_length=5000, null=True)
    option4 = models.CharField(max_length=5000, null=True)
    correct_value = models.CharField(max_length=5000, null=True)
    question = models.ForeignKey(Question, related_name='muliple_choice_answers', null=False, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, related_name="choice_created_by", null=True, on_delete=models.CASCADE)
    updated_by = models.ForeignKey(User, related_name="choice_updated_by", null=True, on_delete=models.CASCADE)


class ProgramTestCase(BaseModel):
    case1 = models.CharField(max_length=5000, null=True)
    case2 = models.CharField(max_length=5000, null=True)
    case3 = models.CharField(max_length=5000, null=True)
    case4 = models.CharField(max_length=5000, null=True)
    question = models.ForeignKey(Question, related_name='program_test_cases', null=False, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, related_name="program_test_created_by", null=True, on_delete=models.CASCADE)
    updated_by = models.ForeignKey(User, related_name="program_test_updated_by", null=True, on_delete=models.CASCADE)
