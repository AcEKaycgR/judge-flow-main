from django.urls import path
from . import views

urlpatterns = [
    path('run-code/', views.run_code, name='run_code'),
    path('submit-solution/', views.submit_solution, name='submit_solution'),
    path('ai-review/', views.ai_review, name='ai_review'),
]