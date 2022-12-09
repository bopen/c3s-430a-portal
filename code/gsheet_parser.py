from apiclient import discovery
from credentials import get_credentials
import httplib2
import simplejson

SPREAD_SHEET = '1dOKSdZer1CAcZ9Nmdxzq1qyrNBSv9XXgd5JUmm5gOhs'
WORK_SHEETS = ['Consolidated_430a']


def empty_dict_check(dictionary):
    for value in dictionary.values():
        if value:
            return False
    
    return True


def dicts_from_sheet_values(rows):
    records = []
    headers = rows[0]

    if headers[0] == 'Identifier':
        for row in rows[1:]:
            record = {}
            identifier = row[0]
            record[identifier] = {}

            for i, header in enumerate(headers[1:]):
                try:
                    value = row[i+1]
                except IndexError:
                    value = ""
                record[identifier][header] = value

            records.append(record)

    else:
        for row in rows[1:]:
            record = {}

            for i, header in enumerate(headers):
                try:
                    value = row[i]
                except IndexError:
                    value = ""
                record[header] = value
            
            records.append(record)

    return records


def filters_consol_dicts_from_values(rows):
    records = []
    # Identifier, Indicator, Main Filters, Explore Filters
    headers = [rows[0][0], rows[0][1], rows[0][2], rows[0][5]]
    # Main Filters: title, subtitle, popUpText
    # Explore Filters: title, subtitle, popUpText
    sub_headers = {headers[2]: rows[1][2:5], headers[3]: rows[1][5:8]}

    record = {}
    for row in rows[2:]:
        if row[0]:
            records.append(record)
            record = {}
            identifier = row[0]
            record[identifier] = {}
            record[identifier][headers[1]] = row[1]
            record[identifier][headers[2]] = []
            record[identifier][headers[3]] = []
        
        main_dict = {}
        for i, main_sub_header in enumerate(sub_headers[headers[2]]):
            try:
                value = row[i+2]
            except IndexError:
                value = ""
            main_dict[main_sub_header] = value

        if not empty_dict_check(main_dict):
            record[identifier][headers[2]].append(main_dict)

        explore_dict = {}
        for i, explore_sub_header in enumerate(sub_headers[headers[3]]):
            try:
                value = row[i+5]
            except IndexError:
                value = ""
            explore_dict[explore_sub_header] = value

        if not empty_dict_check(explore_dict):
            record[identifier][headers[3]].append(explore_dict)

    return records[1:]


def pop_up_plots_consol_dicts_from_values(rows):
    records = []
    indicator = rows[0][1]
    element_num = 5

    for i in range(1, len(rows[:]), element_num):
        record = {}
        identifier = rows[i][0]
        record[identifier] = {}
        record[identifier][indicator] = rows[i][1]

        pop_up_dict = {}
        climatology_dict = {}
        for j in range(0, element_num):
            element_name = rows[i+j][2]
            try:
                pop_up_element_value = rows[i+j][3]
            except IndexError:
                pop_up_element_value = ""
            
            pop_up_dict[element_name] = pop_up_element_value

            try:
                climatology_value = rows[i+j][4]
            except IndexError:
                climatology_value = ""

            climatology_dict[element_name] = climatology_value

        if not empty_dict_check(pop_up_dict):
            record[identifier]["PopUpElements"] = pop_up_dict
        
        if not empty_dict_check(climatology_dict):
            record[identifier]["ClimatologyElements"] = climatology_dict
        
        records.append(record)

    return records


def parse_google_spreadsheet():
    credentials = get_credentials()
    http = credentials.authorize(httplib2.Http())
    discoveryUrl = ('https://sheets.googleapis.com/$discovery/rest?version=v4')
    service = discovery.build('sheets', 'v4', http=http, discoveryServiceUrl=discoveryUrl)

    for work_sheet in WORK_SHEETS:
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREAD_SHEET, 
            range=work_sheet
        ).execute()
        values = result.get('values', [])

        if not values:
            raise exception(f'No data found for {work_sheet}')
        
        if work_sheet == 'FiltersConsol':
            records = filters_consol_dicts_from_values(values)
        elif work_sheet == 'PUPlotsConsol':
            records = pop_up_plots_consol_dicts_from_values(values)
        else:
            records = dicts_from_sheet_values(values)

        with open(f'../content/json/{work_sheet}.json', "w") as writer:
            simplejson.dump(records, writer, indent=4)


if __name__ == '__main__':
    parse_google_spreadsheet()
