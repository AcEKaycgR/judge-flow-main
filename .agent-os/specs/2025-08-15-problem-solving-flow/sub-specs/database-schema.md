# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-15-problem-solving-flow/spec.md

## Changes

A new field will be added to the `TestCase` model in the `problems` app to distinguish between test cases that are visible to the user and those that are hidden for judging.

### `problems_testcase` table

-   **New Column**: `is_hidden`

## Specifications

### Django Model (`problems/models.py`)

The `TestCase` model will be modified as follows:

```python
# existing fields...
class TestCase(models.Model):
    problem = models.ForeignKey(Problem, related_name='test_cases', on_delete=models.CASCADE)
    input = models.TextField()
    output = models.TextField()
    is_hidden = models.BooleanField(default=False) # Add this line
```

### Migration

A Django migration will be created and applied to add the `is_hidden` column to the `problems_testcase` table. The default value will be `False` to ensure existing test cases are considered "shown" by default.

1.  Run `python manage.py makemigrations problems`
2.  Run `python manage.py migrate`

## Rationale

This change is necessary to implement a core requirement of the problem-solving flow: judging user submissions against a comprehensive set of test cases while only showing a few examples to the user. The `is_hidden` flag provides a simple and effective way to filter test cases when displaying problem details versus when judging a submission.
