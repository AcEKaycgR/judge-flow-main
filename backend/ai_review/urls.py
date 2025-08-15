from django.urls import path
from . import views

urlpatterns = [
    path('comprehensive-ai-review/', views.comprehensive_ai_review, name='comprehensive_ai_review'),
    path('problem-ai-review/<int:problem_id>/', views.problem_ai_review, name='problem_ai_review'),
]