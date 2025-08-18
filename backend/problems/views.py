from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import json
from .models import Problem, Submission, Tag, TestCase, PendingQuestion
import traceback
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
        try:
            problem = Problem.objects.get(id=problem_id)
            problem_data = {
                'id': problem.id,
                'title': problem.title,
                'description': problem.description,
                'difficulty': problem.difficulty,
                'tags': [tag.name for tag in problem.tags.all()],
                'constraints': problem.constraints,
                'test_cases': []
            }
            
            # Only include non-hidden test cases for display
            test_cases = problem.test_cases.filter(is_hidden=False)
            for test_case in test_cases:
                problem_data['test_cases'].append({
                    'input_data': test_case.input_data,
                    'expected_output': test_case.expected_output,
                })
            
            return JsonResponse({'problem': problem_data})
        except Problem.DoesNotExist:
            return JsonResponse({'error': 'Problem not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_pending_question(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        title = data.get('title')
        description = data.get('description')
        difficulty = data.get('difficulty', 'easy')
        constraints = data.get('constraints', '')
        tags = data.get('tags', [])
        test_cases = data.get('test_cases', [])
        
        # Validate required fields
        if not title or not description:
            return JsonResponse({'error': 'Title and description are required'}, status=400)
        
        try:
            # Validate and store test cases
            if not test_cases:
                return JsonResponse({'error': 'At least one test case is required'}, status=400)

            for i, test_case in enumerate(test_cases):
                if 'input_data' not in test_case or 'expected_output' not in test_case:
                    return JsonResponse({'error': f'Test case {i+1} must have both input and expected output'}, status=400)

            # Create pending question with test cases data
            pending_question = PendingQuestion.objects.create(
                title=title,
                description=description,
                difficulty=difficulty,
                constraints=constraints,
                test_cases_data=test_cases,  # Store test cases data
                created_by=request.user
            )
            
            # Handle tags
            tag_names = [tag.strip() for tag in tags if tag.strip()]
            for tag_name in tag_names:
                tag, created = Tag.objects.get_or_create(name=tag_name)
                pending_question.tags.add(tag)
            
            return JsonResponse({'success': True, 'message': 'Question submitted for approval'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_questions_list(request):
    if request.method == 'GET':
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
        
        pending_questions_data = []
        for question in pending_questions:
            pending_questions_data.append({
                'id': question.id,
                'title': question.title,
                'description': question.description,
                'difficulty': question.difficulty,
                'tags': [tag.name for tag in question.tags.all()],
                'created_by': question.created_by.username,
                'created_at': question.created_at.isoformat(),
                'is_approved': question.is_approved,
                'test_cases_count': len(question.test_cases_data) if question.test_cases_data else 0,
            })
        
        return JsonResponse({'pending_questions': pending_questions_data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_pending_question(request, question_id):
    if request.method == 'POST':
        # Check if user is admin
        if not request.user.is_staff:
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        try:
            # Get the pending question
            pending_question = get_object_or_404(PendingQuestion, id=question_id)
            
            # Create the actual problem
            problem = Problem.objects.create(
                title=pending_question.title,
                description=pending_question.description,
                difficulty=pending_question.difficulty,
                constraints=pending_question.constraints
            )
            
            # Add tags
            problem.tags.set(pending_question.tags.all())
            
            # Create test cases if they exist
            if pending_question.test_cases_data:
                for test_case_data in pending_question.test_cases_data:
                    TestCase.objects.create(
                        problem=problem,
                        input_data=test_case_data['input_data'],
                        expected_output=test_case_data['expected_output'],
                        is_hidden=test_case_data.get('is_hidden', False)
                    )
            
            # Mark as approved
            pending_question.is_approved = True
            pending_question.save()
            
            return JsonResponse({'success': True, 'message': 'Question approved successfully'})
        except Exception as e:
            print("❌ Approval error:", str(e))
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_pending_question(request, question_id):
    if request.method == 'POST':
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

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_problem(request, problem_id):
    if request.method == 'DELETE':
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