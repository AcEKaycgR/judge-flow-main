from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from problems.models import Problem, Submission
from .models import AIReviewResult, ProgressSnapshot
from ai_review.views import GeminiCodeAnalyzer

class AIReviewAPITest(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create test problem
        self.problem = Problem.objects.create(
            title='Test Problem',
            description='Test problem description',
            difficulty='easy'
        )
        
        # Create test submission
        self.submission = Submission.objects.create(
            user=self.user,
            problem=self.problem,
            code='print("Hello, World!")',
            language='python',
            status='accepted'
        )
        
        # Create AI review result
        self.ai_review = AIReviewResult.objects.create(
            submission=self.submission,
            feedback='Good code structure and readability',
            overall_score=85.5
        )
        
        # Create progress snapshot
        self.progress_snapshot = ProgressSnapshot.objects.create(
            user=self.user,
            total_submissions=25,
            accepted_submissions=14,
            accuracy_rate=56.0
        )
        
        # Create API client and log in
        self.client = APIClient()
        self.client.login(username='testuser', password='testpass123')
    
    def test_comprehensive_ai_review_endpoint(self):
        """Test the comprehensive AI review endpoint"""
        url = reverse('comprehensive-ai-review')
        response = self.client.post(url, {}, format='json')
        
        # We expect a 200 OK response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that the response contains the expected data
        self.assertIn('feedback', response.data)
        self.assertIn('overall_score', response.data)
    
    def test_problem_specific_ai_review_endpoint(self):
        """Test the problem-specific AI review endpoint"""
        url = reverse('problem-ai-review', kwargs={'problem_id': self.problem.id})
        data = {'code': 'print("Hello, World!")', 'language': 'python'}
        response = self.client.post(url, data, format='json')
        
        # We expect a 200 OK response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that the response contains the expected data
        self.assertIn('feedback', response.data)
        self.assertIn('overall_score', response.data)
    
    def test_user_progress_endpoint(self):
        """Test the user progress endpoint"""
        url = reverse('user-progress')
        response = self.client.get(url)
        
        # We expect a 200 OK response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that the response contains the expected data
        self.assertIn('progress_data', response.data)
        self.assertIn('category_breakdown', response.data)

class CodeAnalysisTest(TestCase):
    def setUp(self):
        self.analyzer = GeminiCodeAnalyzer()
    
    def test_fallback_code_analysis(self):
        """Test the fallback code analysis function"""
        question_text = "Write a function to reverse a string"
        user_code = """
def reverse_string(s):
    return s[::-1]
"""
        language = "python"
        
        result = self.analyzer._fallback_code_analysis(question_text, user_code, language)
        
        # Check that the result contains the expected keys
        self.assertIn('completion_percentage', result)
        self.assertIn('implemented_correctly', result)
        self.assertIn('missing_components', result)
        self.assertIn('suggestions', result)
        self.assertIn('code_quality', result)
        self.assertIn('next_steps', result)
        
        # Check that the completion percentage is within bounds
        self.assertGreaterEqual(result['completion_percentage'], 0)
        self.assertLessEqual(result['completion_percentage'], 100)
    
    def test_fallback_failure_tips(self):
        """Test the fallback failure tips function"""
        question_text = "Write a function to reverse a string"
        user_code = """
def reverse_string(s):
    return s[::-1]
"""
        failed_tests = [
            {
                'input': 'hello',
                'expected': 'olleh',
                'actual': 'olleh'
            }
        ]
        language = "python"
        
        result = self.analyzer._fallback_failure_tips(question_text, user_code, failed_tests, language)
        
        # Check that the result contains the expected keys
        self.assertIn('failure_reasons', result)
        self.assertIn('identified_bugs', result)
        self.assertIn('debugging_steps', result)
        self.assertIn('hints', result)
        self.assertIn('common_mistakes', result)
        self.assertIn('suggested_fixes', result)
    
    def test_fallback_coding_suggestions(self):
        """Test the fallback coding suggestions function"""
        question_text = "Write a function to reverse a string"
        user_code = """
def reverse_string(s):
    return s[::-1]
"""
        language = "python"
        
        result = self.analyzer._fallback_coding_suggestions(question_text, user_code, language)
        
        # Check that the result contains the expected keys
        self.assertIn('optimization_tips', result)
        self.assertIn('best_practices', result)
        self.assertIn('alternative_approaches', result)
        self.assertIn('performance_notes', result)
        self.assertIn('readability_tips', result)
        self.assertIn('overall_feedback', result)