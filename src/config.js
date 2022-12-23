const config = {
  dev: {
    data: "./data/data.json",
    data_apps: "./data/apps.json",
    data_overview: "./data/overview.json",
    data_themes: "./data/themes.json",
    data_help: "./data/help.json",
    data_faq: "./data/faq.json",
    data_landing: "./data/landing.json",
    data_html_pages: "./data/disclaimer.json",
    outdir: "./public",
    source: "./src",
    maris_css: "./src/assets/css/style-maris.css",
    toolbox_version: "latest",
  },
  url: {
    toolbox_app:
      "https://cds.climate.copernicus.eu/workflows/c3s/%APP%/master/configuration.json",
  },
  usage: {
    markdown_texts: false,
  },
};

module.exports = config;