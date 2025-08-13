from django.urls import path
from . import views

urlpatterns = [
    path('contests/', views.contests_list, name='contests_list'),
    path('contests/<int:contest_id>/', views.contest_detail, name='contest_detail'),
    path('contests/submit/', views.submit_contest_solution, name='submit_contest_solution'),
]