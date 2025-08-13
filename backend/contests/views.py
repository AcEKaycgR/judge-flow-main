from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils import timezone
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