//
// Get access to shared resources
//
const emojis = require("../../../lib/model-helpers/contentful-emojis");
const fields = require("../../../lib/model-helpers/contentful-fields");

//
// *** Article Type ***
//

module.exports = function (migration) {
  //
  // ** Content Type ** //
  //
  ct = migration.createContentType("article", {
    name: `${emojis.contentType.contentgroup} Article`,
    description: "This content type lets you create an article.",
    displayField: "title",
  });

  //
  // ** Fields ** //
  //
  fields.createTitle((contentType = ct));
  fields.createURL((contentType = ct), {
    fieldName: "Article URL",
    fieldId: "articleURL",
    validation: "path",
  });

  fields.createMultiSelect((contentType = ct), {
    fieldName: "Type",
    fieldId: "type",
    required: true,
    options: ["Article", "FAQ", "Blog"],
    defaultValues: ["Article"],
  });

  fields.createText((contentType = ct), { fieldName:'Body', fieldId:'body', textType: "rich-text" });
  fields.createText((contentType = ct), { fieldName:'SEO Title', fieldId:'seoTitle', textType: "single-line" });
  fields.createText((contentType = ct), { fieldName:'SEO Description', fieldId:'seoDescription', textType: 'multi-line' });

  fields.createReference((contentType = ct), {
    fieldName: "Authors",
    fieldId: "authors",
    allowedEntries: "one-to-many",
    allowedContentTypes: ["author"],
  });
};
