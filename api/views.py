from django.shortcuts import redirect
from .write_json import parse


def spacy_parser(request):
    content = request.POST["content"]
    md5 = parse(content)
    return redirect('/spacy_parser/app?id='+md5)
