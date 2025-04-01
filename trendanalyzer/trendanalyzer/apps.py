from django.apps import AppConfig

class TrendanalyzerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'trendanalyzer'

    def ready(self):
        pass 