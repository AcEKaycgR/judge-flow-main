from django.urls import path
from . import views

urlpatterns = [
    path('', views.problems_list, name='problems_list'),
    path('<int:problem_id>/', views.problem_detail, name='problem_detail'),
    
    path('submissions/', views.user_submissions, name='user_submissions'),
    path('submissions/<int:submission_id>/', views.submission_detail, name='submission_detail'),
]