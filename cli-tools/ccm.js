#!/usr/bin/env node

const { Command } = require('commander');
const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');

const program = new Command();

program
    .name('cm')
    .description(
        chalk.green('CONTENTFUL CONTENT MODELING (ccm) CLI TOOL\n') + 'By Marcelo Lewin - IntelligentContentAcademy.com\nContact me at marcelo@intelligentcontentacademy.com'
    )
    .version('1.0.0');

// ---------------------------------------------
// cm create-model --model <name>
// ---------------------------------------------
program
  .command('create-model')
  .description('Creates an existing content model from the content-models folder in Contentful.')
  .requiredOption('--model <model>', 'Name of the content model folder that contains all your content types, located inside the content-models folder.')
  .action((options) => {
    const script = path.join(__dirname, 'create-content-model.js');
    const args = ['--model', options.model];
    spawn('node', [script, ...args], { stdio: 'inherit' });
  });

// ---------------------------------------------
// cm create-template --name <name> [--template <template>] [--list]
// ---------------------------------------------
program
  .command('create-template')
  .description('Create a content model template folder using an existing template')
  .option('--model <name>', '[required with --template] The name of the new model folder')
  .option('--template <template>', '[required with --model] The template to use (e.g., "generic")')
  .option('--list', 'List all available templates')
  .action((options, command) => {
    const script = path.join(__dirname, 'create-content-model-template.js');

    const usingModel = typeof options.model !== 'undefined';
    const usingTemplate = typeof options.template !== 'undefined';
    const usingList = options.list === true;

    // --list must be used on its own
    if (usingList && (usingModel || usingTemplate)) {
      console.error('\n❌ The --list option must be used on its own.\n');
      console.error(); // optional: for spacing
      process.exit(1);
    }

    // If --model or --template is provided, both are required
    if (!usingList && (usingModel !== usingTemplate)) {
      console.error('\n❌ You must provide both --model and --template together.\n');
      console.error(); // optional: for spacing
      process.exit(1);
    }

    // If no options at all
    if (!usingList && !usingModel && !usingTemplate) {
      console.error('\n❌ You must either:\n  - Use --list\n  - Or use both --model and --template\n');
      console.error(); // optional: for spacing
      process.exit(1);
    }

    const args = [];
    if (usingModel) args.push('--model', options.model);
    if (usingTemplate) args.push('--template', options.template);
    if (usingList) args.push('--list');

    spawn('node', [script, ...args], { stdio: 'inherit' });
  });

// ---------------------------------------------
// cm delete-model --model <name> [--force]
// ---------------------------------------------
program
  .command('delete-model')
  .description('Delete a content model, including all content types and entries')
  .requiredOption('--model <model>', 'The model folder name to delete')
  .option('--force', 'Actually delete content (dry run by default)')
  .action((options) => {
    const script = path.join(__dirname, 'delete-content-model.js');
    const args = ['--model', options.model];
    if (options.force) args.push('--force');
    spawn('node', [script, ...args], { stdio: 'inherit' });
  });

// ---------------------------------------------
// cm list-models [--details]
// ---------------------------------------------
program
  .command('list-models')
  .description('List all available content model folders')
  .option('--details', 'Show full model details including content types and entry counts')
  .action((options) => {
    const script = path.join(__dirname, 'list-content-models.js');
    const args = options.details ? ['--details'] : [];
    spawn('node', [script, ...args], { stdio: 'inherit' });
  });

// Enhance help output: make command names green
program.configureHelp({
    // Override subcommandTerm to color command names green
    subcommandTerm: (cmd) => chalk.green(cmd.name() + (cmd._alias ? '|' + cmd._alias : '') + (cmd.usage() ? ' ' + cmd.usage() : '')),
});

// Parse arguments
program.parse(process.argv);