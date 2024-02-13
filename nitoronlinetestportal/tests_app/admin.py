from django.contrib import admin

from tests_app.models import TestsDetails, TestAllocations, UserTests

# Register your models here.
admin.site.register(TestsDetails)
admin.site.register(TestAllocations)
admin.site.register(UserTests)
