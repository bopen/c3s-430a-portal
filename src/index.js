const fs = require("fs");
const fse = require("fs-extra");
const config = require("./config");
const ejs = require("ejs");
const rimraf = require("rimraf");
const sync_request = require("sync-request");
const { StringDecoder } = require("string_decoder");
const marked = require("marked");
const crypto = require("crypto");

const hashSum = crypto.createHash("sha256");

const decoder = new StringDecoder("utf8");

// create output dir or empty output dir
try {
  if (!fs.existsSync(config.dev.outdir)) {
    fs.mkdirSync(config.dev.outdir);
  } else {
    rimraf.sync(config.dev.outdir);

    if (!fs.existsSync(config.dev.outdir)) {
      fs.mkdirSync(config.dev.outdir);
    }
  }
} catch (error) {
  console.error("Outdir prep error:", error);
}

const srcPath = config.dev.source;
const outputDir = config.dev.outdir;

//load data files.
const data_apps = JSON.parse(fs.readFileSync(config.dev.data_apps, "utf-8"));
const data_themes = JSON.parse(
  fs.readFileSync(config.dev.data_themes, "utf-8")
);
const data_help = JSON.parse(
  fs.readFileSync(config.dev.data_help, "utf-8")
);
const data_faq = JSON.parse(
  fs.readFileSync(config.dev.data_faq, "utf-8")
);
const data_overview = JSON.parse(
  fs.readFileSync(config.dev.data_overview, "utf-8")
);
const data_html_pages = JSON.parse(
  fs.readFileSync(config.dev.data_html_pages, "utf-8")
);
const maris_css_file = fs.readFileSync(config.dev.maris_css, "utf-8");

hashSum.update(maris_css_file);
const maris_css_hash = hashSum.digest("hex").substring(0, 10);

//retrieve indicator texts from github.
//let data_git_json = [];
//let git_json_result = sync_request("GET", config.url.git_json);

const data_git_json = JSON.parse(fs.readFileSync("data/data.json", "utf-8"));
const data_git_glossary = JSON.parse(fs.readFileSync("data/glossary.json", "utf-8"));

// copy assets to output dir
fse.copy(`${srcPath}/assets`, outputDir);

//generate all pages
createAppPages(data_apps);

// Add data_apps to data_themes & data_overview
Object.assign(data_themes, data_apps);

createThemePages(data_themes);
createHelpPages(data_help);
createFAQPages(data_faq);

// Add data_apps to data_themes & data_overview
Object.assign(data_overview, data_apps);

createOverviewPage(data_overview);

createIndexPage();

createHtmlPages(data_html_pages);

createGlossaryPage(data_git_glossary);

// console.log(data_themes);

//reformat the data_apps object, so it correctly uses key-value pair with the identifier as key
let data_apps_reformatted = {
  indicators: {},
  toolbox_embed_version: config.dev.toolbox_version,
};

for (const index in data_apps["indicators"]) {
  const dataset = data_apps["indicators"][index];
  data_apps_reformatted.indicators[dataset.identifier] = dataset;
}

let data_themes_reformatted = { themes: {} };
for (const index in data_themes["themes"]) {
  const theme = data_themes["themes"][index];
  let key = theme.theme_title.toLowerCase();
  data_themes_reformatted.themes[key] = theme;
}

//remove inidicators key from other data objects:
delete data_overview.indicators;
delete data_themes.indicators;

// Add all data to data_apps
Object.assign(data_apps_reformatted, data_themes_reformatted, {
  overview_page: data_overview,
  html_pages: data_html_pages,
  glossary_table: glossary_html.replace("    ", ""),
});

fs.writeFileSync(
  "./data/data_consolidated.json",
  JSON.stringify(data_apps_reformatted, null, 2)
);

function createIndexPage() {
  ejs.renderFile(
    `${srcPath}/templates/index.ejs`,
    { css_version: maris_css_hash },
    (err, data) => {
      if (err) throw err;
      const indexPage = `${outputDir}/index.html`;
      fs.writeFile(indexPage, data, (err) => {
        if (err) throw err;
        console.log(`[Index page] \t\t${indexPage} has been created.`);
      });
    }
  );
}

function createOverviewPage(overview_data) {
  let hazard_list = {};

  for (const index in overview_data["indicators"]) {
    const dataset = overview_data["indicators"][index];

    if (dataset["exclude"]) continue;

    if (!hazard_list.hasOwnProperty(dataset["hazard_category"])) {
      hazard_list[dataset["hazard_category"]] = {};
    }

    for (const index in dataset["hazards"]) {
      const hazard = dataset["hazards"][index];

      if (!hazard_list[dataset["hazard_category"]].hasOwnProperty(hazard)) {
        hazard_list[dataset["hazard_category"]][hazard] = [];
      }

      //prevent duplicates
      if (
        !hazard_list[dataset["hazard_category"]][hazard].find(
          (element) => element.title == dataset.page_title
        )
      ) {
        //add to themed list.
        hazard_list[dataset["hazard_category"]][hazard].push({
          title: dataset.page_title,
          url: dataset.theme[0].toLowerCase() + "/" + detailFileName(dataset),
        });
      }
    }
  }

  overview_data.hazard_list = hazard_list;
  overview_data.css_version = maris_css_hash;

  ejs.renderFile(
    `${srcPath}/templates/overview-list.ejs`,
    overview_data,
    (err, data) => {
      if (err) throw err;
      const overviewPage = `${outputDir}/overview-list.html`;
      fs.writeFile(overviewPage, data, (err) => {
        if (err) throw err;
        console.log(`[Overview page] \t${overviewPage} has been created.`);
      });
    }
  );
}

function createAppPages(data) {
  for (const index in data["indicators"]) {
    const dataset = data["indicators"][index];

    dataset.overview = config.url.toolbox_app.replace(
      "%APP%",
      dataset.overview
    );
    dataset.detail = config.url.toolbox_app.replace("%APP%", dataset.detail);
    dataset.toolbox_embed_version = config.dev.toolbox_version;

    dataset.theme.forEach((theme) => {
      // theme directory
      if (!fs.existsSync(`${outputDir}/${theme.toLowerCase()}/`)) {
        fs.mkdirSync(`${outputDir}/${theme.toLowerCase()}/`);
      }
    });

    createHTMLfiles(dataset);

    delete dataset.toolbox_embed_version;
  }
}

function overviewFileName(dataset) {
  let name = null;

  // URL override
  if (dataset.page_url) {
    name = dataset.page_url;
  } else {
    name = slugify(dataset.indicator_title);
  }

  name += ".html";
  return name;
}

function detailFileName(dataset, indicator = null) {
  let name = null;

  // URL override
  if (dataset.page_url) {
    name = dataset.page_url;
  } else {
    name = slugify(dataset.indicator_title);
  }

  if (indicator) {
    name += `--${slugify(indicator)}`;
  }
  name += "-detail.html";
  return name;
}

function slugify(string, lowercase = true, separator = "-") {
  if (lowercase) {
    return string
      .toLowerCase()
      .replace(/\s/g, separator)
      .replace(/_/g, separator);
  } else {
    return string.replace(/\s/g, separator).replace(/_/g, separator);
  }
}

function createHTMLfiles(dataset) {
  //create overview and detail pages for each app
  // if (!dataset.overview_var) {
  //   dataset.overview_var = null;
  // }

  // if (!dataset.detail_var) {
  //   dataset.detail_var = null;
  // }

  //maak filenames voor dat we de git detail laden.
  dataset.overviewpage = overviewFileName(dataset);
  dataset.detailpage = detailFileName(dataset);

  if (config.usage.markdown_texts) {
    // Gather github markdown texts by title. Convert them to HTML, and separate the different parts.
    let github_page_title = dataset.page_title_github
      ? dataset.page_title_github
      : dataset.page_title;
    let url = config.url.git_md.replace(
      "%TITLE%",
      slugify(github_page_title, false, "_")
    );
    let result = sync_request("GET", url);

    if (result.statusCode === 200) {
      let git_body_text = marked(decoder.write(result.body)).split(/\r?\n/);

      let main = git_body_text.findIndex((line) =>
        line.includes('<h2 id="main">Main</h2>')
      );
      let main_end = git_body_text.findIndex(
        (line, index) => index > main && line.includes("<table>")
      );

      let explore = git_body_text.findIndex((line) =>
        line.includes('<h2 id="explore">Explore</h2>')
      );
      let explore_end = git_body_text.findIndex(
        (line, index) =>
          index > explore && (line.includes("<h3") || line.includes("<table>"))
      );

      if (explore_end < 0) explore_end = git_body_text.length;

      //set the overview and detail description.
      dataset.description = git_body_text
        .slice(main + 1, main_end)
        .join("\n")
        .trim();
      dataset.description_detail = git_body_text
        .slice(explore + 1, explore_end)
        .join("\n")
        .trim();

      // console.log(url, main_text, explore_text);
    } else {
      console.error("Text not found:", url);
    }
  } else if (data_git_json) {
    let git_consolidated_data = false;
    try {
      git_consolidated_data = data_git_json.find((element) =>
        element.hasOwnProperty(dataset.identifier)
      )[dataset.identifier];
    } catch (error) {
      console.error(`Cannot find ${dataset.identifier} on remote data`);
    }

    if (git_consolidated_data) {
      // TODO: this should not be in the JSON from the beginning.
      delete dataset.description;
      delete dataset.description_detail;
      // Let's copy (override) some fields with the remote JSON data.
      dataset.page_title = git_consolidated_data.PageTitle;
      dataset.description_general = marked(
        git_consolidated_data.ConsolidatedTextGeneral
      );
      dataset.description_vis_nav = marked(
        git_consolidated_data.ConsolidatedTextVisAndNav
      );
      dataset.indicator_title = git_consolidated_data.Indicator;
      dataset.units = git_consolidated_data.Units;
    }
  }

  dataset.vars = dataset.vars || { detail: {}, overview: {} };
  dataset.css_version = maris_css_hash;

  let themes = dataset.theme;

  themes.forEach((theme) => {
    const appData = {};

    Object.assign(appData, dataset);

    appData.theme = theme;

    // ejs.renderFile(
    //   `${srcPath}/templates/overview.ejs`,
    //   appData,
    //   (err, data) => {
    //     if (err) throw err;
    //     let overviewPage = `${outputDir}/${appData.theme.toLowerCase()}/${
    //       appData.overviewpage
    //     }`;
    //     fs.writeFile(overviewPage, data, (err) => {
    //       if (err) throw err;
    //       console.log(`[Overview page] \t${overviewPage} has been created.`);
    //     });
    //   }
    // );

    // detail page
    ejs.renderFile(`${srcPath}/templates/detail.ejs`, appData, (err, data) => {
      if (err) throw err;
      let detailPage = `${outputDir}/${appData.theme.toLowerCase()}/${
        appData.detailpage
      }`;
      fs.writeFile(detailPage, data, (err) => {
        if (err) throw err;
        console.log(`[Detail page] \t\t${detailPage} has been created.`);
      });
    });
  });
}

function createThemePages(data) {
  //voor elk thema maken we een pagina aan
  for (const index in data["themes"]) {
    const theme = data["themes"][index];
    theme.apps = [];

    //verzamel actieve apps en voeg titel+links toe aan theme.apps[]
    for (const app_index in data["indicators"]) {
      const dataset = data["indicators"][app_index];

      if (
        dataset.theme
          .map((x) => x.toLowerCase())
          .includes(theme.theme_title.toLowerCase()) &&
        !dataset.exclude
      ) {
        theme.apps.push({
          title: dataset.page_title,
          url: `${theme.theme_title.toLowerCase()}/${detailFileName(dataset)}`,
        });
      }
    }

    // sort apps by title
    theme.apps.sort((a, b) => a.title.localeCompare(b.title));
    theme.css_version = maris_css_hash;

    //render html
    ejs.renderFile(`${srcPath}/templates/theme.ejs`, theme, (err, data) => {
      if (err) throw err;
      const outputFile = `${theme.theme_title.toLowerCase()}.html`;
      const themePage = `${outputDir}/${outputFile}`;
      fs.writeFile(themePage, data, (err) => {
        if (err) throw err;
        console.log(`[Theme page] \t\t${themePage} has been created.`);
      });
    });
  }
}

function createFAQPages(data) {
  //voor elk thema maken we een pagina aan
    const theme = data;
    theme.apps = [];

    theme.css_version = maris_css_hash;
    //render html
    ejs.renderFile(`${srcPath}/templates/theme.ejs`, theme, (err, data) => {
      if (err) throw err;
      const outputFile = `${theme.theme_title.toLowerCase()}.html`;
      const themePage = `${outputDir}/${outputFile}`;
      fs.writeFile(themePage, data, (err) => {
        if (err) throw err;
        console.log(`[Theme page] \t\t${themePage} has been created.`);
      });
    });
}

function createHelpPages(data) {
  //voor elk thema maken we een pagina aan
    const theme = data;
    theme.apps = [];

    theme.css_version = maris_css_hash;
    //render html
    ejs.renderFile(`${srcPath}/templates/theme.ejs`, theme, (err, data) => {
      if (err) throw err;
      const outputFile = `${theme.theme_title.toLowerCase()}.html`;
      const themePage = `${outputDir}/${outputFile}`;
      fs.writeFile(themePage, data, (err) => {
        if (err) throw err;
        console.log(`[Theme page] \t\t${themePage} has been created.`);
      });
    });
}

function createHtmlPages(data) {
  for (const pagename in data) {
    let htmlPage = data[pagename];
    htmlPage.css_version = maris_css_hash;
    //render html
    ejs.renderFile(`${srcPath}/templates/html.ejs`, htmlPage, (err, data) => {
      if (err) throw err;
      const outputFile = `${pagename}.html`;
      const htmlFile = `${outputDir}/${outputFile}`;
      fs.writeFile(htmlFile, data, (err) => {
        if (err) throw err;
        console.log(`[Html page] \t\t${htmlFile} has been created.`);
      });
    });
  }
}

function createGlossaryPage(data) {
  let pageName = "glossary";

  let glossaryTable = {
    data: data,
  };

  ejs.renderFile(
    `${srcPath}/templates/partials/glossary-table.ejs`,
    glossaryTable,
    (err, data) => {
      if (err) throw err;

      glossary_html = data.replace("    ", "");
    }
  );

  let glossaryPage = {
    css_version: maris_css_hash,
    page_title: "ECDE Glossary",
    page_text: glossary_html,
  };

  ejs.renderFile(`${srcPath}/templates/html.ejs`, glossaryPage, (err, data) => {
    if (err) throw err;

    const outputFile = `${pageName}.html`;
    const htmlFile = `${outputDir}/${outputFile}`;

    fs.writeFile(htmlFile, data, (err) => {
      if (err) throw err;
      console.log(`[Glossary page] \t${htmlFile} has been created.`);
    });
  });
}
