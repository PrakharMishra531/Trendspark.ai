import requests
import os
from dotenv import load_dotenv
import json

load_dotenv()
api_key = os.environ.get("RAPID_API_KEY")

def get_trending_videos(geo_code: str):
    url = "https://yt-api.p.rapidapi.com/trending"
    querystring = {"geo": geo_code}
    headers = {
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": "yt-api.p.rapidapi.com"
    }

    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        
        data = response.json()
        trending_videos = data.get('data', [])[:10]
        
        return trending_videos

    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return []
    except json.JSONDecodeError:
        print("Failed to parse JSON from the API response.")
        return []

if __name__ == "__main__":
    if not api_key:
        print("Error: The 'RAPID_API_KEY' environment variable is not set.")
    else:
        us_videos = get_trending_videos("US")
        if us_videos:
            print("--- Top 10 Trending in US ---")
            for i, video in enumerate(us_videos, 1):
                print(f"{i}. {video.get('title', 'N/A')}")


