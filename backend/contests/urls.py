from django.urls import path
from . import views

urlpatterns = [
    path('', views.contests_list, name='contests_list'),
    path('<int:contest_id>/', views.contest_detail, name='contest_detail'),
    path('<int:contest_id>/submissions/', views.contest_submissions, name='contest_submissions'),
    path('create/', views.create_contest, name='create_contest'),
    path('submit/', views.submit_contest_solution, name='submit_contest_solution'),
]