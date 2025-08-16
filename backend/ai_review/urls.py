from django.urls import path
from . import views

urlpatterns = [
    path('comprehensive-ai-review/', views.comprehensive_ai_review, name='comprehensive-ai-review'),
    path('problems/<int:problem_id>/ai-review/', views.problem_ai_review, name='problem-ai-review'),
    path('user-progress/', views.user_progress, name='user-progress'),
]