from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db.models import Q
import json
from .models import Problem, Submission, Tag

@csrf_exempt
def problems_list(request):
    if request.method == 'GET':
        problems = Problem.objects.all()
        
        # Filter by search term
        search = request.GET.get('search', '')
        if search:
            problems = problems.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search)
            )
        
        # Filter by tags
        tags = request.GET.get('tags', '')
        if tags:
            tag_list = tags.split(',')
            problems = problems.filter(tags__name__in=tag_list).distinct()
        
        # Filter by difficulty
        difficulty = request.GET.get('difficulty', '')
        if difficulty:
            problems = problems.filter(difficulty=difficulty)
        
        # Serialize problems
        problems_data = []
        for problem in problems:
            problems_data.append({
                'id': problem.id,
                'title': problem.title,
                'difficulty': problem.difficulty,
                'tags': [tag.name for tag in problem.tags.all()],
            })
        
        return JsonResponse({'problems': problems_data})

@csrf_exempt
def problem_detail(request, problem_id):
    if request.method == 'GET':
        problem = get_object_or_404(Problem, id=problem_id)
        
        problem_data = {
            'id': problem.id,
            'title': problem.title,
            'description': problem.description,
            'difficulty': problem.difficulty,
            'constraints': problem.constraints,
            'sample_input': problem.sample_input,
            'sample_output': problem.sample_output,
            'tags': [tag.name for tag in problem.tags.all()],
        }
        
        return JsonResponse({'problem': problem_data})

@csrf_exempt
@login_required
def submit_solution(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        problem_id = data.get('problem_id')
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        # Get problem
        problem = get_object_or_404(Problem, id=problem_id)
        
        # Create submission
        submission = Submission.objects.create(
            user=request.user,
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

@csrf_exempt
@login_required
def user_submissions(request):
    if request.method == 'GET':
        submissions = Submission.objects.filter(user=request.user).select_related('problem').order_by('-submitted_at')
        
        submissions_data = []
        for submission in submissions:
            submissions_data.append({
                'id': submission.id,
                'problem_id': submission.problem.id,
                'problem_title': submission.problem.title,
                'status': submission.status,
                'language': submission.language,
                'runtime': submission.runtime,
                'submitted_at': submission.submitted_at.isoformat(),
            })
        
        return JsonResponse({'submissions': submissions_data})