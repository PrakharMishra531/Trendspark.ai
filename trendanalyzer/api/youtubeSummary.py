import requests
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("RAPID_API_KEY")

def get_trending_videos(geo_code: str):
    """
    Fetches trending YouTube videos and returns a clean list of dictionaries
    containing only the essential information.
    """
    url = "https://yt-api.p.rapidapi.com/trending"
    querystring = {"geo": geo_code}
    headers = {
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": "yt-api.p.rapidapi.com"
    }

    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        
        raw_data = response.json().get('data', [])
        
        cleaned_videos = []
        for video in raw_data[:10]:
            try:
                thumbnail_url = video.get('thumbnail', [{}])[0].get('url', '')
            except (IndexError, AttributeError):
                thumbnail_url = ''

            clean_video_data = {
                'videoId': video.get('videoId'),
                'title': video.get('title'),
                'description': video.get('description'),
                'thumbnail': thumbnail_url,
                'channelTitle': video.get('channelTitle'),
                'viewCount': video.get('viewCount'),
                'publishedText': video.get('publishedTimeText')
            }
            cleaned_videos.append(clean_video_data)
        
        return cleaned_videos

    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return []
    except Exception as e:
        print(f"An error occurred in get_trending_videos: {e}")
        return []