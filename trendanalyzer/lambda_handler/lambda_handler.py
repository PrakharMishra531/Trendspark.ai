import os
import json
import boto3
from datetime import datetime
import pytz

import youtubeSummary
import groq_llama

# Environment variables you'll set in the Lambda configuration
S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME")
COUNTRIES_TO_CACHE = ['US'] 

# Initialize the S3 client
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    """
    This function, triggered by EventBridge, fetches, analyzes, and caches
    trending YouTube data to an S3 bucket.
    """
    print("Starting trending data cache process...")

    for country in COUNTRIES_TO_CACHE:
        try:
            print(f"Processing country: {country}...")
            
            # 1. Fetch Trending Data
            cleaned_trending_data = youtubeSummary.get_trending_videos(country)
            
            if not cleaned_trending_data:
                print(f"WARNING: No data for {country}.")
                continue 

            # 2. Generate AI Analysis
            print(f"  -> Generating AI analysis for {country}...")
            analysis_str = groq_llama.get_ai_analysis(cleaned_trending_data)
            analysis_json = json.loads(analysis_str)

            # 3. Combine Data into a Single Object
            combined_data = {
                'data': cleaned_trending_data,
                'ai_analysis': analysis_json,
                'updated_at': datetime.now(pytz.utc).isoformat() # Use ISO format for JSON
            }
            
            # 4. Upload to S3
            file_name = f"trending_data.json"
            s3_client.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=file_name,
                Body=json.dumps(combined_data, indent=2),
                ContentType='application/json'
            )
            
            print(f"SUCCESS: Successfully cached data and analysis for {country} to S3.")

        except Exception as e:
            print(f"ERROR for {country}: {e}")
            
    return {
        'statusCode': 200,
        'body': json.dumps('Successfully completed caching process.')
    }