import requests
import os
from dotenv import load_dotenv
import json
from . import groq_llama as llama

load_dotenv()
api_key=os.environ.get("RAPID_API_KEY")

def get_trending_videos(country,type):
    url = "https://youtube-trending.p.rapidapi.com/trending"

    querystring = {"country":country,"type":type}

    headers = {
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": "youtube-trending.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)
    trending_videos = response.json()[:10]
    return trending_videos

