# C3S 430a portal

To manage the European Climate Data Explorer (ECDE) website being developed by the C3S 430a project.

Example page for an ECDE indicator:
https://c3s.maris.nl/health/climatic-suitability-of-tiger-mosquito--season-length.html 

ECDE apps on Toolbox: [Toolbox Editor (shared ecde space)](https://cds.climate.copernicus.
eu/toolbox-editor/ecde-2) 
<!-- Oud: [Toolbox Editor (user: 40366)](https://cds.climate.copernicus.eu/toolbox-editor/40366) -->


Google sheet containing indicators information:  
https://docs.google.com/spreadsheets/d/1dOKSdZer1CAcZ9Nmdxzq1qyrNBSv9XXgd5JUmm5gOhs/edit#gid=625032748

## Project structure

`gsheet_parser` contains the necessary scripts to parse google sheets
`src` contains templates, data and generator script \
`public` contains the generated website \
`data` contains the JSON data required for generating the website (we use texts & titles from the [C3S_434 github repo](https://raw.githubusercontent.com/cedadev/c3s_434_ecde_page_text/main/content/json/Consolidated.json))
  
<!-- **Useful links:**
- [Climate Adapt Indicators - Display Characteristics](https://docs.google.com/spreadsheets/d/1MgG4EkD4U7mcx9XlWXUWNZym_-tEWLzZ0_p_990TISw/edit)
- [Sector abstracts](https://docs.google.com/document/d/11pHja-EIfQZ1CbP3c3i1Wb_fQG8IZhhd08MWg_n04s0/edit)
- [C3S 434 Datasets, Variables and Sectors](https://docs.google.com/spreadsheets/d/1mu9vXOmDiLM9lxYy6Zn77z-IiCtFtBl8E2qopkAFvkY/edit#gid=1571342132)
- [Script for instruction video](https://docs.google.com/document/d/1UvpqF3lRJim4oZTY5hOXQ8T6qH7lOj9QCGuv21EUHl4/edit)
- [Drop down box texts](https://docs.google.com/spreadsheets/d/1BHVHR1-3DC-AJ1ZQUtGUOs25fiGrt0adwmZcSNDFMk0/edit#gid=1897667492)
- [Workflow Checklist](https://docs.google.com/document/d/1iAwrGfDJVWg_NstecLFifOZ4ap7SEyy7ujR4zHEQWwU/edit)

**Submit apps:**  
- [jira.ecmwf.int CDSAPP-119](https://jira.ecmwf.int/servicedesk/customer/portal/8/CDSAPP-119)  

Alle apps worden gedeeld met user 136 en 13784 -->


## Usage ##

### Collect information from google sheets

First install the requirements;

```bash
pip install -r requirements.txt
```

To download the google sheets data and parse it to JSON, run the following commands;

```bash
cd gsheet_parser
python gsheet_parser.py
```

The first time you run this, an exception will be raised and you will be prompted with a [link](https://developers.google.com/sheets/api/quickstart/python) in the terminal. Open the link in a web browser and go to step one where there is a button called `Enable the Google Sheets API`. Click this and follow the steps, call your project what you like (or just leave it as 'Quickstart') and choose `Desktop app`. You can then click `Download Client Configuration`. You will need to rename and move this file to this location;

```
{TOP_LEVEL_GIT_DIR}/client_secret.json
```

The next time you run `gsheet_parser.py` (**If you are on a machine that can't open a browser, run with the argument `--noauth_local_webserver`**) you'll be prompted with another link. Follow this and sign in with google, you'll be met with a page saying the `Google hasn't verified this app`, click `Advanced`, then `Go to Quickstart (unsafe)`. Then grant permission to view google spread sheets (if you ran with `--noauth_local_webserver` you'll need to copy a code and paste it into the terminal prompt).


After that, `gsheet_parser.py` will have the information it needs to download the google sheets content.
<br />

### Generate HTML pages

Requirements:

- NodeJS (min v12)
- Yarn


Setup:
  
`yarn install` to install dependencies


Usage:

`yarn dev` to autogenerate pages on file update \
`yarn build` to generate pages

