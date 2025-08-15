from django.core.management.base import BaseCommand
from problems.models import Problem, Tag, TestCase

class Command(BaseCommand):
    help = 'Populate the database with test problems and test cases'

    def handle(self, *args, **options):
        # Create tags
        tags_data = ['Array', 'String', 'Dynamic Programming', 'Tree', 'Graph', 'Sorting']
        tags = []
        for tag_name in tags_data:
            tag, created = Tag.objects.get_or_create(name=tag_name)
            tags.append(tag)
            if created:
                self.stdout.write(f'Created tag: {tag_name}')
            else:
                self.stdout.write(f'Tag already exists: {tag_name}')

        # Create problems
        problems_data = [
            {
                'title': 'Two Sum',
                'description': 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
                'difficulty': 'easy',
                'constraints': '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
            },
            {
                'title': 'Reverse Integer',
                'description': 'Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.',
                'difficulty': 'medium',
                'constraints': '-2^31 <= x <= 2^31 - 1',
            },
            {
                'title': 'Binary Tree Maximum Path Sum',
                'description': 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. The path does not need to pass through the root. The path sum of a path is the sum of the node\'s values in the path. Given the root of a binary tree, return the maximum path sum of any non-empty path.',
                'difficulty': 'hard',
                'constraints': 'The number of nodes in the tree is in the range [1, 3 * 10^4].\n-1000 <= Node.val <= 1000',
            }
        ]

        problems = []
        for problem_data in problems_data:
            problem, created = Problem.objects.get_or_create(
                title=problem_data['title'],
                defaults={
                    'description': problem_data['description'],
                    'difficulty': problem_data['difficulty'],
                    'constraints': problem_data['constraints'],
                }
            )
            # Add tags to the problem
            problem.tags.set(tags[:3])  # Assign first 3 tags to each problem
            problems.append(problem)
            if created:
                self.stdout.write(f'Created problem: {problem_data["title"]}')
            else:
                self.stdout.write(f'Problem already exists: {problem_data["title"]}')

        # Create test cases for each problem
        test_cases_data = [
            # Test cases for Two Sum
            [
                {'input_data': '[2,7,11,15]\n9', 'expected_output': '[0,1]', 'is_hidden': False},
                {'input_data': '[3,2,4]\n6', 'expected_output': '[1,2]', 'is_hidden': False},
                {'input_data': '[3,3]\n6', 'expected_output': '[0,1]', 'is_hidden': True},
                {'input_data': '[1,2,3,4,5]\n9', 'expected_output': '[3,4]', 'is_hidden': True},
            ],
            # Test cases for Reverse Integer
            [
                {'input_data': '123', 'expected_output': '321', 'is_hidden': False},
                {'input_data': '-123', 'expected_output': '-321', 'is_hidden': False},
                {'input_data': '120', 'expected_output': '21', 'is_hidden': True},
                {'input_data': '1534236469', 'expected_output': '0', 'is_hidden': True},
            ],
            # Test cases for Binary Tree Maximum Path Sum
            [
                {'input_data': '[1,2,3]', 'expected_output': '6', 'is_hidden': False},
                {'input_data': '[-10,9,20,null,null,15,7]', 'expected_output': '42', 'is_hidden': False},
                {'input_data': '[1,2,3,4,5]', 'expected_output': '15', 'is_hidden': True},
                {'input_data': '[-3]', 'expected_output': '-3', 'is_hidden': True},
            ]
        ]

        for i, problem in enumerate(problems):
            # Delete existing test cases for this problem
            TestCase.objects.filter(problem=problem).delete()
            
            # Create new test cases
            for test_case_data in test_cases_data[i]:
                test_case = TestCase.objects.create(
                    problem=problem,
                    input_data=test_case_data['input_data'],
                    expected_output=test_case_data['expected_output'],
                    is_hidden=test_case_data['is_hidden']
                )
                self.stdout.write(f'Created test case for {problem.title}: {"(hidden)" if test_case.is_hidden else "(shown)"}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with test data')
        )