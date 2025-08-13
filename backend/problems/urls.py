from django.urls import path
from . import views

urlpatterns = [
    path('problems/', views.problems_list, name='problems_list'),
    path('problems/<int:problem_id>/', views.problem_detail, name='problem_detail'),
    path('submit/', views.submit_solution, name='submit_solution'),
    path('submissions/', views.user_submissions, name='user_submissions'),
]