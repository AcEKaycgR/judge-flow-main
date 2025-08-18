from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/', views.user_login, name='user_login'),
    path('signup/', views.user_signup, name='user_signup'),
    path('logout/', views.user_logout, name='user_logout'),
    path('profile/', views.user_profile, name='user_profile'),
    path('dashboard/', views.dashboard_data, name='dashboard_data'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]