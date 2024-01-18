from django.contrib import admin

from questions.models import MultipleChoicesAnswer, ProgramTestCase, Question

# Register your models here.
admin.site.register(Question)
admin.site.register(MultipleChoicesAnswer)
admin.site.register(ProgramTestCase)
