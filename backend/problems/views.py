from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db.models import Q
import json
from .models import Problem, Submission, Tag, TestCase

# This is a placeholder for the actual code execution logic
# which would likely involve a separate service, sandboxing, etc.
# The actual implementation has been moved to the compiler app.

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
        
        # Get only the shown test cases (where is_hidden is False)
        shown_test_cases = problem.test_cases.filter(is_hidden=False)
        
        problem_data = {
            'id': problem.id,
            'title': problem.title,
            'description': problem.description,
            'difficulty': problem.difficulty,
            'constraints': problem.constraints,
            'tags': [tag.name for tag in problem.tags.all()],
            'test_cases': [
                {
                    'input_data': test_case.input_data,
                    'expected_output': test_case.expected_output
                }
                for test_case in shown_test_cases
            ]
        }
        
        return JsonResponse({'problem': problem_data})

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

@csrf_exempt
@login_required
def submission_detail(request, submission_id):
    if request.method == 'GET':
        submission = get_object_or_404(Submission, id=submission_id, user=request.user)
        
        submission_data = {
            'id': submission.id,
            'problem_id': submission.problem.id,
            'problem_title': submission.problem.title,
            'code': submission.code,
            'language': submission.language,
            'status': submission.status,
            'runtime': submission.runtime,
            'memory': submission.memory,
            'test_case_results': submission.test_case_results,
            'submitted_at': submission.submitted_at.isoformat(),
        }
        
        return JsonResponse({'submission': submission_data})