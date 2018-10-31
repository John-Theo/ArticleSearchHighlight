import hashlib
import spacy
import json
import re
from numpy import argmax
from spacy.lang.en.stop_words import STOP_WORDS

terms = {
    '-LRB-': 'left round bracket', '-RRB-': 'right round bracket', ',': 'punctuation mark, comma',
    ':': 'punctuation mark, colon or ellipsis', '.': 'punctuation mark, sentence closer',
    "''": 'closing quotation mark', '""': 'closing quotation mark', '#': 'symbol, number sign',
    '``': 'opening quotation mark', '$': 'symbol, currency', 'ADD': 'email', 'AFX': 'affix',
    'BES': 'auxiliary "be"', 'CC': 'conjunction, coordinating', 'CD': 'cardinal number', 'DT': '',
    'EX': 'existential there', 'FW': 'foreign word', 'GW': 'additional word in multi-word expression',
    'HVS': 'forms of "have"', 'HYPH': 'punctuation mark, hyphen',
    'IN': 'conjunction, subordinating or preposition', 'JJ': 'adjective', 'JJR': 'adjective, comparative',
    'JJS': 'adjective, superlative', 'LS': 'list item marker', 'MD': 'verb, modal auxiliary',
    'NFP': 'superfluous punctuation', 'NIL': 'missing tag', 'NN': 'noun, singular or mass',
    'NNP': 'noun, proper singular', 'NNPS': 'noun, proper plural', 'NNS': 'noun, plural', 'PDT': 'predeterminer',
    'POS': 'possessive ending', 'PRP': 'pronoun, personal', 'PRP$': 'pronoun, possessive', 'RB': 'adverb',
    'RBR': 'adverb, comparative', 'RBS': 'adverb, superlative', 'RP': 'adverb, particle', '_SP': 'space',
    'SYM': 'symbol', 'TO': 'infinitival to', 'UH': 'interjection', 'VB': 'verb, base form',
    'VBD': 'verb, past tense', 'VBG': 'verb, gerund or present participle', 'VBN': 'verb, past participle',
    'VBP': 'verb, non-3rd person singular present', 'VBZ': 'verb, 3rd person singular present',
    'WDT': 'wh-determiner', 'WP': 'wh-pronoun, personal', 'WP$': 'wh-pronoun, possessive', 'WRB': 'wh-adverb',
    'XX': 'unknown',
    '': '',
}

presents = [
    'i', 'idx', '//',
    'lemma_', '//',
    'shape_', '//',
    'tag_', 'pos_', '//',
    'like_email', 'like_num', 'like_url', '//',
    'is_alpha',
    'is_digit', 'is_punct',
    'is_stop', 'is_upper'
]

if __name__ == '__main__':
    with open('stat/common_words.txt') as common_words_input:
        COMMON_WORDS = set(common_words_input.read().split('\n'))
else:
    with open('api/stat/common_words.txt') as common_words_input:
        COMMON_WORDS = set(common_words_input.read().split('\n'))

BAD_WORDS = ['±', 'P', '=', 'i.e.', '>', '<', '-PRON-', 'URL', 'rho']


def is_noise(_token):
    GOOD, IS_STOP, WEIRD, MAYBE_URL, IS_COMMON = True, False, False, False, False
    if any((_token.is_digit, _token.like_num, _token.lemma_ in STOP_WORDS, _token.is_punct, _token.is_space)) or \
            (_token.lemma_ in BAD_WORDS) or (len(_token.lemma_) == 1):
        IS_STOP = True
    elif '.' in _token.lemma_:
        if _token.like_url:
            MAYBE_URL = True
        else:
            WEIRD = True
    elif (not _token.is_alpha) or _token.is_upper:
        WEIRD = True
    elif _token.lemma_ in COMMON_WORDS:
        IS_COMMON = True
    if any((IS_STOP, WEIRD, MAYBE_URL, IS_COMMON)):
        GOOD = False
    # print('%30s  %5s %5s %5s %5s %5s' % (_token.lemma_, GOOD, IS_STOP, WEIRD, MAYBE_URL, IS_COMMON))
    return GOOD, IS_STOP, WEIRD, MAYBE_URL, IS_COMMON


def parse(content):
    nlp = spacy.load('en_core_web_sm', disable=['ner', 'parser'])
    md5 = hashlib.md5(content.encode()).hexdigest()
    doc = nlp(content)
    text = json.dumps([str(x) for x in doc])
    tags = []
    attr_whole = []
    for word in doc:
        tags.append(int(argmax(is_noise(word))))
        attr_list = []
        group = {}
        for attr in presents:
            attr = attr.strip()
            if attr != '//':
                if attr == 'tag_':
                    group[attr] = terms[word.__getattribute__(attr)]
                else:
                    group[attr] = word.__getattribute__(attr)
            else:
                attr_list.append(group)
                group = {}
        attr_list.append(group)
        attr_whole.append(attr_list)
        print(word)
    info = json.dumps(attr_whole)
    tags = json.dumps(tags)
    if __name__ != '__main__':
        with open('spacyParser/assets/json/' + md5 + '.js', 'w') as f:
            f.write('\ntext=' + text + ';\ninfo=' + info + ';\ntag=' + tags + ';\n')
        return md5
    else:
        return info, tags


if __name__ == '__main__':
    txt = 'The best suture method to prevent incisional surgical-site infection (SSI) '\
             'after clean-contaminated surgery has not been clarified.\r\n'\
             'Patients undergoing elective colorectal cancer surgery at one of 16 centres '\
             'were randomized to receive either subcuticular sutures or skin stapling for '\
             'skin closure. The primary endpoint was the rate of incisional SSI. Secondary '\
             'endpoints of interest included time required for wound closure, incidence of '\
             'wound problems, postoperative length of stay, wound aesthetics and patient '\
             'satisfaction.\r\n'\
             'A total of 1264 patients were enrolled. The cumulative incidence of '\
             'incisional SSI by day 30 after surgery was similar after subcuticular '\
             'sutures and stapled closure (8·7 versus 9·8 per cent respectively; P\u2009'\
             '=\u20090·576). Comparison of cumulative incidence curves revealed that SSI '\
             'occurred later in the subcuticular suture group (P\u2009=\u20090·019) '\
             '(hazard ratio 0·66, 95 per cent c.i. 0·45 to 0·97). Wound problems (P\u2009'\
             '=\u20090·484), wound aesthetics (P\u2009=\u20090·182) and postoperative '\
             'duration of hospital stay (P\u2009=\u20090·510) did not differ between the '\
             'groups; subcuticular sutures took 5\u2009min longer than staples (P < '\
             '0·001). Patients in the subcuticular suture group were significantly more '\
             'satisfied with their wound (52·4 per cent versus 42·7 per cent in the staple '\
             'group; P\u2009=\u20090·002).\r\n'\
             'Compared with skin stapling, subcuticular sutures did not reduce the risk of '\
             'incisional SSI after colorectal surgery.\r\n'\
             'UMIN000004001 (http://www.umin.ac.jp/ctr).'

    i, t = parse(txt)
    print(t)
