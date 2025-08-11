from django.http import JsonResponse, HttpResponseServerError
from django.views.decorators.http import require_GET, require_POST
from pymongo import MongoClient
import os
import json
from . import llm_utils


from dotenv import load_dotenv

load_dotenv()
MONGODB_URI = os.environ.get("MONGODB_URI")

@require_GET
def analyze_youtube_trends(request):
    """
    Fetches the pre-cleaned list of trending videos from the cache.
    """
    country_code = request.GET.get('country')
    if not country_code:
        return JsonResponse({'error': 'Missing required query parameter: country'}, status=400)

    client = None
    try:
        client = MongoClient(MONGODB_URI)
        db = client.get_default_database()
        collection = db['trending_data_grouped']
        
        cached_doc = collection.find_one(
            {'country': country_code},
            {'data': 1, '_id': 0} 
        )

        if cached_doc and 'data' in cached_doc:
            return JsonResponse(cached_doc['data'], safe=False)
        else:
            return JsonResponse({'message': f'Trending data for {country_code} not available yet.'}, status=404)

    except Exception as e:
        print(f"Error accessing MongoDB in analyze_youtube_trends: {e}")
        return HttpResponseServerError("Error retrieving cached data.")
    finally:
        if client:
            client.close()


@require_POST
def suggest_content_ideas(request):
    """
    Generates content ideas. If a country code is provided, it uses the
    PRE-CACHED AI analysis for inspiration.
    """
    client = None
    try:
        data = json.loads(request.body.decode('utf-8'))
        primary_category = data.get('primary_category')
        ideal_creator = data.get('ideal_creator')
        budget = data.get('budget')
        resources = data.get('resources')
        video_style = data.get('video_style')
        country_code = data.get('country') 

        if not all([primary_category, ideal_creator, budget, resources, video_style]):
            return JsonResponse({'error': 'Missing required profile fields'}, status=400)

        trend_analysis_data = None
        if country_code:
            client = MongoClient(MONGODB_URI)
            db = client.get_default_database()
            collection = db['trending_data_grouped']
            cached_doc = collection.find_one({'country': country_code})
            
            if cached_doc and 'ai_analysis' in cached_doc:
                trend_analysis_data = cached_doc.get('ai_analysis')
            else:
                return JsonResponse({'error': f'Analysis for {country_code} not available yet.'}, status=404)

        content_ideas = llm_utils.generate_content_ideas(
            primary_category, ideal_creator, budget, resources, video_style,
            trend_analysis=trend_analysis_data
        )

        if content_ideas:
            return JsonResponse({'ideas': content_ideas})
        else:
            return JsonResponse({'error': 'Failed to generate or parse content ideas'}, status=500)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    except Exception as e:
        print(f"Error in suggest_content_ideas: {e}")
        return JsonResponse({'error': 'An unexpected error occurred'}, status=500)
    finally:
        if client:
            client.close()


@require_POST
def get_content_idea_details(request):
    """
    This function is for a separate feature and is not affected.
    NO CHANGES NEEDED HERE.
    """
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