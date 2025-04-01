from django.urls import path
from . import views # Importing views from the current directory

urlpatterns = [
    # Defines the URL path for the analyze_youtube_trends view
    path('analyze/', views.analyze_youtube_trends, name='analyze_trends'),
    path('suggest-ideas/', views.suggest_content_ideas, name='suggest_content_ideas'),
    path('get-idea-details/', views.get_content_idea_details, name='get_content_idea_details'),
]