from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader


def index(request):
    latest_question_list = ['Q1', 'Q2', 'Q3']
    template = loader.get_template('index.html')
    context = {
        'latest_question_list': latest_question_list,
    }
    return HttpResponse(template.render(context, request))


def parse(request):
    print(request)


def app(request):
    _id = request.GET.get('id')
    filename = './json/'+_id+'.js'
    template = loader.get_template('app.html')
    context = {
        'json_file': filename,
    }
    return HttpResponse(template.render(context, request))
