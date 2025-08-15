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
        
        return JsonResponse({'submission': submission_data})@csrf_exempt
@login_required
def problem_ai_review(request, problem_id):
    """
    Generate AI review for a specific problem and user's code
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            code = data.get('code', '')
            
            # Get problem
            problem = get_object_or_404(Problem, id=problem_id)
            
            # Get user's previous submissions for this problem
            submissions = Submission.objects.filter(
                user=request.user,
                problem=problem
            ).order_by('-submitted_at')[:5]
            
            # Generate mock AI feedback for this specific problem
            feedback = f"# AI Review for Problem: {problem.title}\n\n"
            
            # Analyze the code
            lines = code.split('\n')
            feedback += f"## Code Analysis\n\n"
            feedback += f"- Your solution has {len(lines)} lines of code\n"
            
            # Check for common constructs
            if 'for' in code or 'while' in code:
                feedback += "- Uses loops appropriately\n"
            
            if 'def' in code:
                feedback += "- Well-structured with functions\n"
                
            if 'class' in code:
                feedback += "- Object-oriented approach detected\n"
            
            feedback += "\n## Suggestions\n\n"
            feedback += "1. Consider adding comments to explain complex logic\n"
            feedback += "2. Ensure edge cases are handled properly\n"
            feedback += "3. Optimize for time and space complexity if possible\n\n"
            
            feedback += "## Common Issues\n\n"
            if submissions:
                failed_count = sum(1 for s in submissions if s.status != 'accepted')
                if failed_count > 0:
                    feedback += f"- You've had {failed_count} failed attempts. Review test cases carefully.\n"
                else:
                    feedback += "- Your previous submissions were successful. Good job!\n"
            else:
                feedback += "- This is your first attempt at this problem. Good luck!\n"
            
            feedback += "\n## Learning Resources\n\n"
            feedback += "### YouTube Videos\n\n"
            feedback += "- [Data Structures and Algorithms](https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O) - Comprehensive playlist on DS&A\n"
            feedback += "- [Dynamic Programming](https://www.youtube.com/watch?v=OQ5jsbhAv_M) - MIT lecture on DP\n\n"
            
            feedback += "### Courses\n\n"
            feedback += "- [Algorithms Specialization](https://www.coursera.org/specializations/algorithms) - Stanford University on Coursera\n"
            feedback += "- [Machine Learning](https://www.coursera.org/learn/machine-learning) - Andrew Ng's famous course\n\n"
            
            feedback += "### Books\n\n"
            feedback += "- *Cracking the Coding Interview* by Gayle Laakmann McDowell\n"
            feedback += "- *Introduction to Algorithms* by Cormen, Leiserson, Rivest, and Stein\n\n"
            
            feedback += "### Practice Problems\n\n"
            feedback += "1. [Two Sum](/questions/1) - Practice hash tables\n"
            feedback += "2. [Longest Palindromic Substring](/questions/5) - Dynamic programming\n"
            feedback += "3. [Merge Intervals](/questions/56) - Array manipulation\n\n"
            
            feedback += "## Overall Assessment\n\n"
            feedback += "Your solution looks good overall. Keep practicing to improve further!\n"
            
            return JsonResponse({
                'feedback': feedback,
            })
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)