from django.contrib import admin
from .models import AIReview

@admin.register(AIReview)
class AIReviewAdmin(admin.ModelAdmin):
    list_display = ('submission', 'created_at')
    search_fields = ('submission__user__username', 'submission__problem__title')
    readonly_fields = ('created_at',)