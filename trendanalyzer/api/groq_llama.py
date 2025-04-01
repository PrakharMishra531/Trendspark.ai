from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

def llama(JSON_DATA):
    client = Groq(
        api_key=os.environ.get("GROQ_API_KEY"),
    )

    system_prompt = """You are an expert in analyzing YouTube trending videos. Extract information from the provided YouTube trending video data and format it as a JSON list of exactly 8 objects. Each object should represent a trending video and contain the following keys:

- id: A unique identifier for the video. You can use the video's `videoId` from the input data for this.
- title: The title of the video.
- thumbnail: The URL of the video's default thumbnail (usually found in `snippet.thumbnails.default.url`).
- description: A short description or snippet of the video content. If its not any meaningful, create your own as you can think from the title.

Only return a JSON list. Do not include any other text or explanations. Ensure there are exactly 8 objects in the list.
"""


    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": f"Analyze the following trending video data: {JSON_DATA}",
            }
            
        ],
        model="llama-3.3-70b-versatile",
        stream=False,
    )

    return chat_completion.choices[0].message.content

