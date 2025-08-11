from groq import Groq
import os
from dotenv import load_dotenv
import json
from .youtubeSummary import get_trending_videos
load_dotenv()
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


def get_ai_analysis(video_data_list: list):
    """
    Takes a clean list of video data and uses the specified LLM to generate
    a high-level analysis and summaries.
    """
    clean_data_as_string = json.dumps(video_data_list, indent=2)

    system_prompt = """You are an expert YouTube Content Strategist. Your goal is to deconstruct trends and provide actionable creative advice for new creators. You will be given a JSON list of trending video data.

Your task is to perform the following strategic analysis:

1.  **Dominant Theme**: In one sentence, identify the single biggest, most obvious theme in the current trends (e.g., "Major music video releases and movie trailers are capturing the most attention.").
2.  **Emerging Trend**: In one sentence, identify a smaller, newer, or more accessible trend that a new creator could realistically participate in (e.g., "Commentary on specific Roblox games seems to be an emerging niche.").
3.  **Video Breakdowns**: For the top 5 videos, provide a detailed breakdown.

Your entire response MUST be a single, valid JSON object with the following structure:
{
  "dominant_theme": "Your analysis of the main trend.",
  "emerging_trend": "Your analysis of a secondary, accessible trend.",
  "video_breakdowns": [
    {
      "title": "Title of Video 1",
      "format_type": "The video's format (e.g., 'Music Video', 'Game Commentary', 'Product Review', 'Challenge Video').",
      "success_factor": "A brief explanation of WHY this specific video is successful (e.g., 'Leverages the hype of a new game update with humorous, fast-paced editing.').",
      "adaptable_angle": "A concrete, actionable idea for how a new creator could adapt this trend (e.g., 'Create a video showcasing the 3 funniest glitches from the same Roblox game.')."
    },
    { ... }
  ]
}
"""

    try:
        completion = groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
              {
                "role": "system",
                "content": system_prompt
              },
              {
                "role": "user",
                "content": f"Here is the list of trending videos:\n{clean_data_as_string}"
              }
            ],
            temperature=0.2,
            max_tokens=4096, 
            top_p=1,
            stream=False,
            response_format={"type": "json_object"},
            stop=None
        )
        
        return completion.choices[0].message.content

    except Exception as e:
        print(f"LLM analysis failed: {e}")
        return json.dumps({"error": "Failed to generate AI analysis."})
    
if __name__ == "__main__":
    video_data_list = get_trending_videos("US")
    # print(get_ai_analysis(video_data_list))