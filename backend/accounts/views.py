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
        
        # Try to authenticate with username first
        user = authenticate(request, username=username, password=password)
        
        # If that fails, try to find a user by email
        if user is None:
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if user is not None:
            login(request, user)
            
            # Debug logging
            print(f"Session key after login: {request.session.session_key}")
            print(f"User authenticated after login: {request.user.is_authenticated}")
            print(f"User after login: {request.user}")
            print(f"Cookies after login: {request.COOKIES}")
            
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
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
                'is_staff': user.is_staff,
            }
        })

@csrf_exempt
def user_logout(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'success': True})

@csrf_exempt
def user_profile(request):
    if request.method == 'GET':
        # Debug logging
        print(f"Session key: {request.session.session_key}")
        print(f"User authenticated: {request.user.is_authenticated}")
        print(f"User: {request.user}")
        print(f"Cookies: {request.COOKIES}")
        
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        
        user = request.user
        return JsonResponse({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
            }
        })

@csrf_exempt
def dashboard_data(request):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        
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