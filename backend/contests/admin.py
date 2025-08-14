from django.contrib import admin
from .models import Contest, ContestSubmission

@admin.register(Contest)
class ContestAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_time', 'end_time', 'created_at')
    search_fields = ('name',)
    filter_horizontal = ('problems',)

@admin.register(ContestSubmission)
class ContestSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'contest', 'problem', 'language', 'status', 'submitted_at')
    list_filter = ('language', 'status', 'contest')
    search_fields = ('user__username', 'contest__name', 'problem__title')
    readonly_fields = ('submitted_at',)