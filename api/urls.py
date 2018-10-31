from django.urls import path
from . import views

urlpatterns = [
    path('spacy_parse/', views.spacy_parser, name='spacy_parser'),
]
