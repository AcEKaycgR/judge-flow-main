from django.db import models
from django.contrib.auth.models import User
from problems.models import Submission

class ComprehensiveAIReview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, null=True, blank=True, related_name='comprehensive_ai_reviews')
    feedback = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Comprehensive AI Review for {self.user.username} - {self.created_at}"