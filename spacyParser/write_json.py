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

# Shape of interest
SOI = ['^X{2,}[xXd-]+$', '^[xX](?:[^\(\)\.;\:]*?d|d[^\(\)\.;\:]*?[xX])[^\(\)\.;\:]*$', '^xX[xXd-]+$']
BSOI = []  # ['.*?\-x+$']

nlp = spacy.load('en_core_web_sm', disable=['ner', 'parser'])

if __name__ == '__main__':
    with open('assets/stat/common_words.txt') as common_words_input:
        COMMON_WORDS = set(common_words_input.read().split('\n'))
else:
    with open('spacyParser/assets/stat/common_words.txt') as common_words_input:
        COMMON_WORDS = set(common_words_input.read().split('\n'))

BAD_WORDS = ['±', 'P', '=', 'i.e.', '>', '<', '-PRON-', 'URL', 'rho']


def is_noise(_token):
    def special(word):
        for rule in SOI:
            if re.match(rule, word.shape_):
                for b_rule in BSOI:
                    if re.match(b_rule, word.shape_):
                        return False
                return word
        return False

    _normal, _stop, _special, _url, _common, _weird = True, False, False, False, False, False
    x = special(_token)
    if x:
        _special = True
        # print(_token.text)
    elif any((_token.is_digit, _token.like_num, _token.lemma_ in STOP_WORDS, _token.is_punct, _token.is_space)) or \
            (_token.lemma_ in BAD_WORDS) or (len(_token.lemma_) == 1):
        _stop = True
    elif '.' in _token.lemma_:
        if _token.like_url:
            _url = True
        else:
            _weird = True
    elif (not _token.is_alpha) or _token.is_upper:
        _weird = True
    elif _token.lemma_ in COMMON_WORDS:
        _common = True
    if any((_stop, _special, _url, _common, _weird)):
        _normal = False
    return _normal, _stop, _common, _url, _special, _weird


def parse(content):
    # md5 = hashlib.md5(content.encode()).hexdigest()
    doc = nlp(content)
    tags = []
    attr_whole = []
    for word in doc:
        if not str(word).strip():
            continue
        tag = int(argmax(is_noise(word)))
        tags.append(tag)
        attrs = {}
        # attrs = []
        # group = {}
        # for attr in presents:
        #     if attr != '//':
        #         if attr == 'tag_':
        #             group[attr] = terms[word.__getattribute__(attr)]
        #         else:
        #             group[attr] = word.__getattribute__(attr)
        #     else:
        #         attrs.append(group)
        #         group = {}
        # attrs.append(group)
        for attr in presents:
            if attr != '//':
                if attr == 'tag_':
                    attrs[attr] = terms[word.__getattribute__(attr)]
                else:
                    attrs[attr] = word.__getattribute__(attr)
        attr_whole.append({
            "text": str(word),
            "label": tag,
            "features": list(attrs.values())
        })

    if __name__ == '__main__':
        info = json.dumps(attr_whole)
        tags = json.dumps(tags)
        return info, tags
    else:
        feature_names = [x for x in presents if x != '//']
        return {
            'words': {
                'original': content,
                'parsed': attr_whole
            },
            'labelConfig': {
                'names': TAG_LABELS,
                'colors': TAG_COLORS
            },
            'featureConfig': {
                'names': feature_names,
                'isLong': [1 if x == 'tag_' else 0 for x in feature_names]
            }
        }


TAG_LABELS = ['normal', 'stop', 'common', 'url', 'special', 'weird']
TAG_COLORS = ['white', '#444', 'rgb(14, 85, 0)', 'rgb(0, 247, 0)', 'rgb(255, 234, 0)', 'rgb(231, 73, 0)']

if __name__ == '__main__':
    txt = 'Functional reactivation of p53 pathway, although arduous, can potentially provide a broad-based strategy for cancer therapy owing to frequent p53 inactivation in human cancer. Using a phosphoprotein-screening array, we found that Benzyl Isothiocynate, (BITC) increases p53 phosphorylation in breast cancer cells and reveal an important role of ERK and PRAS40/MDM2 in BITC-mediated p53 activation. We show that BITC rescues and activates p53-signaling network and inhibits growth of p53-mutant cells. Mechanistically, BITC induces p73 expression in p53-mutant cells, disrupts the interaction of p73 and mutant-p53, thereby releasing p73 from sequestration and allowing it to be transcriptionally active. Furthermore, BITC-induced p53 and p73 axes converge on tumor-suppressor LKB1 which is transcriptionally upregulated by p53 and p73 in p53-wild-type and p53-mutant cells respectively; and in a feed-forward mechanism, LKB1 tethers with p53 and p73 to get recruited to p53-responsive promoters. Analyses of BITC-treated xenografts using LKB1-null cells corroborate in vitro mechanistic findings and establish LKB1 as the key node whereby BITC potentiates as well as rescues p53-pathway in p53-wild-type as well as p53-mutant cells. These data provide first in vitro and in vivo evidence of the integral role of previously unrecognized crosstalk between BITC, p53/LKB1 and p73/LKB1 axes in breast tumor growth-inhibition.'
    # with open(r'F:\Work\MingChen\Dato\Data\texts\25752762.txt', encoding='utf-8') as fp:
    #     txt = fp.read()
    print(txt)
    i, t = parse(txt)
    # print(t)
