from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from unittest.mock import patch
from .models import Problem, TestCase, Tag, Submission

class TestProblemViews(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='password')
        self.problem = Problem.objects.create(
            title='Test Problem',
            description='A problem for testing.',
            difficulty='easy'
        )
        self.shown_test_case = TestCase.objects.create(
            problem=self.problem,
            input_data='1 2',
            expected_output='3',
            is_hidden=False
        )
        self.hidden_test_case = TestCase.objects.create(
            problem=self.problem,
            input_data='3 4',
            expected_output='7',
            is_hidden=True
        )

    def test_problem_detail_returns_only_shown_test_cases(self):
        # Test that the problem detail view only returns shown test cases
        self.client.login(username='testuser', password='password')
        url = reverse('problem_detail', args=[self.problem.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        
        self.assertIn('test_cases', response_data['problem'])
        self.assertEqual(len(response_data['problem']['test_cases']), 1)
        self.assertEqual(response_data['problem']['test_cases'][0]['input_data'], self.shown_test_case.input_data)

    @patch('problems.views.execute_code_submission')
    def test_submit_solution_correct_answer(self, mock_execute):
        # Test that a correct solution gets accepted
        def side_effect(code, language, input_data):
            # Return correct outputs for both test cases
            if input_data == '1 2': 
                return ('3', None)
            if input_data == '3 4': 
                return ('7', None)
            return ('', 'Unexpected input')
        mock_execute.side_effect = side_effect

        self.client.login(username='testuser', password='password')
        url = reverse('submit_solution')
        payload = {
            'problem_id': self.problem.id,
            'code': 'def solve(a, b): return a + b',
            'language': 'python'
        }
        response = self.client.post(url, data=payload, content_type='application/json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'accepted')
        self.assertTrue(Submission.objects.filter(user=self.user, problem=self.problem, status='accepted').exists())

    @patch('problems.views.execute_code_submission')
    def test_submit_solution_wrong_answer_on_hidden_test(self, mock_execute):
        # Test that a wrong answer on a hidden test case is caught
        def side_effect(code, language, input_data):
            # Return correct output for shown test case but wrong for hidden test case
            if input_data == '1 2': 
                return ('3', None)
            if input_data == '3 4': 
                return ('8', None)  # Wrong output
            return ('', 'Unexpected input')
        mock_execute.side_effect = side_effect

        self.client.login(username='testuser', password='password')
        url = reverse('submit_solution')
        payload = {
            'problem_id': self.problem.id,
            'code': 'def solve(a, b): return a + b',
            'language': 'python'
        }
        response = self.client.post(url, data=payload, content_type='application/json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'wrong_answer')
        self.assertTrue(Submission.objects.filter(user=self.user, problem=self.problem, status='wrong_answer').exists())
