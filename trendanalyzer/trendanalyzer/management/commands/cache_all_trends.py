import os
from django.core.management.base import BaseCommand
from pymongo import MongoClient
import json
from api import youtubeSummary
from api import groq_llama
from datetime import datetime, timedelta
import pytz
from dotenv import load_dotenv

load_dotenv()
MONGODB_URI = os.environ.get("MONGODB_URI")

class Command(BaseCommand):
    help = 'Fetches and caches trending YouTube data for specified countries and types'

    def handle(self, *args, **options):
        countries_to_cache = ['US'] 
        types_to_cache = ['gaming', 'music']

        for country in countries_to_cache:
            for content_type in types_to_cache:
                self.cache_trends(country, content_type)

        self.stdout.write(self.style.SUCCESS('Successfully cached trending data for all specified countries and types.'))

    def cache_trends(self, country, content_type):
        try:
            self.stdout.write(f"Fetching and caching trends for {country} - {content_type}...")
            trending_data = youtubeSummary.get_trending_videos(country, content_type)
            if not trending_data:
                self.stdout.write(self.style.WARNING(f"No trending data found for {country} - {content_type}."))
                return

            llama_response = groq_llama.llama(json.dumps(trending_data))
            analysis_results = json.loads(llama_response)

            client = MongoClient(MONGODB_URI)
            db = client.get_default_database()
            collection = db['trending_data_grouped'] 

            # Store or update the data
            update_result = collection.update_one(
                {'country': country, 'type': content_type},
                {'$set': {'data': analysis_results, 'updated_at': datetime.now(pytz.utc)}},
                upsert=True
            )
            self.stdout.write(self.style.SUCCESS(f"Cached data for {country} - {content_type}. Updated: {update_result.modified_count}, Upserted: {update_result.upserted_id}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error fetching and caching {country} - {content_type}: {e}"))
        finally:
            if 'client' in locals():
                client.close()