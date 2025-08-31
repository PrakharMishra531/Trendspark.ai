import os
import json
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def generate_content_ideas(primary_category, ideal_creator, budget, resources, video_style, trend_analysis=None):
    """
    Generates content ideas using the Groq LLM based on user input.
    """
    trend_context_prompt = ""
    if trend_analysis:
        trend_context_prompt = f"""
    CRITICAL CONTEXT: Use the following analysis of currently trending topics as your primary inspiration. The ideas you generate MUST be relevant to these themes.
    
    TRENDING TOPIC ANALYSIS:
    {json.dumps(trend_analysis, indent=2)}
    """

    system_prompt = f"""
    You are a helpful content idea generator for beginner creators.
    Based on the following information, suggest 5 unique and engaging content ideas.
    Each idea should have a concise title and a short description (1-2 sentences).
    Format your response as a JSON object with a single key "ideas" that contains a list of these objects.
    
    {trend_context_prompt}

    Creator's Profile:
    - Primary Video Category: {primary_category}
    - Ideal Content Creator Inspiration: {ideal_creator}
    - Budget: {budget}
    - Available Resources: {resources}
    - Preferred Video Style: {video_style}
    """

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": system_prompt},
        ],
        temperature=0.2,
        response_format={"type": "json_object"}
    )

    llm_response_content = response.choices[0].message.content

    try:
        content = json.loads(llm_response_content)
        return content.get("ideas")
    except (json.JSONDecodeError, KeyError):
        return None


# In api/llm_utils.py

def generate_detailed_idea(topic, description, primary_category, ideal_creator, budget, resources, video_style):
    """Generates detailed information using a clean, reliable JSON structure."""
    
    system_prompt = f"""
    You are an expert content idea elaborator. Based on the user's idea, generate a detailed video plan.
    Your ENTIRE response MUST be a single, valid JSON object with the following snake_case keys:

    {{
      "video_title": "A short, catchy, final title for the video.",
      "video_description": "A 2-3 sentence paragraph for the YouTube video description.",
      "hook": "A one-sentence hook to grab the viewer's attention at the start.",
      "intro": "A brief paragraph expanding on the hook.",
      "main_content": [
        "A list of 4-6 bullet points outlining the core video segments.",
        "Each point should be a clear, actionable step."
      ],
      "outro": "A brief paragraph to conclude the video.",
      "call_to_action": "A specific call to action (e.g., 'Like, subscribe, and comment...').",
      "thumbnail_text": "Short, punchy text for the thumbnail (max 5 words).",
      "hashtags": "A single string of relevant hashtags (e.g., '#Gaming #Challenge #MrBeast')."
    }}
    """

    user_message = f"""
    Generate a detailed plan for the following idea:
    - Topic: {topic}
    - Brief Description: {description}
    - Category: {primary_category}
    - Inspiration: {ideal_creator}
    - Budget: {budget}
    - Resources: {resources}
    - Style: {video_style}
    """

    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": system_prompt},
        ],
        temperature=0.2,
        response_format={"type": "json_object"}
    )

    try:
        return json.loads(response.choices[0].message.content)
    except (json.JSONDecodeError, KeyError):
        return None