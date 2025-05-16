//
// Get access to model helpers
//
const emojis = require("../../../lib/model-helpers/contentful-emojis");
const fields = require("../../../lib/model-helpers/contentful-fields");

//
// *** Author Type ***
//

module.exports = function (migration) {
  //
  // ** Content Type ** //
  //
  ct = migration.createContentType("author", {
    name: `${emojis.contentType.contentblock} Author`,
    description: "This content type lets you create an author.",
    displayField: "fullName",
  });

  //
  // ** Fields ** //
  //
  fields.createTitle((contentType = ct), {
    fieldId: "fullName",
    fieldName: "Full Name",
    required: true,
  });
  fields.createText((contentType = ct), {
    textType: "single-line",
    fieldId: "firstName",
    fieldName: "First Name",
  });
  fields.createText((contentType = ct), {
    textType: "single-line",
    fieldId: "lastName",
    fieldName: "Last Name",
  });
  fields.createText((contentType = ct), {
    textType: "markdown",
    fieldId: "workHistory",
    fieldName: "Work History",
  });
  fields.createText((contentType = ct), {
    textType: "rich-text",
    fieldId: "bio",
    fieldName: "Bio",
  });
};
