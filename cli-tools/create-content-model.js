const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// --------------------------------------------
// 🔧 Parse --model from arguments
// --------------------------------------------
const args = process.argv.slice(2);
const modelFlagIndex = args.indexOf("--model");
const modelName = modelFlagIndex !== -1 ? args[modelFlagIndex + 1] : null;

if (!modelName) {
  console.error("❌ Please provide a content model using --model");
  console.error("Usage: node create-content-model.js --model [model-name]");
  process.exit(1);
}

const modelFolder = path.join(__dirname, "../content-models", modelName);
const contentTypesFolder = path.join(modelFolder, "content-types");
const tempModelScriptPath = path.join(
  modelFolder,
  "temp-create-content-model.js"
);

// --------------------------------------------
// 🧼 Generate temp-create-content-model.js
// --------------------------------------------
try {
  if (!fs.existsSync(contentTypesFolder)) {
    console.error(
      `❌ content-types folder does not exist at: ${contentTypesFolder}`
    );
    process.exit(1);
  }

  // Delete if the temp file already exists
  if (fs.existsSync(tempModelScriptPath)) {
    fs.unlinkSync(tempModelScriptPath);
    console.log(
      `🗑️  Deleted existing temp-create-content-model.js in "${modelName}"`
    );
  }

  const files = fs
    .readdirSync(contentTypesFolder)
    .filter((file) => file.endsWith(".js"));
  if (files.length === 0) {
    console.error(`❌ No .js files found in ${contentTypesFolder}`);
    process.exit(1);
  }

  // Generate requires and function calls
  const requires = files.map((file) => {
    const baseName = path.basename(file, ".js");
    const functionName = `create${baseName
      .charAt(0)
      .toUpperCase()}${baseName.slice(1)}`;
    return `const ${functionName} = require("./content-types/${baseName}");`;
  });

  const calls = files.map((file) => {
    const baseName = path.basename(file, ".js");
    const functionName = `create${baseName
      .charAt(0)
      .toUpperCase()}${baseName.slice(1)}`;
    return `  ${functionName}(migration);`;
  });

  const newFileContent = `${requires.join("\n")}

module.exports = function (migration) {
${calls.join("\n")}
};
`;

  fs.writeFileSync(tempModelScriptPath, newFileContent);
  console.log("\n---------------------------------------");
  console.log("INITIALIZING");
  console.log("---------------------------------------");
  console.log(`\n>> Generated temp script for installing "${modelName}"`);
} catch (err) {
  console.error(
    `❌ Failed to generate temp-create-content-model.js: ${err.message}`
  );
  process.exit(1);
}

// --------------------------------------------
// 🚀 Run the migration script
// --------------------------------------------
console.log(`>> Running migration script for installing "${modelName}"...`);

console.log("\n---------------------------------------");
console.log("MIGRATING - CONFIRMATION REQUIRED");
console.log("---------------------------------------");
try {
  execSync(`contentful space migration temp-create-content-model.js`, {
    stdio: "inherit",
    cwd: modelFolder,
  });
  console.log(`✅ Migration complete for "${modelName}"`);

  // Clean up after success
  fs.unlinkSync(tempModelScriptPath);
  console.log(`🧹 Deleted temp-create-content-model.js after successful run`);
} catch (err) {
  console.error(`❌ Migration failed: ${err.message}`);
  console.warn(
    `⚠️ temp-create-content-model.js left in "${modelName}" for inspection`
  );
}
