from django.http import HttpResponseRedirect


def index(request):
    return HttpResponseRedirect('/spacy_parser/app')
