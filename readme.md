Project Overview
Trendspark.ai is a Django-based web application designed to assist YouTube content creators. It fetches and analyzes trending YouTube videos, generates AI-powered content ideas, and provides detailed video planning tools. The app leverages external APIs for data fetching and AI processing, with caching mechanisms for performance. It appears to serve as a backend API for a frontend application (likely a web app, given CORS settings for localhost:3000).

Tech Stacks Used
Backend Framework: Python 3.x, Django 5.1.7 (with Django REST Framework for API handling)
Database:
SQLite (for Django's built-in models like users and sessions)
MongoDB (via PyMongo for caching trending video data and AI analysis)
External APIs and Libraries:
Groq API (for large language model interactions, using models like "openai/gpt-oss-120b")
RapidAPI YouTube API (for fetching trending videos)
Requests (for HTTP calls)
Pandas, NumPy, Altair (likely for potential data analysis/visualization, though not heavily used in current code)
Other Dependencies: python-dotenv (for environment variables), Pytz (for timestamps), JSON (for data handling)
Deployment: Render (cloud hosting), with Gunicorn as the WSGI server
Authentication: Django's session-based auth (with CSRF handling, though partially disabled)
CORS and Security: django-cors-headers for cross-origin requests; CSRF middleware commented out for flexibility
How the Project is Run
Development Mode: Use python manage.py runserver from the trendanalyzer directory. This starts the Django development server (default port 8000).
Production/Deployment:
Build script (build.sh): Installs dependencies, collects static files, and runs migrations.
Render configuration (render.yaml): Deploys with Gunicorn, sets environment variables (e.g., DJANGO_SECRET_KEY, DEBUG=False), and uses the build script.
Environment variables required: MONGODB_URI, GROQ_API_KEY, RAPID_API_KEY, DJANGO_SECRET_KEY, etc. (loaded via .env file).
Caching Data: Run python manage.py cache_all_trends to fetch trending videos for countries (US, IN, GB, JP), generate AI analysis, and store in MongoDB. This is a periodic task to keep data fresh.
Database Setup: SQLite is auto-handled by Django. MongoDB requires a URI (e.g., from MongoDB Atlas).
No Frontend Included: This is purely a backend API; frontend integration assumed (e.g., via fetch/AJAX from a separate app).
APIs and Their Functionality
The app has two main Django apps: api (core features) and authentication (user management). All endpoints return JSON responses. URLs are prefixed with /api/ or /auth/.

Authentication App (/auth/)
Handles user registration, login, and profile management using Django's built-in User model and session authentication. CSRF tokens are managed for frontend integration.

POST /auth/login/: Authenticates user with username/password. Returns user data on success.
POST /auth/logout/: Logs out the user.
POST /auth/register/: Creates a new user account. Requires username, password, email, etc. Auto-logs in on success.
GET/PATCH /auth/profile/: Retrieves/updates user profile (authenticated users only).
POST /auth/change-password/: Changes user password (requires old password; authenticated users only).
GET /auth/status/: Checks authentication status and returns CSRF token (for frontend CSRF handling).
API App (/api/)
Core functionality for YouTube trend analysis and content ideation. Uses MongoDB for cached data and Groq for AI generation.

GET /api/analyze/: Fetches cached trending YouTube videos for a specific country (e.g., ?country=US). Data includes video ID, title, description, thumbnail, channel, views, etc. If no cache exists, returns 404. (No LLM involved here; just retrieval.)
POST /api/suggest-ideas/: Generates 5 content ideas based on user profile (primary_category, ideal_creator, budget, resources, video_style). Optionally uses cached trend analysis for a country to inspire ideas. Returns JSON list of ideas (title + description). Uses Groq LLM for generation.
POST /api/get-idea-details/: Expands a content idea into a detailed video plan. Requires topic, description, and profile fields. Returns JSON with video_title, description, hook, intro, main_content (bullet points), outro, call_to_action, thumbnail_text, hashtags. Uses Groq LLM for elaboration.
Key Code Components and Workflow
youtubeSummary.py: Fetches top 10 trending videos from RapidAPI for a geo code (e.g., "US"). Cleans data into a list of dicts (videoId, title, etc.).
groq_llama.py: Analyzes cleaned video data via Groq API. Generates JSON with "dominant_theme", "emerging_trend", and "video_breakdowns" (for top 5 videos, including format, success factors, and adaptation ideas).
llm_utils.py:
generate_content_ideas(): Creates 5 ideas using Groq, optionally incorporating trend analysis.
generate_detailed_idea(): Builds a structured video plan from an idea.
cache_all_trends.py (Management Command): Orchestrates the workflow:
Fetches trending data for multiple countries.
Generates AI analysis.
Stores in MongoDB collection trending_data_grouped (per-country docs with data, ai_analysis, updated_at).
Models: No custom models in models.py (empty). Relies on Django's User model and MongoDB for data.
Settings: CORS allows all origins; REST Framework uses session auth; CSRF is lax for API ease.
Error Handling: JSON errors for invalid requests; try-except blocks for API failures.
Additional Notes
Data Flow: RapidAPI → Clean data → Groq analysis → MongoDB cache → API endpoints serve cached data/ideas.
Assumptions: Frontend handles UI; no static files or templates beyond Django defaults.
Limitations: No real-time fetching (relies on cache); AI responses are JSON-structured for reliability.
Potential Extensions: Could integrate Pandas/Altair for trend visualizations; add more countries or real-time updates.