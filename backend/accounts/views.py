from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.utils import timezone
import json
from problems.models import Problem, Submission
from contests.models import Contest

@csrf_exempt
def user_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            })
        else:
            return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=400)

@csrf_exempt
def user_signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'error': 'Username already exists'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'error': 'Email already exists'}, status=400)
        
        # Create user
        user = User.objects.create_user(username=username, email=email, password=password)
        
        # Log in the user
        login(request, user)
        
        return JsonResponse({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        })

@csrf_exempt
@login_required
def user_logout(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'success': True})

@csrf_exempt
@login_required
def user_profile(request):
    if request.method == 'GET':
        user = request.user
        return JsonResponse({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        })

@csrf_exempt
@login_required
def dashboard_data(request):
    if request.method == 'GET':
        # Get user stats
        total_submissions = Submission.objects.filter(user=request.user).count()
        accepted_submissions = Submission.objects.filter(user=request.user, status='accepted').count()
        
        # Calculate accuracy
        accuracy = 0
        if total_submissions > 0:
            accuracy = round((accepted_submissions / total_submissions) * 100, 2)
        
        # Get upcoming contests
        upcoming_contests = Contest.objects.filter(start_time__gt=timezone.now()).order_by('start_time')[:3]
        
        upcoming_contests_data = []
        for contest in upcoming_contests:
            upcoming_contests_data.append({
                'id': contest.id,
                'name': contest.name,
                'start_time': contest.start_time.isoformat(),
            })
        
        # Get problem stats
        total_problems = Problem.objects.count()
        solved_problems = Submission.objects.filter(user=request.user, status='accepted').values('problem').distinct().count()
        
        data = {
            'stats': {
                'total_submissions': total_submissions,
                'accepted_submissions': accepted_submissions,
                'accuracy': accuracy,
                'total_problems': total_problems,
                'solved_problems': solved_problems,
            },
            'upcoming_contests': upcoming_contests_data,
        }
        
        return JsonResponse(data)