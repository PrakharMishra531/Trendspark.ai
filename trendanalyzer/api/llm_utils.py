import os
import json
from groq import Groq

def generate_content_ideas(primary_category, ideal_creator, budget, resources, video_style):
    """
    Generates content ideas using the Groq LLM based on user input.
    """
    system_prompt = f"""
    You are a helpful content idea generator for beginner creators.
    Based on the following information, suggest 5 unique and engaging content ideas.
    Each idea should have a concise title and a short description (1-2 sentences).
    Format your response as a JSON array of objects, where each object has a "title" and "short_description" key.

    Primary Video Category: {primary_category}
    Ideal Content Creator Inspiration: {ideal_creator}
    Budget: {budget}
    Available Resources: {resources}
    Preferred Video Style: {video_style}
    """

    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",  
        messages=[
            {"role": "system", "content": system_prompt},
        ]
    )

    llm_response_content = response.choices[0].message.content

    try:
        content_ideas = json.loads(llm_response_content)
        return content_ideas
    except json.JSONDecodeError:
        return None  
    

def generate_detailed_idea(topic, description, primary_category, ideal_creator, budget, resources, video_style):
    """Generates detailed information for a specific content idea using the Groq LLM."""
    
    system_prompt = """
    You are an expert content idea elaborator for beginner creators.
    Based on the provided information, generate a detailed description of the content idea.

    Your ENTIRE response MUST be a valid JSON object with the following keys:

    {
      "usp": "...",
      "step-by-step_guide": ["...", "..."],
      "resources": { ... },
      "performance_insights": { ... },
      "pro_tips": ["...", "..."],
      "quote": "..."
    }

    Do NOT include any extra text, explanations, or formatting — ONLY return a valid JSON object.
    """

    user_message = f"""
    Primary Video Category: {primary_category}
    Ideal Content Creator Inspiration: {ideal_creator}
    Budget: {budget}
    Available Resources: {resources}
    Preferred Video Style: {video_style}

    Topic: {topic}
    Brief Description: {description}
    """

    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
    )

    llm_response_content = response.choices[0].message.content

    # Debug raw response
    print("Raw LLM Response (Unstripped):")
    print(llm_response_content)

    llm_response_content_stripped = llm_response_content.strip()

    # Debug stripped response
    print("Raw LLM Response (Stripped):")
    print(llm_response_content_stripped)

    try:
        # Convert the LLM response to JSON
        return json.loads(llm_response_content_stripped)
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        return None
