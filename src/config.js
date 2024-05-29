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
  },
  url: {
    cads_app_entrypoint_url:
      process.env.CADS_APP_ENTRYPOINT_URL ||
      "https://ecds-dev.bopen.compute.cci2.ecmwf.int/c3s-apps/ecde/assets/main-0.0.0.js",
    cads_api_base:
      process.env.CADS_API_BASE ||
      "https://ecds-dev.bopen.compute.cci2.ecmwf.int/c3s-apps/ecde/api",
    cads_internal_assets_base:
      process.env.CADS_INTERNAL_ASSETS_BASE ||
      "https://ecds-dev.bopen.compute.cci2.ecmwf.int/c3s-apps/ecde",
  },
  usage: {
    markdown_texts: false,
  },
};

module.exports = config;
