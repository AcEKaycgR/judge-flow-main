from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db.models import Count
from .models import Question, Submission, Contest, Tag, AIReview
import json
import subprocess
import tempfile
import os

# Dashboard view
@login_required
def dashboard(request):
    # Get user stats
    total_submissions = Submission.objects.filter(user=request.user).count()
    accepted_submissions = Submission.objects.filter(user=request.user, status='accepted').count()
    
    # Calculate accuracy
    accuracy = 0
    if total_submissions > 0:
        accuracy = round((accepted_submissions / total_submissions) * 100, 2)
    
    # Get upcoming contests
    upcoming_contests = Contest.objects.filter(start_time__gt=timezone.now()).order_by('start_time')[:3]
    
    context = {
        'total_submissions': total_submissions,
        'accepted_submissions': accepted_submissions,
        'accuracy': accuracy,
        'upcoming_contests': upcoming_contests,
    }
    return render(request, 'judge/dashboard.html', context)

# Questions list view
@login_required
def questions(request):
    questions = Question.objects.all()
    tags = Tag.objects.all()
    return render(request, 'judge/questions.html', {'questions': questions, 'tags': tags})

# Question detail view
@login_required
def question_detail(request, question_id):
    question = get_object_or_404(Question, id=question_id)
    return render(request, 'judge/question_detail.html', {'question': question})

# Playground view
@login_required
def playground(request):
    return render(request, 'judge/playground.html')

# Submissions view
@login_required
def submissions(request):
    user_submissions = Submission.objects.filter(user=request.user).select_related('question').order_by('-submitted_at')
    return render(request, 'judge/submissions.html', {'submissions': user_submissions})

# AI Review view
@login_required
def ai_review(request, submission_id=None):
    submission = None
    if submission_id:
        submission = get_object_or_404(Submission, id=submission_id, user=request.user)
    
    return render(request, 'judge/ai_review.html', {'submission': submission})

# Contests view
@login_required
def contests(request):
    contests = Contest.objects.all().order_by('-start_time')
    return render(request, 'judge/contests.html', {'contests': contests})

# Contest detail view
@login_required
def contest_detail(request, contest_id):
    contest = get_object_or_404(Contest, id=contest_id)
    return render(request, 'judge/contest_detail.html', {'contest': contest})

# Login view
def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            return render(request, 'judge/login.html', {'error': 'Invalid username or password'})
    return render(request, 'judge/login.html')

# Signup view
def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard')
    else:
        form = UserCreationForm()
    return render(request, 'judge/signup.html', {'form': form})

# Logout view
@login_required
def logout_view(request):
    logout(request)
    return redirect('login')

# API endpoint to get questions with filtering
@csrf_exempt
def api_questions(request):
    if request.method == 'GET':
        questions = Question.objects.all()
        
        # Filter by search term
        search = request.GET.get('search', '')
        if search:
            questions = questions.filter(title__icontains=search)
        
        # Filter by tags
        tags = request.GET.get('tags', '')
        if tags:
            tag_list = tags.split(',')
            questions = questions.filter(tags__name__in=tag_list).distinct()
        
        # Serialize questions
        questions_data = []
        for question in questions:
            questions_data.append({
                'id': question.id,
                'title': question.title,
                'difficulty': question.difficulty,
                'tags': [tag.name for tag in question.tags.all()],
            })
        
        return JsonResponse({'questions': questions_data})

# API endpoint to run code
@csrf_exempt
def api_run_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        code = data.get('code', '')
        language = data.get('language', 'python')
        input_data = data.get('input', '')
        
        # Run code based on language
        try:
            if language == 'python':
                result = run_python_code(code, input_data)
            elif language == 'javascript':
                result = run_javascript_code(code, input_data)
            elif language == 'cpp':
                result = run_cpp_code(code, input_data)
            else:
                result = {'output': 'Unsupported language', 'error': True}
        except Exception as e:
            result = {'output': str(e), 'error': True}
        
        return JsonResponse(result)

# API endpoint to submit code
@csrf_exempt
def api_submit_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        question_id = data.get('question_id')
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        # Get question
        question = get_object_or_404(Question, id=question_id)
        
        # Create submission
        submission = Submission.objects.create(
            user=request.user,
            question=question,
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

# API endpoint for AI review
@csrf_exempt
def api_ai_review(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        submission_id = data.get('submission_id')
        code = data.get('code', '')
        question_text = data.get('question_text', '')
        
        # Get submission if ID is provided
        submission = None
        if submission_id:
            submission = get_object_or_404(Submission, id=submission_id, user=request.user)
        
        # Generate mock AI feedback
        feedback = generate_mock_ai_feedback(code, question_text)
        
        # Save review if submission exists
        if submission:
            AIReview.objects.create(
                submission=submission,
                feedback=feedback,
            )
        
        return JsonResponse({'feedback': feedback})

# API endpoint for comprehensive AI review based on all submissions
@csrf_exempt
@login_required
def api_comprehensive_ai_review(request):
    if request.method == 'POST':
        # Get user's recent submissions (last 10)
        from problems.models import Submission
        from contests.models import ContestSubmission
        
        # Get regular problem submissions
        problem_submissions = Submission.objects.filter(user=request.user).select_related('problem').order_by('-submitted_at')[:10]
        
        # Get contest submissions
        contest_submissions = ContestSubmission.objects.filter(user=request.user).select_related('problem').order_by('-submitted_at')[:10]
        
        # Combine and sort submissions
        all_submissions = list(problem_submissions) + list(contest_submissions)
        all_submissions.sort(key=lambda x: x.submitted_at, reverse=True)
        all_submissions = all_submissions[:10]  # Limit to 10 most recent
        
        # Generate comprehensive AI feedback
        feedback = generate_comprehensive_ai_feedback(all_submissions)
        
        return JsonResponse({'feedback': feedback})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

# Helper functions for code execution
def run_python_code(code, input_data):
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(code)
        code_file = f.name
    
    try:
        # Run the code
        process = subprocess.run(
            ['python', code_file],
            input=input_data,
            text=True,
            capture_output=True,
            timeout=10
        )
        
        # Clean up
        os.unlink(code_file)
        
        if process.returncode == 0:
            return {'output': process.stdout, 'error': False}
        else:
            return {'output': process.stderr, 'error': True}
    except subprocess.TimeoutExpired:
        os.unlink(code_file)
        return {'output': 'Time limit exceeded', 'error': True}
    except Exception as e:
        os.unlink(code_file)
        return {'output': str(e), 'error': True}

def run_javascript_code(code, input_data):
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
        f.write(code)
        code_file = f.name
    
    try:
        # Run the code
        process = subprocess.run(
            ['node', code_file],
            input=input_data,
            text=True,
            capture_output=True,
            timeout=10
        )
        
        # Clean up
        os.unlink(code_file)
        
        if process.returncode == 0:
            return {'output': process.stdout, 'error': False}
        else:
            return {'output': process.stderr, 'error': True}
    except subprocess.TimeoutExpired:
        os.unlink(code_file)
        return {'output': 'Time limit exceeded', 'error': True}
    except Exception as e:
        os.unlink(code_file)
        return {'output': str(e), 'error': True}

def run_cpp_code(code, input_data):
    with tempfile.NamedTemporaryFile(mode='w', suffix='.cpp', delete=False) as f:
        f.write(code)
        code_file = f.name
    
    try:
        # Compile the code
        executable = code_file.replace('.cpp', '')
        compile_process = subprocess.run(
            ['g++', code_file, '-o', executable],
            capture_output=True,
            timeout=30
        )
        
        # Clean up source file
        os.unlink(code_file)
        
        if compile_process.returncode != 0:
            return {'output': compile_process.stderr.decode(), 'error': True}
        
        # Run the executable
        process = subprocess.run(
            [executable],
            input=input_data,
            text=True,
            capture_output=True,
            timeout=10
        )
        
        # Clean up executable
        os.unlink(executable)
        
        if process.returncode == 0:
            return {'output': process.stdout, 'error': False}
        else:
            return {'output': process.stderr, 'error': True}
    except subprocess.TimeoutExpired:
        try:
            os.unlink(code_file)
        except:
            pass
        try:
            os.unlink(executable)
        except:
            pass
        return {'output': 'Time limit exceeded', 'error': True}
    except Exception as e:
        try:
            os.unlink(code_file)
        except:
            pass
        try:
            os.unlink(executable)
        except:
            pass
        return {'output': str(e), 'error': True}

def generate_mock_ai_feedback(code, question_text):
    # This is a mock function that generates simple feedback
    # In a real application, you would call an AI service
    
    feedback = f"## Code Review\n\n"
    
    # Basic analysis
    lines = code.split('\n')
    feedback += f"- Your solution has {len(lines)} lines of code.\n"
    
    # Check for common patterns
    if 'for' in code or 'while' in code:
        feedback += "- I see you're using loops, which is good for this problem.\n"
    
    if 'def' in code:
        feedback += "- You've organized your code into functions, great practice!\n"
    
    # Generic feedback
    feedback += "\n## Suggestions\n\n"
    feedback += "1. Consider adding comments to explain complex logic.\n"
    feedback += "2. Make sure to handle edge cases.\n"
    feedback += "3. Your solution looks correct for this problem.\n"
    
    feedback += "\n## Overall\n\n"
    feedback += "Good job on implementing a solution! It's clean and readable.\n"
    
    return feedback

def generate_comprehensive_ai_feedback(submissions):
    # This is a mock function that generates comprehensive feedback
    # In a real application, you would call an AI service
    
    feedback = f"## Comprehensive AI Code Review\n\n"
    
    # Analyze submissions
    total_submissions = len(submissions)
    if total_submissions == 0:
        feedback += "No submissions found to analyze.\n"
        return feedback
    
    # Count accepted vs failed submissions
    accepted_count = sum(1 for s in submissions if getattr(s, 'status', '') == 'accepted')
    failed_count = total_submissions - accepted_count
    
    feedback += f"### Submission Statistics\n\n"
    feedback += f"- Total submissions analyzed: {total_submissions}\n"
    feedback += f"- Accepted submissions: {accepted_count}\n"
    feedback += f"- Failed submissions: {failed_count}\n"
    
    # Analyze common patterns
    languages_used = {}
    for submission in submissions:
        lang = getattr(submission, 'language', 'unknown')
        languages_used[lang] = languages_used.get(lang, 0) + 1
    
    feedback += f"\n### Languages Used\n\n"
    for lang, count in languages_used.items():
        feedback += f"- {lang.capitalize()}: {count} submissions\n"
    
    # Identify common issues
    feedback += f"\n### Common Issues Identified\n\n"
    feedback += "1. Some submissions could benefit from better error handling.\n"
    feedback += "2. Consider adding more comments to explain complex algorithms.\n"
    feedback += "3. Some solutions could be optimized for better time complexity.\n"
    
    # Recommendations
    feedback += f"\n### Personalized Recommendations\n\n"
    feedback += "#### Learning Resources\n\n"
    feedback += "- **YouTube**: 'Data Structures and Algorithms' by Abdul Bari (https://youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O)\n"
    feedback += "- **Course**: 'Introduction to Algorithms' on Coursera\n"
    feedback += "- **Book**: 'Cracking the Coding Interview' by Gayle Laakmann McDowell\n"
    
    feedback += "\n#### Practice Problems\n\n"
    feedback += "1. Two Sum (Easy) - Practice hash table techniques\n"
    feedback += "2. Longest Substring Without Repeating Characters (Medium) - Sliding window pattern\n"
    feedback += "3. Merge Intervals (Medium) - Interval manipulation\n"
    
    feedback += f"\n### Overall Assessment\n\n"
    if accepted_count > total_submissions * 0.7:
        feedback += "Great job! Your success rate is high. Keep practicing to maintain and improve your skills.\n"
    elif accepted_count > total_submissions * 0.4:
        feedback += "Good progress! You're solving problems consistently. Focus on the areas where you're struggling.\n"
    else:
        feedback += "Keep practicing! Everyone starts somewhere. Focus on understanding the fundamentals and practice regularly.\n"
    
    return feedback