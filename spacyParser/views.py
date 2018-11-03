from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse
from .write_json import parse


def index(request):
    latest_question_list = ['Q1', 'Q2', 'Q3']
    template = loader.get_template('index.html')
    context = {
        'latest_question_list': latest_question_list,
    }
    return HttpResponse(template.render(context, request))


# def parse(request):
#     print(request)


def app(request):
    if request.method == 'GET':
        # _id = request.GET.get('id', None)
        template = loader.get_template('app.html')
        # if _id:
        #     filename = './json/'+_id+'.js'
        #     context = {
        #         'json_file': filename,
        #         'id': _id
        #     }
        # else:
        #     context = {
        #         'json_file': False,
        #         'id': '等待上传'
        #     }
        return HttpResponse(template.render(None, request))
    elif request.method == 'POST':
        content = request.POST["content"]
        if content[0] != '{':
            return JsonResponse(parse(content))
        else:
            import json
            return JsonResponse(json.loads(content))
    
