from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .models import Contest
from problems.models import Problem, Tag
import json


class ContestAPITestCase(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        # Create test tags
        self.tag1 = Tag.objects.create(name='Array')
        self.tag2 = Tag.objects.create(name='Dynamic Programming')
        
        # Create test problems
        self.problem1 = Problem.objects.create(
            title='Two Sum',
            description='Find two numbers that add up to target',
            difficulty='easy',
            constraints='2 <= nums.length <= 10^4'
        )
        self.problem1.tags.add(self.tag1)
        
        self.problem2 = Problem.objects.create(
            title='Longest Common Subsequence',
            description='Find the longest common subsequence',
            difficulty='medium',
            constraints='1 <= text1.length, text2.length <= 1000'
        )
        self.problem2.tags.add(self.tag2)
        
        # Create a test contest
        self.contest = Contest.objects.create(
            name='Test Contest',
            start_time=timezone.now(),
            end_time=timezone.now() + timedelta(hours=2)
        )
        self.contest.problems.add(self.problem1, self.problem2)

    def test_contests_list_api(self):
        """Test that the contests list API returns data correctly"""
        response = self.client.get('/api/contests/')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertIn('contests', data)
        self.assertEqual(len(data['contests']), 1)
        
        contest_data = data['contests'][0]
        self.assertEqual(contest_data['name'], 'Test Contest')
        self.assertEqual(contest_data['problem_count'], 2)

    def test_contest_detail_api(self):
        """Test that the contest detail API returns data correctly"""
        response = self.client.get(f'/api/contests/{self.contest.id}/')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertIn('contest', data)
        
        contest_data = data['contest']
        self.assertEqual(contest_data['name'], 'Test Contest')
        self.assertEqual(len(contest_data['problems']), 2)
        
        # Check problem details
        problem1 = contest_data['problems'][0]
        self.assertEqual(problem1['title'], 'Two Sum')
        self.assertEqual(problem1['difficulty'], 'easy')

    def test_contest_creation_api(self):
        """Test that the contest creation API works correctly"""
        # Login as user
        self.client.login(username='testuser', password='testpass123')
        
        # Create contest data
        start_time = timezone.now() + timedelta(days=1)
        end_time = timezone.now() + timedelta(days=1, hours=2)
        
        contest_data = {
            'name': 'New Contest',
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
            'problem_ids': [self.problem1.id, self.problem2.id]
        }
        
        # Test POST request to create contest
        response = self.client.post(
            '/api/contests/create/',
            data=json.dumps(contest_data),
            content_type='application/json'
        )
        
        # Print response for debugging
        print(f"Response status: {response.status_code}")
        print(f"Response content: {response.content}")
        
        # Check response
        self.assertEqual(response.status_code, 201)
        
        # Check that contest was created
        contests = Contest.objects.filter(name='New Contest')
        self.assertEqual(contests.count(), 1)
        
        contest = contests.first()
        self.assertEqual(contest.problems.count(), 2)

    def test_contest_creation_invalid_data(self):
        """Test that the contest creation API handles invalid data correctly"""
        # Login as user
        self.client.login(username='testuser', password='testpass123')
        
        # Test with missing required fields
        invalid_data = {
            'name': '',  # Empty name
            'start_time': (timezone.now() + timedelta(days=1)).isoformat(),
            'end_time': (timezone.now() + timedelta(days=1, hours=2)).isoformat(),
        }
        
        response = self.client.post(
            '/api/contests/create/',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        # Should return bad request
        self.assertEqual(response.status_code, 400)

    def test_contest_creation_unauthorized(self):
        """Test that unauthorized users cannot create contests"""
        # Don't login - remain anonymous
        
        contest_data = {
            'name': 'Unauthorized Contest',
            'start_time': (timezone.now() + timedelta(days=1)).isoformat(),
            'end_time': (timezone.now() + timedelta(days=1, hours=2)).isoformat(),
        }
        
        response = self.client.post(
            '/api/contests/create/',
            data=json.dumps(contest_data),
            content_type='application/json'
        )
        
        # Should redirect to login page
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login/', response.url)