from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db import transaction
import json
from .models import Contest, ContestSubmission
from problems.models import Problem

@csrf_exempt
def contests_list(request):
    if request.method == 'GET':
        contests = Contest.objects.all().order_by('-start_time')
        
        contests_data = []
        for contest in contests:
            contests_data.append({
                'id': contest.id,
                'name': contest.name,
                'start_time': contest.start_time.isoformat(),
                'end_time': contest.end_time.isoformat(),
                'problem_count': contest.problems.count(),
                'is_active': contest.start_time <= timezone.now() <= contest.end_time,
            })
        
        return JsonResponse({'contests': contests_data})

@csrf_exempt
def contest_detail(request, contest_id):
    if request.method == 'GET':
        contest = get_object_or_404(Contest, id=contest_id)
        
        contest_data = {
            'id': contest.id,
            'name': contest.name,
            'start_time': contest.start_time.isoformat(),
            'end_time': contest.end_time.isoformat(),
            'problems': [],
            'is_active': contest.start_time <= timezone.now() <= contest.end_time,
        }
        
        # Add problems
        for problem in contest.problems.all():
            contest_data['problems'].append({
                'id': problem.id,
                'title': problem.title,
                'difficulty': problem.difficulty,
            })
        
        return JsonResponse({'contest': contest_data})

@csrf_exempt
@login_required
def create_contest(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        start_time_str = data.get('start_time')
        end_time_str = data.get('end_time')
        problem_ids = data.get('problem_ids', [])
        
        # Validate required fields
        if not name or not start_time_str or not end_time_str:
            return JsonResponse({'error': 'Name, start_time, and end_time are required'}, status=400)
        
        try:
            # Parse datetime strings
            from django.utils.dateparse import parse_datetime
            start_time = parse_datetime(start_time_str)
            end_time = parse_datetime(end_time_str)
            
            if not start_time or not end_time:
                return JsonResponse({'error': 'Invalid datetime format'}, status=400)
            
            # Validate that end_time is after start_time
            if start_time >= end_time:
                return JsonResponse({'error': 'End time must be after start time'}, status=400)
            
            # Create contest within a transaction
            with transaction.atomic():
                contest = Contest.objects.create(
                    name=name,
                    start_time=start_time,
                    end_time=end_time,
                )
                
                # Add problems to contest
                if problem_ids:
                    problems = Problem.objects.filter(id__in=problem_ids)
                    contest.problems.set(problems)
                
                # Return success response
                return JsonResponse({
                    'id': contest.id,
                    'name': contest.name,
                    'start_time': contest.start_time.isoformat(),
                    'end_time': contest.end_time.isoformat(),
                    'problem_count': contest.problems.count(),
                }, status=201)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
@login_required
def contest_submissions(request, contest_id):
    if request.method == 'GET':
        contest = get_object_or_404(Contest, id=contest_id)
        
        # Get submissions for this contest by the current user
        submissions = ContestSubmission.objects.filter(
            contest=contest,
            user=request.user
        ).select_related('problem').order_by('-submitted_at')
        
        submissions_data = []
        for submission in submissions:
            submissions_data.append({
                'id': submission.id,
                'problem_id': submission.problem.id,
                'problem_title': submission.problem.title,
                'status': submission.status,
                'language': submission.language,
                'runtime': submission.runtime,
                'memory': submission.memory,
                'submitted_at': submission.submitted_at.isoformat(),
            })
        
        return JsonResponse({'submissions': submissions_data})

@csrf_exempt
@login_required
def submit_contest_solution(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        contest_id = data.get('contest_id')
        problem_id = data.get('problem_id')
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        # Get contest and problem
        contest = get_object_or_404(Contest, id=contest_id)
        problem = get_object_or_404(Problem, id=problem_id)
        
        # Check if contest is active
        if not (contest.start_time <= timezone.now() <= contest.end_time):
            return JsonResponse({'error': 'Contest is not active'}, status=400)
        
        # Create contest submission
        submission = ContestSubmission.objects.create(
            user=request.user,
            contest=contest,
            problem=problem,
            code=code,
            language=language,
            status='accepted',  # For simplicity, we'll assume all submissions are accepted
        )
        
        # For now, we'll mock the evaluation
        result = {
            'status': 'accepted',
            'runtime': 0.01,
            'memory': 10.5,
        }
        
        # Update submission with results
        submission.status = result['status']
        submission.runtime = result['runtime']
        submission.memory = result['memory']
        submission.save()
        
        return JsonResponse({
            'submission_id': submission.id,
            'status': submission.status,
            'runtime': submission.runtime,
            'memory': submission.memory,
        })