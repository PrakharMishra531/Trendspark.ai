import os
from django.core.management.base import BaseCommand
from pymongo import MongoClient
from api import youtubeSummary 
from datetime import datetime
import pytz
from dotenv import load_dotenv

load_dotenv()
MONGODB_URI = os.environ.get("MONGODB_URI")

class Command(BaseCommand):
    help = 'Fetches and caches clean trending YouTube data for specified countries'

    def handle(self, *args, **options):
        countries_to_cache = ['US', 'IN', 'GB', 'JP'] 
        self.stdout.write("Starting clean cache process...")
        for country in countries_to_cache:
            self.cache_country_trends(country)
        self.stdout.write(self.style.SUCCESS('Successfully completed caching process.'))

    def cache_country_trends(self, country):
        client = None
        try:
            self.stdout.write(f"Processing country: {country}...")

            cleaned_trending_data = youtubeSummary.get_trending_videos(country)
            
            if not cleaned_trending_data:
                self.stdout.write(self.style.WARNING(f"No data for {country}."))
                return

            client = MongoClient(MONGODB_URI)
            db = client.get_default_database()
            collection = db['trending_data_grouped'] 

            update_result = collection.update_one(
                {'country': country},
                {'$set': {'data': cleaned_trending_data, 'updated_at': datetime.now(pytz.utc)}},
                upsert=True
            )
            
            self.stdout.write(self.style.SUCCESS(f"Successfully cached clean data for {country}."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error for {country}: {e}"))
        finally:
            if client:
                client.close()