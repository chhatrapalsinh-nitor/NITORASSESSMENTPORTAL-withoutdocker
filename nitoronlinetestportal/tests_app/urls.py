"""nitoronlinetestportal URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path

from tests_app.views import *

urlpatterns = [
    path('create_update_test/', create_update_test),
    path('get_test_list/', get_test_list),
    path('generate_test/', generate_test),
    path('deactivate_test/', deactivate_test),
    path('generate_test_link/', generate_test_link),
    path('get_test_link/', get_test_link),
    path('add_user_test_details/', add_user_test_details),
    path('save_candidate_answer/', save_candidate_answer),
    path('upload_captured_image/', upload_captured_image)
]
