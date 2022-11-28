from itertools import chain 
from mdutils.mdutils import MdUtils
import os
import simplejson


def find_table_contents(dicts, indicator, table_name):
    for dictionary in dicts:
        dictionary = list(dictionary.values())[0]
        if dictionary['Indicator'] == indicator and table_name in dictionary.keys():
            rows = dictionary[table_name]
            if isinstance(rows, list):
                table = [list(rows[0].keys())]
                for row in rows:
                    values = [value.replace('\n', ' ').replace('<', '`<').replace('>', '>`') for value in list(row.values())]
                    table.append(values)
            else:
                table = [list(rows.keys())]
                values = [value.replace('\n', ' ').replace('<', '`<').replace('>', '>`') for value in list(rows.values())]
                table.append(values)

            return table
    
    return []


def write_md_files():
    with open('content/json/Consolidated.json') as texts_reader, open('content/json/FiltersConsol.json') as filters_reader, open('content/json/PUPlotsConsol.json') as pop_up_reader:

        texts = simplejson.load(texts_reader)
        filters = simplejson.load(filters_reader)
        pop_ups = simplejson.load(pop_up_reader)

        for text in texts:
            text = list(text.values())[0]
            title = text['PageTitle']
            indicator = text['Indicator']
            file_name = title.replace(' ', '_')
            base_path = f'content/markdown/consolidated'

            if not os.path.exists(base_path):
                os.makedirs(base_path)

            mdFile = MdUtils(file_name=os.path.join(base_path, file_name), title=title)
            mdFile.new_header(level=1, title=indicator)
            
            mdFile.new_header(level=2, title='Main')
            mdFile.new_paragraph(text['ConsolidatedText_Main'])

            main_filter_table = find_table_contents(filters, indicator, 'Main Filters')
            if main_filter_table:
                mdFile.new_line()
                mdFile.new_table(columns=len(main_filter_table[0][:]), rows=len(main_filter_table[:]), 
                                 text=list(chain.from_iterable(main_filter_table)), text_align='left')
            
            mdFile.new_paragraph('<br />')
            mdFile.new_line()
            mdFile.new_header(level=2, title='Explore')
            mdFile.new_paragraph(text['ConsolidatedText_Explore'])

            explore_filter_table = find_table_contents(filters, indicator, 'Explore Filters')
            if explore_filter_table:
                mdFile.new_line()
                mdFile.new_table(columns=len(explore_filter_table[0][:]), rows=len(explore_filter_table[:]), 
                                 text=list(chain.from_iterable(explore_filter_table)), text_align='left')

            pop_up_plots_table = find_table_contents(pop_ups, indicator, 'PopUpElements')
            if pop_up_plots_table:
                mdFile.new_paragraph('<br />')
                mdFile.new_line()
                mdFile.new_header(level=3, title='NUTS Pop Up Plot')
                mdFile.new_table(columns=len(pop_up_plots_table[0][:]), rows=len(pop_up_plots_table[:]), 
                                 text=list(chain.from_iterable(pop_up_plots_table)), text_align='left')

            climatology_plots_table = find_table_contents(pop_ups, indicator, 'ClimatologyElements')
            if climatology_plots_table:
                mdFile.new_paragraph('<br />')
                mdFile.new_line()
                mdFile.new_header(level=3, title='NUTS Climatology Plot')
                mdFile.new_table(columns=len(climatology_plots_table[0][:]), rows=len(climatology_plots_table[:]), 
                                 text=list(chain.from_iterable(climatology_plots_table)), text_align='left')
            

            mdFile.create_md_file()


if __name__ == '__main__':
    write_md_files()