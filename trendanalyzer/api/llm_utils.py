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


def generate_detailed_idea(topic, description, primary_category, ideal_creator, budget, resources, video_style):
    """Generates detailed information for a specific content idea using the Groq LLM."""
    
    system_prompt = """
    You are an expert content idea elaborator... (Your existing detailed prompt)
    ...
    Your ENTIRE response MUST be a valid JSON object.
    """

    user_message = f"""
    Primary Video Category: {primary_category}
    ... (Your existing user message)
    Topic: {topic}
    Brief Description: {description}
    """

    response = client.chat.completions.create(
        # 1. Model changed as requested
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.2,
        response_format={"type": "json_object"}
    )

    llm_response_content = response.choices[0].message.content

    try:
        return json.loads(llm_response_content)
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        return None