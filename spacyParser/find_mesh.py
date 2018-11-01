import json
import re
from pymongo import MongoClient

# with open('api/stat/mesh.json') as mesh_input:
#     MESH_WORDS = set(json.loads(mesh_input.read()))
with open('stat/mesh.json') as mesh_input:
    MESH_WORDS = {x.lower(): x for x in json.loads(mesh_input.read())}


def find_mesh(content):
    mesh_dict = {'Descriptor': {}, 'Qualifier': {}}
    for term in MESH_WORDS:
        try:
            result = [x.span() for x in re.compile(term).finditer(content, re.I | re.M | re.S)]
        except Exception:
            for fake_symbol in ['(', ')', '+', '*', '.']:
                term = term.replace(fake_symbol, '\\' + fake_symbol)
            result = [x.span() for x in re.compile(term).finditer(content, re.I | re.M | re.S)]
        if len(list(result)) != 0:
            coll_type = 'Descriptor' if MESH_WORDS[term][0].isupper() else 'Qualifier'
            mesh_dict[coll_type][MESH_WORDS[term]] = {
                'hits': len(result),
                'positions': result
            }

    with MongoClient() as client:
        for coll_type in ['Descriptor', 'Qualifier']:
            tree_list = []
            xml_info = client.MeSH['xml_' + coll_type[:4].lower()].find(
                {coll_type + 'Name': {'$in': list(mesh_dict[coll_type].keys())}})
            xml_dict = {record[coll_type+'Name']: record for record in xml_info}

            for key in mesh_dict[coll_type]:
                tree_list += xml_dict[key]['TreeNumberList']
                mesh_dict[coll_type][key]['info'] = {
                    '_id': xml_dict[key]['_id'],
                    coll_type + 'Name': xml_dict[key][coll_type + 'Name'],
                    'ConceptList': [record['ConceptUI'] for record in xml_dict[key]['ConceptList']],
                    'TreeNumberList': xml_dict[key]['TreeNumberList']
                }

            tree_info = client.MeSH['tree_' + coll_type[:4].lower()].find(
                {'_id': {'$in': tree_list}})
            tree_dict_original = {record['_id']: record for record in tree_info}

            parents, children = set(), set()
            for record in tree_dict_original:
                levels = record.split('.')
                for level in range(len(levels)-1):
                    parents.update(['.'.join(levels[:level+1])])
                children.update(tree_dict_original[record].get('children', []))
            tree_info = client.MeSH['tree_' + coll_type[:4].lower()].find(
                {'_id': {'$in': list(parents) + list(children)}})
            tree_info_horizontal = {record['_id']: record for record in tree_info}

            for key in mesh_dict[coll_type]:
                info_tree_dict = {}
                for tree_id in mesh_dict[coll_type][key]['info']['TreeNumberList']:
                    info_tree_dict[tree_id] = {'hierarchy': [], 'children': []}
                    levels = tree_id.split('.')
                    for level in range(len(levels) - 1):
                        _id = '.'.join(levels[:level + 1])
                        info_tree_dict[tree_id]['hierarchy'].append({'id': _id, 'term': tree_info_horizontal[_id]['term']})
                    for child_id in tree_dict_original[tree_id].get('children', []):
                        info_tree_dict[tree_id]['children'].append({'id': child_id, 'term': tree_info_horizontal[child_id]['term']})
                mesh_dict[coll_type][key]['info'].pop('TreeNumberList')
                mesh_dict[coll_type][key]['info']['TreeNumberList'] = info_tree_dict

            print(json.dumps(mesh_dict, indent=4))
        # info = {
        #     'annotation': info.get('Annotation', ''),
        #     'tree': info['TreeNumberList'],
        #     'concepts': str(info['ConceptList'])
        # }
        # for tree_id in info['TreeNumberList']:
        #     pass

    # print(json.dumps(mesh_dict, indent=4))


if __name__ == '__main__':
    txt = 'The best suture method to prevent incisional surgical-site infection (SSI) ' \
          'after clean-contaminated surgery has not been clarified.\r\n' \
          'Patients undergoing elective colorectal cancer surgery at one of 16 centres ' \
          'were randomized to receive either subcuticular sutures or skin stapling for ' \
          'skin closure. The primary endpoint was the rate of incisional SSI. Secondary ' \
          'endpoints of interest included time required for wound closure, incidence of ' \
          'wound problems, postoperative length of stay, wound aesthetics and patient ' \
          'satisfaction.\r\n' \
          'A total of 1264 patients were enrolled. The cumulative incidence of ' \
          'incisional SSI by day 30 after surgery was similar after subcuticular ' \
          'sutures and stapled closure (8·7 versus 9·8 per cent respectively; P\u2009' \
          '=\u20090·576). Comparison of cumulative incidence curves revealed that SSI ' \
          'occurred later in the subcuticular suture group (P\u2009=\u20090·019) ' \
          '(hazard ratio 0·66, 95 per cent c.i. 0·45 to 0·97). Wound problems (P\u2009' \
          '=\u20090·484), wound aesthetics (P\u2009=\u20090·182) and postoperative ' \
          'duration of hospital stay (P\u2009=\u20090·510) did not differ between the ' \
          'groups; subcuticular sutures took 5\u2009min longer than staples (P < ' \
          '0·001). Patients in the subcuticular suture group were significantly more ' \
          'satisfied with their wound (52·4 per cent versus 42·7 per cent in the staple ' \
          'group; P\u2009=\u20090·002).\r\n' \
          'Compared with skin stapling, subcuticular sutures did not reduce the risk of ' \
          'incisional SSI after colorectal surgery.\r\n' \
          'UMIN000004001 (http://www.umin.ac.jp/ctr).'
    find_mesh(txt)
