from django.contrib import admin
from problems.models import Problem, Submission, Tag
from contests.models import Contest, ContestSubmission
from compiler.models import AIReview

class ProblemAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'created_at')
    list_filter = ('difficulty', 'tags')
    search_fields = ('title', 'description')

class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'problem', 'language', 'status', 'submitted_at')
    list_filter = ('language', 'status', 'problem')
    search_fields = ('user__username', 'problem__title')

class ContestAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_time', 'end_time')
    filter_horizontal = ('problems',)

class ContestSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'contest', 'problem', 'language', 'status', 'submitted_at')
    list_filter = ('language', 'status', 'contest', 'problem')

class AIReviewAdmin(admin.ModelAdmin):
    list_display = ('submission', 'created_at')

admin.site.register(Tag)
admin.site.register(Problem, ProblemAdmin)
admin.site.register(Submission, SubmissionAdmin)
admin.site.register(Contest, ContestAdmin)
admin.site.register(ContestSubmission, ContestSubmissionAdmin)
admin.site.register(AIReview, AIReviewAdmin)