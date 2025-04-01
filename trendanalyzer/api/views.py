from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseServerError, HttpResponseNotFound
from django.views.decorators.http import require_GET, require_POST
from pymongo import MongoClient
import os
from datetime import datetime, timedelta
import pytz
from dotenv import load_dotenv
import json
from . import llm_utils 


load_dotenv()
MONGODB_URI = os.environ.get("MONGODB_URI")

@require_GET
def analyze_youtube_trends(request):
    country_code = request.GET.get('country')
    if not country_code:
        return JsonResponse({'error': 'Missing required query parameter: country'}, status=400)

    client = MongoClient(MONGODB_URI)
    db = client.get_default_database()
    collection = db['trending_data_grouped']

    try:
        cached_data = collection.find({'country': country_code})
        if not cached_data:
            return JsonResponse({'message': f'No trending data available for {country_code}.'}, status=404)

        trending_videos = []  # Initialize an empty list to store video data
        now_utc = datetime.now(pytz.utc)
        data_found = False

        for item in cached_data:
            if 'type' in item and 'data' in item and 'updated_at' in item:
                updated_at_utc = item['updated_at'].replace(tzinfo=pytz.utc)
                if now_utc - updated_at_utc < timedelta(days=1):
                    if isinstance(item['data'], list):
                        trending_videos.extend(item['data']) # If data is already a list, extend
                    else:
                        trending_videos.append(item['data']) # If data is a single object, append
                    data_found = True

        if data_found:
            return JsonResponse(trending_videos, safe=False)  # Return the list
        else:
            return JsonResponse({'message': f'Trending data for {country_code} is being refreshed or not yet available.'}, status=202)

    except Exception as e:
        print(f"Error accessing MongoDB: {e}")
        return HttpResponseServerError("Error retrieving cached data.")
    finally:
        client.close()
@require_POST
def suggest_content_ideas(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        primary_category = data.get('primary_category')
        ideal_creator = data.get('ideal_creator')
        budget = data.get('budget')
        resources = data.get('resources')
        video_style = data.get('video_style')

        if not all([primary_category, ideal_creator, budget, resources, video_style]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        content_ideas = llm_utils.generate_content_ideas(
            primary_category, ideal_creator, budget, resources, video_style
        )

        if content_ideas:
            return JsonResponse({'ideas': content_ideas})
        else:
            return JsonResponse({'error': 'Failed to generate or parse content ideas'}, status=500)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    except Exception as e:
        print(f"Error in suggest_content_ideas: {e}")
        return JsonResponse({'error': 'Something went wrong'}, status=500)

@require_POST
def get_content_idea_details(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        topic = data.get('topic')
        description = data.get('description')
        primary_category = data.get('primary_category')
        ideal_creator = data.get('ideal_creator')
        budget = data.get('budget')
        resources = data.get('resources')
        video_style = data.get('video_style')

        if not topic or not description or not primary_category or not ideal_creator or not budget or not resources or not video_style:
            return JsonResponse({'error': 'Missing required fields for detailed idea'}, status=400)

        detailed_idea = llm_utils.generate_detailed_idea(
            topic, description, primary_category, ideal_creator, budget, resources, video_style
        )

        if detailed_idea:
            return JsonResponse({'details': detailed_idea})
        else:
            return JsonResponse({'error': 'Failed to generate detailed content idea'}, status=500)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    except Exception as e:
        print(f"Error in get_content_idea_details: {e}")
        return JsonResponse({'error': 'Something went wrong'}, status=500)
    