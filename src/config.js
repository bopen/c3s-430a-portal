const config = {
  dev: {
    data: "./data/data.json",
    data_apps: "./data/data_apps.json",
    data_overview: "./data/data_overview.json",
    data_themes: "./data/data_themes.json",
    data_html_pages: "./data/data_html_pages.json",
    outdir: "./public",
    source: "./src",
    maris_css: "./src/assets/css/style-maris.css",
    toolbox_version: "latest",
  },
  url: {
    toolbox_app:
      "https://cds.climate.copernicus.eu/workflows/c3s/%APP%/master/configuration.json",
    git_md:
      "https://raw.githubusercontent.com/bopen/c3s_430a_ecde_page_text/splitted-ConsolidatedText/content/markdown/consolidated/%TITLE%.md",
    git_json:
      "https://raw.githubusercontent.com/bopen/c3s_430a_ecde_page_text/splitted-ConsolidatedText/content/json/Consolidated.json",
    git_glossary_json:
      "https://raw.githubusercontent.com/bopen/c3s_430a_ecde_page_text/splitted-ConsolidatedText/content/json/Glossary.json",
  },
  usage: {
    markdown_texts: false,
  },
};

module.exports = config;