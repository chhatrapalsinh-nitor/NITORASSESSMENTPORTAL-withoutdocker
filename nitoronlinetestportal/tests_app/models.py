import uuid

from django.db import models

from questions.basemodel import BaseModel
from django.contrib.auth.models import User


class TestsDetails(BaseModel):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=500, null=True)
    total_questions = models.IntegerField(default=0)
    question_details = models.JSONField(max_length=20000)
    is_active = models.BooleanField(default=False)
    duration = models.DurationField(null=True)
    weightage = models.IntegerField(null=True, blank=True)
    end_date = models.DateTimeField(null=True)
    created_by = models.ForeignKey(User, related_name="test_detail_created_by", null=True, on_delete=models.CASCADE)
    updated_by = models.ForeignKey(User, related_name="test_detail_updated_by", null=True, on_delete=models.CASCADE)



class TestAllocations(BaseModel):
    name = models.CharField(max_length=500, null=True)
    key = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    test = models.ForeignKey(TestsDetails, related_name='test_allocations', null=False, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, related_name="test_allocations_created_by", null=True, on_delete=models.CASCADE)
    updated_by = models.ForeignKey(User, related_name="test_allocations_updated_by", null=True, on_delete=models.CASCADE)


class UserTests(BaseModel):
    first_name = models.CharField(max_length=50, null=True)
    last_name = models.CharField(max_length=50, null=True)
    email = models.CharField(max_length=500, null=True)
    test_allocation = models.ForeignKey(TestAllocations, related_name='user_tests', null=False, on_delete=models.CASCADE)
    correct_answers = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    score = models.FloatField(default=0)
    generated_question = models.JSONField(default=list)
    submission_date = models.DateTimeField(auto_now=False, blank=True, null=True)
    captured_image_locations = models.JSONField(max_length=10000, default=list, null=True)
    created_by = models.ForeignKey(User, related_name="user_tests_created_by", null=True, on_delete=models.CASCADE)
    updated_by = models.ForeignKey(User, related_name="user_tests_updated_by", null=True, on_delete=models.CASCADE)
