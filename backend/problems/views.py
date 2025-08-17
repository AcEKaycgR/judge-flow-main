from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.contrib.auth.models import User
import json
from .models import Problem, Submission, Tag, TestCase, PendingQuestion

# This is a placeholder for the actual code execution logic
# which would likely involve a separate service, sandboxing, etc.
# The actual implementation has been moved to the compiler app.

@csrf_exempt
def problems_list(request):
    if request.method == 'GET':
        # Get approved problems (regular problems only)
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
                'is_pending': False,  # Regular problems are not pending
            })
        
        return JsonResponse({'problems': problems_data})

@csrf_exempt
def problem_detail(request, problem_id):
    if request.method == 'GET':
        # Try to get approved problem first
        try:
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
                ],
                'is_pending': False,  # Regular problems are not pending
            }
            
            return JsonResponse({'problem': problem_data})
        except:
            return JsonResponse({'error': 'Problem not found'}, status=404)

@csrf_exempt
def user_submissions(request):
    if request.method == 'GET':
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
            
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
def submission_detail(request, submission_id):
    if request.method == 'GET':
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
            
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

@csrf_exempt
def submit_pending_question(request):
    if request.method == 'POST':
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        
        try:
            data = json.loads(request.body)
            title = data.get('title')
            description = data.get('description')
            difficulty = data.get('difficulty')
            constraints = data.get('constraints', '')
            tag_names = data.get('tags', [])
            
            if not title or not description or not difficulty:
                return JsonResponse({'error': 'Title, description, and difficulty are required'}, status=400)
            
            # Create pending question
            pending_question = PendingQuestion.objects.create(
                title=title,
                description=description,
                difficulty=difficulty,
                constraints=constraints,
                created_by=request.user
            )
            
            # Handle tags
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(name=tag_name)
                pending_question.tags.add(tag)
            
            return JsonResponse({'success': True, 'message': 'Question submitted for approval'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def pending_questions_list(request):
    if request.method == 'GET':
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        
        # Check if user is admin
        if not request.user.is_staff:
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        # Get all pending questions
        pending_questions = PendingQuestion.objects.all()
        
        # Filter by approval status
        approved = request.GET.get('approved', '')
        if approved == 'true':
            pending_questions = pending_questions.filter(is_approved=True)
        elif approved == 'false':
            pending_questions = pending_questions.filter(is_approved=False)
        
        # Serialize pending questions
        questions_data = []
        for question in pending_questions:
            questions_data.append({
                'id': question.id,
                'title': question.title,
                'description': question.description,
                'difficulty': question.difficulty,
                'constraints': question.constraints,
                'tags': [tag.name for tag in question.tags.all()],
                'created_by': question.created_by.username,
                'created_at': question.created_at.isoformat(),
                'is_approved': question.is_approved,
            })
        
        return JsonResponse({'questions': questions_data})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def approve_pending_question(request, question_id):
    if request.method == 'POST':
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        
        # Check if user is admin
        if not request.user.is_staff:
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        try:
            # Get the pending question
            pending_question = get_object_or_404(PendingQuestion, id=question_id)
            
            # Create a new Problem from the pending question
            problem = Problem.objects.create(
                title=pending_question.title,
                description=pending_question.description,
                difficulty=pending_question.difficulty,
                constraints=pending_question.constraints
            )
            
            # Copy tags
            for tag in pending_question.tags.all():
                problem.tags.add(tag)
            
            # Mark as approved
            pending_question.is_approved = True
            pending_question.save()
            
            return JsonResponse({'success': True, 'message': 'Question approved successfully'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def reject_pending_question(request, question_id):
    if request.method == 'POST':
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        
        # Check if user is admin
        if not request.user.is_staff:
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        try:
            # Get the pending question and delete it
            pending_question = get_object_or_404(PendingQuestion, id=question_id)
            pending_question.delete()
            
            return JsonResponse({'success': True, 'message': 'Question rejected successfully'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def delete_problem(request, problem_id):
    if request.method == 'DELETE':
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        
        # Check if user is admin
        if not request.user.is_staff:
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        try:
            # Get the problem and delete it
            problem = get_object_or_404(Problem, id=problem_id)
            problem.delete()
            
            return JsonResponse({'success': True, 'message': 'Problem deleted successfully'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)