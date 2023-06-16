import json


def make_overview_table():
    with open(f'../data/data_consolidated.json') as f:
        data = json.load(f)

    overview_table = {}
    for key, indicator in data['indicators'].items():
        hazard_category = indicator['hazard_category']
        hazard_type = indicator['hazards'][0]
        theme = indicator['theme'][0].lower()
        slug = indicator['detailpage']
        
        new_item = {
            'indicator_text': indicator['page_title'],
            'indicator_url': f'{theme}/{slug}',
            'zip_text': 'Zip download',
            'zip_url': 'pippo'
        }

        if overview_table.get(hazard_category) is None:
            overview_table[hazard_category] = {
                hazard_type: []
            }
        if overview_table[hazard_category].get(hazard_type) is None:
            overview_table[hazard_category][hazard_type] = []
                
        overview_table[hazard_category][hazard_type].append(new_item)

    with open(f'../data/overview_table.json', 'w', encoding='utf-8') as f:
        json.dump(overview_table, f, ensure_ascii=False, indent=4)


if __name__ == '__main__':
    make_overview_table()
