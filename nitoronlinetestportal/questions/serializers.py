import json

from rest_framework import serializers

from .models import MultipleChoicesAnswer, ProgramTestCase, Question


class QuestionSerializer(serializers.ModelSerializer):
    all_languages = serializers.SerializerMethodField()
    class Meta:
        model = Question
        fields = '__all__'
        extra_kwargs = {
            'name': {'required': True},
            'type': {'required': True},
            'difficulty': {'required': True},
            'language': {'required': True},
        }

    def create(self, validated_data):
        return Question.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.update(**validated_data)
        return instance.get()
    
    def get_all_languages(self, obj):
        return json.dumps(list(Question.objects.values("language").distinct()))



class MultipleChoicesAnswerSerializer(serializers.ModelSerializer):
    question_details = QuestionSerializer(source='question', read_only=True)
    candidate_answers = serializers.CharField(required=False, allow_null=True)
    class Meta:
        model = MultipleChoicesAnswer
        fields = ('option1', 'option2', 'option3', 'option4', 'correct_value', 'question', 'question_details', 'candidate_answers')
        extra_kwargs = {
            'option1': {'required': True},
            'option2': {'required': True},
            'correct_value': {'required': True},
            'question': {'required': True},
        }

    def validate_question(self, question):
        return Question.objects.get(id=question.id)

    def create(self, validated_data):
        return MultipleChoicesAnswer.objects.create(**validated_data)

    def update(self, instance, validated_data):
        MultipleChoicesAnswer.objects.filter(pk=instance.id).update(**validated_data)
        return instance


class ProgramTestCaseSerializer(serializers.ModelSerializer):
    question_details = QuestionSerializer(source='question', read_only=True)
    candidate_answers = serializers.CharField(required=False, allow_null=True)
    class Meta:
        model = ProgramTestCase
        fields = ('case1', 'case2', 'case3', 'case4', 'question', 'question_details', 'candidate_answers')
        extra_kwargs = {
            'case1': {'required': True},
            'case2': {'required': True},
            'case3': {'required': True},
            'case4': {'required': True},
            'question': {'required': True},
        }

    def validate_question(self, question):
        return Question.objects.get(id=question.id)

    def create(self, validated_data):
        return ProgramTestCase.objects.create(**validated_data)

    def update(self, instance, validated_data):
        ProgramTestCase.objects.filter(pk=instance.id).update(**validated_data)
        return instance