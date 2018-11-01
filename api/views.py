from django.shortcuts import redirect
from .write_json import parse
from django.http import HttpResponse
import json


def spacy_parser(request):
    content = request.POST["content"]
    md5 = parse(content)

    test_json = {1: '1', 2: '2'}
    return HttpResponse(json.dumps(test_json), content_type="application/json")
    # return redirect('/spacy_parser/app?id='+md5)
