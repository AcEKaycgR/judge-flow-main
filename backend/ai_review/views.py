from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db.models import Q
import json
from .models import ComprehensiveAIReview
from problems.models import Submission, Problem
from contests.models import ContestSubmission


def generate_mock_ai_feedback(submissions):
    """
    Generate mock AI feedback based on user's submission history
    """
    feedback = "# Comprehensive AI Code Review\n\n"
    
    # Stats section
    total_submissions = len(submissions)
    accepted_count = sum(1 for s in submissions if s.get('status') == 'accepted')
    accuracy_rate = (accepted_count / total_submissions * 100) if total_submissions > 0 else 0
    
    feedback += "## Your Coding Statistics\n\n"
    feedback += f"- Total submissions: {total_submissions}\n"
    feedback += f"- Accepted solutions: {accepted_count}\n"
    feedback += f"- Accuracy rate: {accuracy_rate:.1f}%\n\n"
    
    # Common patterns
    feedback += "## Common Patterns Identified\n\n"
    feedback += "1. **Strength**: You consistently solve easy and medium problems correctly.\n"
    feedback += "2. **Opportunity**: Consider more edge case testing in your solutions.\n"
    feedback += "3. **Improvement**: Try optimizing time complexity for better performance.\n\n"
    
    # Learning recommendations
    feedback += "## Personalized Learning Recommendations\n\n"
    
    feedback += "### YouTube Videos\n\n"
    feedback += "- [Data Structures and Algorithms](https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O) - Comprehensive playlist on DS&A\n"
    feedback += "- [Dynamic Programming](https://www.youtube.com/watch?v=OQ5jsbhAv_M) - MIT lecture on DP\n"
    feedback += "- [System Design Fundamentals](https://www.youtube.com/watch?v=quLrc3PbuIw) - Essential for interviews\n\n"
    
    feedback += "### Courses\n\n"
    feedback += "- [Algorithms Specialization](https://www.coursera.org/specializations/algorithms) - Stanford University on Coursera\n"
    feedback += "- [Machine Learning](https://www.coursera.org/learn/machine-learning) - Andrew Ng's famous course\n\n"
    
    feedback += "### Books\n\n"
    feedback += "- *Cracking the Coding Interview* by Gayle Laakmann McDowell\n"
    feedback += "- *Introduction to Algorithms* by Cormen, Leiserson, Rivest, and Stein\n"
    feedback += "- *Clean Code* by Robert C. Martin\n\n"
    
    feedback += "### Practice Problems\n\n"
    feedback += "1. [Two Sum](/questions/1) - Practice hash tables\n"
    feedback += "2. [Longest Palindromic Substring](/questions/5) - Dynamic programming\n"
    feedback += "3. [Merge Intervals](/questions/56) - Array manipulation\n\n"
    
    feedback += "## Overall Assessment\n\n"
    if accuracy_rate >= 80:
        feedback += "Excellent work! Your success rate is high. Keep practicing to maintain and improve your skills.\n"
    elif accuracy_rate >= 60:
        feedback += "Good progress! You're solving problems consistently. Focus on the areas where you're struggling.\n"
    else:
        feedback += "Keep practicing! Everyone starts somewhere. Focus on understanding the fundamentals and practice regularly.\n"
    
    return feedback


@csrf_exempt
@login_required
def comprehensive_ai_review(request):
    """
    Generate a comprehensive AI review based on all user submissions
    """
    if request.method == 'POST':
        # Get user's recent submissions (both regular and contest)
        problem_submissions = Submission.objects.filter(
            user=request.user
        ).select_related('problem').order_by('-submitted_at')[:10]
        
        contest_submissions = ContestSubmission.objects.filter(
            user=request.user
        ).select_related('problem', 'contest').order_by('-submitted_at')[:10]
        
        # Combine all submissions
        all_submissions = []
        
        # Add problem submissions
        for submission in problem_submissions:
            all_submissions.append({
                'id': submission.id,
                'problem_id': submission.problem.id,
                'problem_title': submission.problem.title,
                'status': submission.status,
                'language': submission.language,
                'runtime': submission.runtime,
                'submitted_at': submission.submitted_at.isoformat(),
                'is_contest': False,
            })
        
        # Add contest submissions
        for submission in contest_submissions:
            all_submissions.append({
                'id': submission.id,
                'problem_id': submission.problem.id,
                'problem_title': f"[Contest] {submission.problem.title}",
                'status': submission.status,
                'language': submission.language,
                'runtime': submission.runtime,
                'submitted_at': submission.submitted_at.isoformat(),
                'is_contest': True,
                'contest_name': submission.contest.name,
            })
        
        # Sort by submission time (newest first)
        all_submissions.sort(key=lambda x: x['submitted_at'], reverse=True)
        
        # Generate mock AI feedback
        feedback = generate_mock_ai_feedback(all_submissions)
        
        # Save the AI review
        ai_review = ComprehensiveAIReview.objects.create(
            user=request.user,
            feedback=feedback,
        )
        
        return JsonResponse({
            'feedback': feedback,
            'review_id': ai_review.id,
        })
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
@login_required
def problem_ai_review(request, problem_id):
    """
    Generate AI review for a specific problem based on user's attempts
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        code = data.get('code', '')
        
        # Get problem
        problem = get_object_or_404(Problem, id=problem_id)
        
        # Get user's submissions for this problem
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
        
        feedback += "\n## Resources\n\n"
        feedback += "- [Problem Discussion](#) - Community solutions and explanations\n"
        feedback += "- [Similar Problems](#) - Practice with related concepts\n\n"
        
        feedback += "## Overall\n\n"
        feedback += "Your solution looks good overall. Keep practicing to improve further!\n"
        
        # Save the AI review
        ai_review = ComprehensiveAIReview.objects.create(
            user=request.user,
            feedback=feedback,
        )
        
        return JsonResponse({
            'feedback': feedback,
            'review_id': ai_review.id,
        })
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)
