import os
import json
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from problems.models import Problem, Submission
from .models import AIReviewResult, ProgressSnapshot

# Import Gemini AI library
try:
    import google.generativeai as genai
    from dotenv import load_dotenv
    load_dotenv()
    
    # Configure Gemini AI
    api_key = "AIzaSyAo_g2y-0RJqCtYRDAjUmlL23hjLg3aSG8"
    if api_key:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
    else:
        model = None
except ImportError:
    model = None
    print("Google Generative AI library not installed. Using fallback analysis.")

def try_parse_json(text):
    """Parse text as json if possible, else return fallback suggestion payload."""
    text = (text or "").strip()
    # Defensive: If text is empty or invalid, return special dict
    if not text:
        return {
            "completion_percentage": 0,
            "implemented_correctly": [],
            "missing_components": [],
            "suggestions": ["No response from Gemini."],
            "code_quality": "No output from Gemini.",
            "next_steps": []
        }
    try:
        if text.startswith("{") or text.startswith("["):
            return json.loads(text)
        # Not a json, but not empty – fall through
        return {
            "completion_percentage": 0,
            "implemented_correctly": [],
            "missing_components": [],
            "suggestions": [text],
            "code_quality": "Gemini did not return JSON, see suggestions.",
            "next_steps": []
        }
    except Exception as e:
        print("[Gemini AI] JSON parse error:", e, "| RAW:", repr(text))  # For debugging
        return {
            "completion_percentage": 0,
            "implemented_correctly": [],
            "missing_components": [],
            "suggestions": [f"AI output could not be parsed. Raw response: {text}"],
            "code_quality": "Could not analyze; response was not valid JSON.",
            "next_steps": []
        }

class GeminiCodeAnalyzer:
    def _safe_generate(self, prompt: str):
        """Helper to safely call Gemini and always return text or fallback."""
        if not model:
            return None
        try:
            response = model.generate_content(prompt)
            # The response object has .text in recent versions,
            # but we also safeguard if it's missing
            if hasattr(response, "text") and response.text:
                return response.text
            elif hasattr(response, "candidates") and response.candidates:
                parts = response.candidates[0].content.parts
                if parts:
                    return parts[0].text
            return None
        except Exception as e:
            print(f"[Gemini] API call failed: {e}")
            return None

    def analyze_code_completion(self, question_text, user_code, language):
        prompt = f"""
Analyze this coding problem and the user's solution:

PROBLEM:
{question_text}

USER CODE ({language}):
{user_code}

Return a JSON object with:
- completion_percentage
- implemented_correctly (list)
- missing_components (list)
- suggestions (list)
- code_quality (string)
- next_steps (list)
Respond only as a JSON object.
"""
        output = self._safe_generate(prompt)
        if not output:
            return self._fallback_code_analysis(question_text, user_code, language)
        return try_parse_json(output)

    def provide_failure_tips(self, question_text, user_code, failed_tests, language):
        failed_test_info = "\n".join(
            f"Test {i+1}:\nInput: {t.get('input')}\nExpected: {t.get('expected')}\nGot: {t.get('actual')}\n"
            for i, t in enumerate(failed_tests[:3])
        )
        prompt = f"""
A student's code failed some test cases:

PROBLEM:
{question_text}

USER CODE ({language}):
{user_code}

FAILED TEST CASES:
{failed_test_info}

Return a JSON object with:
- failure_reasons (list)
- identified_bugs (list)
- debugging_steps (list)
- hints (list)
- common_mistakes (list)
- suggested_fixes (list)
Respond only as a JSON object.
"""
        output = self._safe_generate(prompt)
        if not output:
            return self._fallback_failure_tips(question_text, user_code, failed_tests, language)
        return try_parse_json(output)

    def get_coding_suggestions(self, question_text, user_code, language):
        prompt = f"""
Review this code and provide suggestions for improvement:

PROBLEM:
{question_text}

USER CODE ({language}):
{user_code}

Return a JSON object with:
- optimization_tips (list)
- best_practices (list)
- alternative_approaches (list)
- performance_notes (list)
- readability_tips (list)
- overall_feedback (string)
Respond only as a JSON object.
"""
        output = self._safe_generate(prompt)
        if not output:
            return self._fallback_coding_suggestions(question_text, user_code, language)
        return try_parse_json(output)

    
    def _fallback_code_analysis(self, question_text, user_code, language):
        """Fallback implementation when Gemini is not available"""
        lines_of_code = len(user_code.split('\n'))
        score = 75.0
        
        # Adjust score based on code characteristics
        if lines_of_code > 100:
            score -= 10  # Penalty for overly verbose code
        elif lines_of_code < 10:
            score -= 5   # Penalty for potentially too concise code
        
        if 'TODO' in user_code:
            score -= 5   # Penalty for incomplete code
        
        # Ensure score is within bounds
        score = max(0, min(100, score))
        
        return {
            "completion_percentage": int(score),
            "implemented_correctly": ["Basic structure implemented"],
            "missing_components": ["Advanced error handling", "Edge case coverage"],
            "suggestions": ["Add comments to explain complex logic", "Consider refactoring to reduce code complexity"],
            "code_quality": "Good basic implementation with room for improvement",
            "next_steps": ["Add comprehensive test cases", "Optimize for performance"]
        }
    
    def _fallback_failure_tips(self, question_text, user_code, failed_tests, language):
        """Fallback implementation for failure tips"""
        return {
            "failure_reasons": ["Logic error", "Edge case not handled"],
            "identified_bugs": ["Potential off-by-one error", "Incorrect variable initialization"],
            "debugging_steps": ["Add print statements to trace execution", "Check boundary conditions"],
            "hints": ["Review the problem constraints", "Test with edge cases"],
            "common_mistakes": ["Not handling empty inputs", "Incorrect loop bounds"],
            "suggested_fixes": ["Initialize variables correctly", "Add boundary checks"]
        }
    
    def _fallback_coding_suggestions(self, question_text, user_code, language):
        """Fallback implementation for coding suggestions"""
        return {
            "optimization_tips": ["Consider using built-in functions", "Reduce nested loops"],
            "best_practices": ["Add comments for complex logic", "Use meaningful variable names"],
            "alternative_approaches": ["Recursive solution", "Dynamic programming approach"],
            "performance_notes": ["Time complexity could be improved", "Space complexity is acceptable"],
            "readability_tips": ["Break down complex functions", "Use consistent formatting"],
            "overall_feedback": "Good implementation with opportunities for optimization"
        }

# Initialize the analyzer
analyzer = GeminiCodeAnalyzer()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comprehensive_ai_review(request):
    """
    Get a comprehensive AI review of the user's coding progress and performance.
    """
    try:
        # Get user's submission statistics
        total_submissions = Submission.objects.filter(user=request.user).count()
        accepted_submissions = Submission.objects.filter(user=request.user, status='accepted').count()
        
        # Calculate accuracy
        accuracy_rate = 0
        if total_submissions > 0:
            accuracy_rate = round((accepted_submissions / total_submissions) * 100, 2)
        
        # Get category breakdown
        category_stats = {}
        problems_solved = Submission.objects.filter(user=request.user, status='accepted').values_list('problem_id', flat=True).distinct()
        problems = Problem.objects.filter(id__in=problems_solved)
        
        for problem in problems:
            for tag in problem.tags.all():
                if tag.name not in category_stats:
                    category_stats[tag.name] = {'total': 0, 'solved': 0}
                category_stats[tag.name]['solved'] += 1
            
            # Count total problems by tags
            for tag in problem.tags.all():
                if tag.name not in category_stats:
                    category_stats[tag.name] = {'total': 0, 'solved': 0}
                category_stats[tag.name]['total'] += 1
        
        # Get all problems and update total counts
        all_problems = Problem.objects.all()
        for problem in all_problems:
            for tag in problem.tags.all():
                if tag.name not in category_stats:
                    category_stats[tag.name] = {'total': 0, 'solved': 0}
                category_stats[tag.name]['total'] += 1
        
        # Generate textual feedback
        feedback = generate_comprehensive_feedback(
            total_submissions, 
            accepted_submissions, 
            accuracy_rate, 
            category_stats
        )

        # --- NEW: Get last 25 submissions for AI-based structured recommendations ---
# --- NEW: Get last 25 submissions for AI-based structured recommendations ---
        last_submissions = Submission.objects.filter(user=request.user).order_by('-submitted_at')[:25]
        submission_summaries = [
            f"Problem: {s.problem.title}\nStatus: {s.status}\nCode:\n{s.code[:200]}...\n"
            for s in last_submissions
            ]

        recommendations_prompt = f"""
        The following are the user's last {len(last_submissions)} coding submissions:

        {''.join(submission_summaries)}

        Based on this, recommend the following in JSON:
        - practice_problems: list of problem topics or titles to attempt next
        - courses: list of {{ "title": str, "url": str }}
        - youtube_videos: list of {{ "title": str, "url": str }}
        - errors_to_avoid: list of common mistakes the user repeatedly makes
        """
        recommendations_output = analyzer._safe_generate(recommendations_prompt)
        recommendations = try_parse_json(recommendations_output)

        # Create or update progress snapshot
        ProgressSnapshot.objects.create(
            user=request.user,
            total_submissions=total_submissions,
            accepted_submissions=accepted_submissions,
            accuracy_rate=accuracy_rate,
            category_breakdown=category_stats
        )
        
        # Final response
        response_data = {
            'feedback': feedback,
            'overall_score': accuracy_rate,
            'category_scores': category_stats,
            'total_submissions': total_submissions,
            'accepted_submissions': accepted_submissions,
            'accuracy_rate': accuracy_rate,
            'recommendations': recommendations  # <-- NEW FIELD
        }
        
        return Response(response_data)
        
    except Exception as e:
        import traceback, sys
        print("=== ERROR in problem_ai_review ===")
        traceback.print_exc(file=sys.stdout)  # full stack trace
        return Response({'error': repr(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def problem_ai_review(request, problem_id):
    """
    Get AI review for a specific problem submission.
    Instead of raw JSON, return a short brief, a hint, and a simple code snippet.
    """
    try:
        # Get the problem
        problem = get_object_or_404(Problem, id=problem_id)
        
        # Get request data
        code = request.data.get('code', '')
        
        # Use Gemini AI to analyze the code
        ai_analysis = analyzer.analyze_code_completion(
            problem.description,
            code,
            request.data.get('language', 'python')
        )
        
        # Generate feedback (markdown style like before)
        feedback = generate_problem_feedback_from_ai(ai_analysis, problem)
        overall_score = ai_analysis.get('completion_percentage', 75)

        # --- NEW: turn AI JSON into short summary + hint + snippet ---
        summary_brief = ai_analysis.get("code_quality", "No quality feedback available.")
        hints = ai_analysis.get("suggestions", []) or ai_analysis.get("next_steps", [])
        hint_text = hints[0] if hints else "Try reviewing your logic against the problem constraints."

        snippet = ""
        if ai_analysis.get("identified_bugs"):
            bug = ai_analysis["identified_bugs"][0]
            snippet = f"# Possible fix idea:\n# {bug}\n"

        # Ensure a submission exists
        submission = Submission.objects.filter(
            user=request.user,
            problem=problem
        ).first()
        if not submission:
            submission = Submission.objects.get_or_create(
                user=request.user,
                problem=problem,
                code=code,
                language=request.data.get('language', 'python'),
                status='pending'
            )

        # Save AI review result
        AIReviewResult.objects.update_or_create(
            submission=submission,
            defaults={
                "feedback": feedback,
                "overall_score": overall_score,
            }
        )


        # Final response
        response_data = {
            'feedback': feedback,
            'overall_score': overall_score,
            'summary': summary_brief,  # <-- NEW
            'hint': hint_text,         # <-- NEW
            'snippet': snippet         # <-- NEW
        }
        
        return Response(response_data)
        
    except Exception as e:
        import traceback, sys
        print("=== ERROR in problem_ai_review ===")
        traceback.print_exc(file=sys.stdout)  # full stack trace
        return Response({'error': repr(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_progress(request):
    """
    Get user progress data for visualization.
    """
    try:
        # Get progress snapshots for the user
        snapshots = ProgressSnapshot.objects.filter(user=request.user).order_by('snapshot_date')
        
        progress_data = []
        for snapshot in snapshots:
            progress_data.append({
                'date': snapshot.snapshot_date.isoformat(),
                'total_submissions': snapshot.total_submissions,
                'accepted_submissions': snapshot.accepted_submissions,
                'accuracy_rate': float(snapshot.accuracy_rate),
            })
        
        # Get latest category breakdown
        latest_snapshot = snapshots.last()
        category_breakdown = latest_snapshot.category_breakdown if latest_snapshot else {}
        
        response_data = {
            'progress_data': progress_data,
            'category_breakdown': category_breakdown,
        }
        
        return Response(response_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def generate_comprehensive_feedback(total_submissions, accepted_submissions, accuracy_rate, category_stats):
    """
    Generate comprehensive feedback based on user's performance.
    """
    feedback = f"# Comprehensive AI Code Review\n\n"
    feedback += f"## Overall Statistics\n\n"
    feedback += f"Total Submissions: {total_submissions}\n"
    feedback += f"Accepted Solutions: {accepted_submissions}\n"
    feedback += f"Accuracy Rate: {accuracy_rate}%\n\n"
    
    feedback += f"## Category Performance\n\n"
    for category, stats in category_stats.items():
        if stats['total'] > 0:
            category_accuracy = round((stats['solved'] / stats['total']) * 100, 2)
            feedback += f"### {category}\n"
            feedback += f"- Problems Solved: {stats['solved']}/{stats['total']}\n"
            feedback += f"- Accuracy: {category_accuracy}%\n\n"
    
    feedback += f"## Recommendations\n\n"
    if accuracy_rate < 50:
        feedback += "- Focus on understanding problem requirements before coding\n"
        feedback += "- Practice more easy-level problems to build confidence\n"
        feedback += "- Review fundamental programming concepts\n\n"
    elif accuracy_rate < 75:
        feedback += "- Continue practicing regularly\n"
        feedback += "- Focus on improving code efficiency\n"
        feedback += "- Review failed submissions to understand mistakes\n\n"
    else:
        feedback += "- Excellent progress! Keep challenging yourself with harder problems\n"
        feedback += "- Consider participating in coding contests\n"
        feedback += "- Help others by sharing your solutions\n\n"
    
    feedback += f"## Next Steps\n\n"
    feedback += "- Set a daily coding goal\n"
    feedback += "- Focus on your weakest categories\n"
    feedback += "- Review and refactor old solutions for better efficiency\n"
    
    return feedback

def generate_problem_feedback_from_ai(ai_analysis, problem):
    """
    Generate feedback for a specific problem submission based on AI analysis.
    """
    feedback = f"# Code Review for {problem.title}\n\n"
    
    # Add AI analysis results
    feedback += f"## AI Analysis Results\n\n"
    feedback += f"Completion Percentage: {ai_analysis.get('completion_percentage', 0)}%\n"
    feedback += f"Code Quality: {ai_analysis.get('code_quality', 'Not analyzed')}\n\n"
    
    # Implemented correctly
    implemented = ai_analysis.get('implemented_correctly', [])
    if implemented:
        feedback += f"## What You Implemented Well\n\n"
        for item in implemented:
            feedback += f"- {item}\n"
        feedback += "\n"
    
    # Missing components
    missing = ai_analysis.get('missing_components', [])
    if missing:
        feedback += f"## Missing Components\n\n"
        for item in missing:
            feedback += f"- {item}\n"
        feedback += "\n"
    
    # Suggestions
    suggestions = ai_analysis.get('suggestions', [])
    if suggestions:
        feedback += f"## Suggestions for Improvement\n\n"
        for item in suggestions:
            feedback += f"- {item}\n"
        feedback += "\n"
    
    # Next steps
    next_steps = ai_analysis.get('next_steps', [])
    if next_steps:
        feedback += f"## Next Steps\n\n"
        for item in next_steps:
            feedback += f"- {item}\n"
        feedback += "\n"
    
    return feedback