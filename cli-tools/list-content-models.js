const fs = require("fs");
const path = require("path");
const { createClient } = require("contentful-management");

// Get CLI arguments
const showAllDetails = process.argv.includes("--details");

// Root path to content models
const MODELS_DIR = path.join(__dirname, "../content-models");

function getContentModelFolders() {
  return fs.readdirSync(MODELS_DIR).filter((item) => {
    const fullPath = path.join(MODELS_DIR, item);
    return fs.statSync(fullPath).isDirectory();
  });
}

async function getModelDetails(folderName) {
  const folderPath = path.join(MODELS_DIR, folderName);
  const rcPath = path.join(folderPath, ".contentfulrc.json");

  if (!fs.existsSync(rcPath)) {
    console.warn(`⚠️  Skipping "${folderName}" — missing .contentfulrc.json`);
    return null;
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(rcPath, "utf-8"));
  } catch (err) {
    console.warn(
      `⚠️  Skipping "${folderName}" — invalid JSON in .contentfulrc.json`
    );
    return null;
  }

  const { managementToken, activeSpaceId, activeEnvironmentId, host } = config;
  if (!managementToken || !activeSpaceId || !activeEnvironmentId) {
    console.warn(
      `⚠️  Skipping "${folderName}" — missing required fields in .contentfulrc.json`
    );
    return null;
  }

  const client = createClient({
    accessToken: managementToken,
    host: host || "api.contentful.com",
  });

  let space, environment;

  try {
    space = await client.getSpace(activeSpaceId);
    environment = await space.getEnvironment(activeEnvironmentId);
    const contentTypes = await environment.getContentTypes();

    const details = await Promise.all(
      contentTypes.items.map(async (ct) => {
        const entries = await environment.getEntries({
          content_type: ct.sys.id,
          limit: 0,
        });
        return `- ${ct.name} (${entries.total} Entries)`;
      })
    );

    return {
      name: folderName,
      space: activeSpaceId,
      environment: activeEnvironmentId,
      contentTypes: details,
    };
  } catch {
    throw new Error(
      `🚨 Could not connect to the Contentful space or environment for "${folderName}". Please double check your .contentfulrc.json file.`
    );
  }
}

async function main() {
  const folders = getContentModelFolders();

  if (!showAllDetails) {
    console.log("CONTENT MODELS");
    folders.forEach((folder) => console.log(folder));
    return;
  }

  for (const folder of folders) {
    try {
      const details = await getModelDetails(folder);
      if (!details) continue;

      console.log("\n---------------------------------------");
      console.log("CONTENT MODEL DETAILS");
      console.log("---------------------------------------");
      console.log(`Name: ${details.name}`);
      console.log(`Space: ${details.space}`);
      console.log(`Environment: ${details.environment}`);

      console.log("\n---------------------------------------");
      console.log("CONTENT TYPES");
      console.log("---------------------------------------");
      details.contentTypes.forEach((line) => console.log(line));
    } catch (err) {
      console.error(`\n${err.message}`);
      console.error("Aborting script.\n");
      process.exit(1);
    }
  }
}

main();
