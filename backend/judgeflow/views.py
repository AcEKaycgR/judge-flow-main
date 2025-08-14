from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings
import os

@ensure_csrf_cookie
def frontend(request):
    """
    Serve the frontend application
    """
    # Check if we have a built frontend
    index_path = os.path.join(settings.BASE_DIR.parent, "judge-flow-main", "dist", "index.html")
    
    if os.path.exists(index_path):
        with open(index_path, 'r') as f:
            content = f.read()
            return HttpResponse(content)
    else:
        # Fallback for development
        return HttpResponse("""
        <html>
        <body>
            <h1>JudgeFlow Backend</h1>
            <p>Frontend not found. Please build the frontend application.</p>
            <p>API endpoints are available at <a href="/api/">/api/</a></p>
        </body>
        </html>
        """)

def health_check(request):
    """
    Health check endpoint
    """
    return JsonResponse({"status": "ok", "message": "JudgeFlow backend is running"})