from django.db import models
from django.utils import timezone
from problems.models import Submission

class AIReview(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE)
    feedback = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Review for {self.submission}"