# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-15-create-problem-testcase-models/spec.md

## Changes

1.  A new `TestCase` model/table will be created.
2.  The `sample_input` and `sample_output` columns will be removed from the `Problem` model/table.

## Specifications

### Django Models (`problems/models.py`)

The `problems/models.py` file will be updated to look like this:

```python
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    constraints = models.TextField(blank=True)
    # REMOVED: sample_input = models.TextField(blank=True)
    # REMOVED: sample_output = models.TextField(blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return self.title

# NEW MODEL
class TestCase(models.Model):
    problem = models.ForeignKey(Problem, related_name='test_cases', on_delete=models.CASCADE)
    input_data = models.TextField(help_text="Input for the test case")
    expected_output = models.TextField(help_text="Expected output for the test case")
    is_hidden = models.BooleanField(default=False, help_text="Is this test case hidden from the user?")

    def __str__(self):
        return f"Test Case for {self.problem.title}"

class Submission(models.Model):
    # ... (rest of the Submission model remains the same)
    LANGUAGE_CHOICES = [
        ('python', 'Python'),
        ('javascript', 'JavaScript'),
        ('cpp', 'C++'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('wrong_answer', 'Wrong Answer'),
        ('runtime_error', 'Runtime Error'),
        ('time_limit_exceeded', 'Time Limit Exceeded'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    code = models.TextField()
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    runtime = models.FloatField(null=True, blank=True)  # in seconds
    memory = models.FloatField(null=True, blank=True)   # in MB
    submitted_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.user.username} - {self.problem.title}"
```

### Migration

A new migration will be generated that creates the `problems_testcase` table and removes the `sample_input` and `sample_output` columns from the `problems_problem` table.

1.  Run `python manage.py makemigrations problems`
2.  Run `python manage.py migrate`

## Rationale

The original `Problem` model with `sample_input` and `sample_output` fields only allowed for a single, simple, visible test case. This is insufficient for a robust judging system. By creating a dedicated `TestCase` model with a one-to-many relationship with `Problem`, we can support a full suite of test cases per problem. The `is_hidden` flag provides the necessary functionality to separate public examples from private judging tests.
