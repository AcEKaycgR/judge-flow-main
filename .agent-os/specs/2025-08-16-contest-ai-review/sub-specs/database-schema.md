# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-16-contest-ai-review/spec.md

## Changes

The existing database schema is sufficient for this implementation. We'll be using the existing models:

1. **Contest** - Already defined in contests/models.py
2. **ContestSubmission** - Already defined in contests/models.py
3. **Submission** - Already defined in judge/models.py
4. **AIReview** - Already defined in judge/models.py

## Specifications

### Existing Contest Model
```python
class Contest(models.Model):
    name = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    problems = models.ManyToManyField(Problem, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
```

### Existing ContestSubmission Model
```python
class ContestSubmission(models.Model):
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
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    code = models.TextField()
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    runtime = models.FloatField(null=True, blank=True)  # in seconds
    memory = models.FloatField(null=True, blank=True)   # in MB
    submitted_at = models.DateTimeField(default=timezone.now)
```

### Existing AIReview Model
```python
class AIReview(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    feedback = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
```

## Rationale

No database migrations are needed for this implementation as all required models already exist. We'll be leveraging the existing contest and AI review functionality with some enhancements to the API endpoints to support the new features.