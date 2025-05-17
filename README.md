# Contentful Content Modeling CLI (`ccm`)

The **Contentful Content Modeling CLI** (`ccm`) tool allows you to easily create and manage content models for your company inside of contentful using code. It abstracts the Contentful CLI with business logic for easier content modeling.

---

## Requirements

- Install Node.js if you don't already have it.

## Cloning Repo
- Select a folder where you want to clone this repo into.
- Clone this repo using any of your prefer ways.

## CLI Setup
- Switch to "Contentful-Content-Modeling-CLI" folder.
- In your terminal run: ```npm install```
- Then run ```npm link``` or if you get a permission error, run ```sudo npm link```.
- Test the CLI by typing in ```ccm --help``` from any where.  CCM should be globally available.

## Create Your First Model
- Clone a content model template using ```ccm clone-template --model [your-content-model-name] --template content-model-blog```
- Once your model is created, swich to the content-types/[your-content-model-name] folder and configure the .contentfulrc.json file

```
{
  "managementToken": "your-cma-token-here",
  "activeSpaceId": "your-contentful-space-here",
  "activeEnvironmentId": "your-contentful-environment-here",
  "host": "api.contentful.com"
}
```
You can get the CMA token from Contentful, under the cogwheel -> CMA Tokens.

## More documentation coming soon!