from django.db import models
from django.contrib.auth.models import User
from problems.models import Submission

class AIReviewResult(models.Model):
    """
    Model to store AI review results for code submissions.
    """
    submission = models.OneToOneField(
        Submission, 
        on_delete=models.CASCADE, 
        related_name='ai_review'
    )
    feedback = models.TextField(
        help_text="Detailed feedback from AI code analysis"
    )
    overall_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Overall score from 0 to 100"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"AI Review for {self.submission}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "AI Review Result"
        verbose_name_plural = "AI Review Results"

class ProgressSnapshot(models.Model):
    """
    Model to track user progress over time for comprehensive analysis.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress_snapshots')
    snapshot_date = models.DateTimeField(auto_now_add=True)
    total_submissions = models.IntegerField()
    accepted_submissions = models.IntegerField()
    accuracy_rate = models.DecimalField(max_digits=5, decimal_places=2)
    category_breakdown = models.JSONField(
        null=True, 
        blank=True,
        help_text="JSON field for category-wise statistics"
    )
    
    def __str__(self):
        return f"Progress snapshot for {self.user.username}"
    
    class Meta:
        ordering = ['-snapshot_date']
        verbose_name = "Progress Snapshot"
        verbose_name_plural = "Progress Snapshots"