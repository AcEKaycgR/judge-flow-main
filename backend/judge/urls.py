from django.urls import path, include
from . import views

urlpatterns = [
    # Web pages
    path('', views.dashboard, name='dashboard'),
    path('questions/', views.questions, name='questions'),
    path('questions/<int:question_id>/', views.question_detail, name='question_detail'),
    path('playground/', views.playground, name='playground'),
    path('submissions/', views.submissions, name='submissions'),
    path('ai-review/', views.ai_review, name='ai_review'),
    path('ai-review/<int:submission_id>/', views.ai_review, name='ai_review_with_submission'),
    path('contests/', views.contests, name='contests'),
    path('contests/<int:contest_id>/', views.contest_detail, name='contest_detail'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    
    # API endpoints
    path('api/questions/', views.api_questions, name='api_questions'),
    path('api/run-code/', views.api_run_code, name='api_run_code'),
    path('api/submit-code/', views.api_submit_code, name='api_submit_code'),
    path('api/ai-review/', views.api_ai_review, name='api_ai_review'),
    path('api/comprehensive-ai-review/', views.api_comprehensive_ai_review, name='api_comprehensive_ai_review'),
]