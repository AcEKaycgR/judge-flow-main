from django.contrib import admin
from .models import Tag, Problem, Submission, TestCase, PendingQuestion

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'created_at')
    list_filter = ('difficulty', 'tags')
    search_fields = ('title', 'description')
    filter_horizontal = ('tags',)

@admin.register(TestCase)
class TestCaseAdmin(admin.ModelAdmin):
    list_display = ('problem', 'is_hidden')
    list_filter = ('is_hidden', 'problem')
    search_fields = ('problem__title',)

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'problem', 'language', 'status', 'submitted_at')
    list_filter = ('language', 'status', 'problem')
    search_fields = ('user__username', 'problem__title')
    readonly_fields = ('submitted_at',)

@admin.register(PendingQuestion)
class PendingQuestionAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'created_by', 'created_at', 'is_approved')
    list_filter = ('difficulty', 'is_approved', 'tags')
    search_fields = ('title', 'description', 'created_by__username')
    filter_horizontal = ('tags',)
    list_editable = ('is_approved',)
    readonly_fields = ('created_at',)