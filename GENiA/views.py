from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse


def index(request):
    return HttpResponse('hello')
