from django.urls import path
from . import views

urlpatterns = [
    path('', views.problems_list, name='problems_list'),
    path('<int:problem_id>/', views.problem_detail, name='problem_detail'),
    
    path('submissions/', views.user_submissions, name='user_submissions'),
    path('submissions/<int:submission_id>/', views.submission_detail, name='submission_detail'),
    
    # Pending questions endpoints
    path('submit-pending-question/', views.submit_pending_question, name='submit_pending_question'),
    path('pending-questions/', views.pending_questions_list, name='pending_questions_list'),
    path('approve-pending-question/<int:question_id>/', views.approve_pending_question, name='approve_pending_question'),
    path('reject-pending-question/<int:question_id>/', views.reject_pending_question, name='reject_pending_question'),
    
    # Problem management endpoints
    path('delete-problem/<int:problem_id>/', views.delete_problem, name='delete_problem'),
]