from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
import subprocess
import tempfile
import os

# Import models from the problems app
from problems.models import Problem, Submission, TestCase

@csrf_exempt
def run_code(request):
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
        
        # Get all test cases for the problem (both shown and hidden)
        test_cases = problem.test_cases.all()
        
        # Create submission with pending status
        submission = Submission.objects.create(
            user=request.user,
            problem=problem,
            code=code,
            language=language,
            status='pending',
        )
        
        # Initialize result
        result = {
            'status': 'accepted',  # Default to accepted, change if any test fails
            'runtime': 0.0,
            'memory': 0.0,
            'test_results': []  # Store detailed test case results
        }
        
        # Run the code against each test case
        for i, test_case in enumerate(test_cases):
            # Execute the code with the test case input
            output, error = execute_code_submission(code, language, test_case.input_data)
            
            # Create test result entry
            test_result = {
                'test_case_id': test_case.id,
                'passed': True,
                'input': test_case.input_data,
                'expected_output': test_case.expected_output,
                'actual_output': output,
                'error': error
            }
            
            # If there's an execution error, mark as runtime error and break
            if error:
                result['status'] = 'runtime_error'
                test_result['passed'] = False
                result['test_results'].append(test_result)
                break
            
            # Compare output with expected output
            if output.strip() != test_case.expected_output.strip():
                result['status'] = 'wrong_answer'
                test_result['passed'] = False
                result['test_results'].append(test_result)
                break
            else:
                # Test case passed
                result['test_results'].append(test_result)
        
        # Update submission with results
        submission.status = result['status']
        # In a real implementation, we would also capture actual runtime and memory
        # For now, we'll use placeholder values
        submission.runtime = result['runtime'] if result['status'] == 'accepted' else None
        submission.memory = result['memory'] if result['status'] == 'accepted' else None
        # Store detailed test case results
        submission.test_case_results = result['test_results']
        submission.save()
        
        # Return detailed results
        return JsonResponse({
            'submission_id': submission.id,
            'status': submission.status,
            'runtime': submission.runtime,
            'memory': submission.memory,
            'test_results': result['test_results']
        })

# This is a helper function for code execution
def execute_code_submission(code, language, input_data):
    """
    Execute the user's code with the given input and return the output.
    Returns a tuple of (output, error) where error is None if successful.
    """
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
        
        # Return the output and error status
        if result['error']:
            return ('', result['output'])  # (output, error)
        else:
            return (result['output'], None)  # (output, error)
    except Exception as e:
        return ('', str(e))  # (output, error)

@csrf_exempt
@login_required
def ai_review(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        submission_id = data.get('submission_id')
        code = data.get('code', '')
        problem_text = data.get('problem_text', '')
        
        # Generate mock AI feedback
        feedback = generate_mock_ai_feedback(code, problem_text)
        
        return JsonResponse({'feedback': feedback})

def generate_mock_ai_feedback(code, problem_text):
    # This is a mock function that generates simple feedback
    # In a real application, you would call an AI service
    
    feedback = f"## Code Review\n\n"
    
    # Basic analysis
    lines = code.split('\n')
    feedback += f"- Your solution has {len(lines)} lines of code.\n"
    
    # Check for common patterns
    if 'for' in code or 'while' in code:
        feedback += "- I see you're using loops, which is good for this problem.\n"
    
    if 'def' in code or 'function' in code:
        feedback += "- You've organized your code into functions, great practice!\n"
    
    # Generic feedback
    feedback += "\n## Suggestions\n\n"
    feedback += "1. Consider adding comments to explain complex logic.\n"
    feedback += "2. Make sure to handle edge cases.\n"
    feedback += "3. Your solution looks correct for this problem.\n"
    
    feedback += "\n## Overall\n\n"
    feedback += "Good job on implementing a solution! It's clean and readable.\n"
    
    return feedback