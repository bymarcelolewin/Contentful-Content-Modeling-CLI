//
// Emojis Library
//
const emojis = require("./contentful-emojis");

/**
 * Adds a Title field to a Contentful content type.  By
 * default, the field name is Title and it's required.
 *
 * @example
 * // Basic usage
 * createTitle(ct);
 *
 * @example
 * // Custom configuration
 * createTitle(ct, { fieldName: 'Product Name', fieldId: 'productName', required: false });
 *
 * @param {object} contentType - The Contentful content type object to modify.
 * @param {object} options - Holds all attributes for the field.
 * @param {string} [options.fieldName='Title'] - The friendly name of the field in the editor.
 * @param {string} [options.fieldId='title'] - The field ID the Contentful API will show as.
 * @param {boolean} [options.required=true] - If set to true, the author can't publish until it's filled.
 *
 * @returns {void}
 */
function createTitle(
  contentType,
  { fieldName = "Title", fieldId = "title", required = true } = {}
) {
  contentType.createField(fieldId, {
    name: fieldName,
    type: "Symbol",
    required: required,
    validations: [
      {
        size: {
          min: 2,
          max: 255,
        },
      },
    ],
  });

  contentType.changeFieldControl(fieldId, "builtin", "singleLine");
}

/**
* Adds a Code ID field to a Contentful content type.  By
* default, the field name is Code ID, the validation is set to
* camelCase and the field is set to unique and required).
*
* @example
* // Basic usage
* createCodeId(ct);
*
* @example
* // Custom configuration
* createCodeId(ct, { fieldName: 'HubSpot ID', fieldId: 'hubspotId', required: false, unique: false, validate: 'snake_case' });
*
* @param {object} contentType  - The Contentful content type object to modify.
* @param {object} options  - Holds all attributes for the field.
* @param {string} [options.fieldName='Code ID']  - The friendly name of the field in the editor.
* @param {string} [options.fieldId='codeId'] - The field ID the Contentful API will show as.
* @param {boolean} [options.required=true] - Defaults to true.
* @param {boolean} [options.unique=true] - Defaults to true.
* @param {'camelCase' | 'snake_case' | 'none'} [options.validate='camelCase'] - The format your code ID field must follow.  Defaults to camelCase.

* 
* @returns {void}
*/
function createCodeId(
  contentType,
  {
    fieldName = "Code ID",
    fieldId = "codeId",
    required = true,
    unique = true,
    validate = "camelCase",
  } = {}
) {
  const validations = [];

  // Determine regex based on validation type
  if (validate === "camelCase") {
    validations.push({
      regexp: {
        pattern: "^[a-z]+([A-Z0-9][a-z0-9]*)*$",
        flags: null,
      },
    });
  } else if (validate === "snake_case") {
    validations.push({
      regexp: {
        pattern: "^[a-z]+(_[a-z0-9]+)*$",
        flags: null,
      },
    });
  }

  // Add uniqueness and size validations
  validations.push(
    { unique: unique },
    {
      size: {
        min: 2,
      },
    }
  );

  contentType.createField(fieldId, {
    name: `${emojis.field.developer} ${fieldName}`,
    type: "Symbol",
    required: required,
    validations,
  });

  contentType.changeFieldControl(fieldId, "builtin", "singleLine");
}

/**
 * Adds a field that accepts both a path and URL to a Contentful content type.
 * By default, the field name is 'URL or Path', the validation is set to
 * accept both URL and paths and it's required.
 *
 * @param {object} contentType  - The Contentful content type object to modify.
 * @param {object} options  - Holds all attributes for the field.
 * @param {string} [options.fieldName='URL or Path']  - The friendly name of the field in the editor.
 * @param {string} [options.fieldId='urlOrPath'] - The field ID the Contentful API will show as.
 * @param {boolean} [options.required=true] - Defaults to true.
 * @param {'url' | 'path' | 'both'} [config.validate='both'] - The format the field must follow.  Defaults to both.
 *
 * @returns {void}
 */
function createURL(
  contentType,
  {
    fieldName = "URL or Path",
    fieldId = "urlOrPath",
    required = true,
    validate = "both",
  } = {}
) {
  // Determine regex based on validate
  let pattern;

  switch (validate) {
    case "url":
      pattern = "^https?:\\/\\/[^\\s]+$";
      break;
    case "path":
      pattern = "^\\/[a-zA-Z0-9\\-_/]*$";
      break;
    case "both":
    default:
      pattern = "^(https?:\\/\\/[^\\s]+|\\/[a-zA-Z0-9\\-_/]*)$";
      break;
  }

  contentType.createField(fieldId, {
    name: fieldName,
    type: "Symbol",
    required: required,
    validations: [
      {
        regexp: {
          pattern,
          flags: null,
        },
      },
    ],
  });

  contentType.changeFieldControl(fieldId, "builtin", "singleLine");
}

/**
 * Adds a multi-select (checkbox) field to a Contentful content type.
 * By default, the field name is Tags, it's not required.
 *
 * @param {object} contentType  - The Contentful content type object to modify.
 * @param {object} options  - Holds all attributes for the field.
 * @param {string} [options.fieldName='Tags']  - The friendly name of the field in the editor.
 * @param {string} [options.fieldId='tags'] - The field ID the Contentful API will show as.
 * @param {boolean} [options.required=false] - Defaults to false.
 * @param {string[]} [options.options=[]] - The list of allowed values for this selection.
 * @param {string[]} [options.defaultValues] - Default values for this selection.  Must be a subset of options.
 *
 * @returns {void}
 */
function createMultiSelect(
  contentType,
  {
    fieldName = "Tags",
    fieldId = "tags",
    required = false,
    options = [],
    defaultValues = undefined,
  } = {}
) {
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error(
      `addMultiSelect: 'options' array is required and cannot be empty.`
    );
  }

  if (
    defaultValues &&
    (!Array.isArray(defaultValues) ||
      defaultValues.some((val) => !options.includes(val)))
  ) {
    throw new Error(
      `addMultiSelect: 'defaultValues' must be an array of values included in 'options'.\nInvalid values: ${defaultValues
        .filter((val) => !options.includes(val))
        .join(", ")}`
    );
  }

  const fieldConfig = {
    name: fieldName,
    type: "Array",
    required: required,
    items: {
      type: "Symbol",
      validations: [
        {
          in: options,
        },
      ],
    },
  };

  if (defaultValues && defaultValues.length > 0) {
    fieldConfig.defaultValue = {
      "en-US": defaultValues,
    };
  }

  contentType.createField(fieldId, fieldConfig);
  contentType.changeFieldControl(fieldId, "builtin", "checkbox");
}

/**
 * Adds a single-select (radio) field to a Contentful content type.
 * By default, the field name is Category, it's not required.
 *
 * @param {object} contentType  - The Contentful content type object to modify.
 * @param {object} options  - Holds all attributes for the field.
 * @param {string} [options.fieldName='Categories']  - The friendly name of the field in the editor.
 * @param {string} [options.fieldId='categories'] - The field ID the Contentful API will show as.
 * @param {boolean} [options.required=false] - Defaults to false.
 * @param {string[]} [options.options=[]] - The list of allowed values for this selection.
 * @param {string[]} [options.defaultValue] - Default value for this selection.  Must a value from the options.
 *
 * @returns {void}
 */
function createSingleSelect(
  contentType,
  {
    fieldName = "Category",
    fieldId = "category",
    required = false,
    options = [],
    defaultValue = undefined,
  } = {}
) {
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error(
      `addSingleSelect: 'options' array is required and cannot be empty.`
    );
  }

  if (defaultValue && !options.includes(defaultValue)) {
    throw new Error(
      `addSingleSelect: 'defaultValue' must be one of the values in 'options'. Received: "${defaultValue}"`
    );
  }

  const fieldConfig = {
    name: fieldName,
    type: "Symbol",
    required: required,
    validations: [
      {
        in: options,
      },
    ],
  };

  if (defaultValue) {
    fieldConfig.defaultValue = {
      "en-US": defaultValue,
    };
  }

  contentType.createField(fieldId, fieldConfig);
  contentType.changeFieldControl(fieldId, "builtin", "radio");
}

/**
 * Adds a text field to a Contentful content type.
 * By default, it's set to markdown (long text) and not required.
 *
 * @param {object} contentType  - The Contentful content type object to modify.
 * @param {object} options  - Holds all attributes for the field.
 * @param {string} [options.fieldName='Description']  - The friendly name of the field in the editor.
 * @param {string} [options.fieldId='description'] - The field ID the Contentful API will show as.
 * @param {boolean} [options.required=false] - Defaults to false.
 * @param {'single-line' | 'multi-line' | 'markdown' | 'rich-text'} [options.textType='single-line'] - The field type.  Defaults to long text, markdown.
 *
 * @returns {void}
 */
function createText(
  contentType,
  {
    fieldName = "Description",
    fieldId = "description",
    required = false,
    textType = "single-line",
  } = {}
) {
  let fieldDefinition;
  let widget;

  switch (textType) {
    case "single-line":
      fieldDefinition = { name: fieldName, type: "Symbol", required };
      widget = "singleLine";
      break;

    case "multi-line":
      fieldDefinition = { name: fieldName, type: "Text", required };
      widget = "multipleLine";
      break;

    case "markdown":
      fieldDefinition = { name: fieldName, type: "Text", required };
      widget = "markdown";
      break;

    case "rich-text":
      fieldDefinition = { name: fieldName, type: "RichText", required };
      widget = "richTextEditor";
      break;

    default:
      throw new Error(
        `createText: Unknown type "${textType}". Valid options are single-line, multi-line, markdown, rich-text.`
      );
  }

  contentType.createField(fieldId, fieldDefinition);
  contentType.changeFieldControl(fieldId, "builtin", widget);
}

/**
 * Creates a reference field (single or multiple linked entries) in a Contentful content type.
 *
 * @param {object} contentType - The Contentful content type object to attach the field to.
 * @param {object} options - Holds all attributes for the field.
 * @param {string} [options.fieldName='Metadata'] - The friendly name of the field in the editor.
 * @param {string} [options.fieldId='metadata'] - The field ID the Contentful API will show as.
 * @param {'one' | 'one-to-many' | 'zero-to-one' | 'zero-to-many'} [options.allowedEntries='many'] - The number of referenced entries an author can select.
 * @param {string[]} options.allowedContentTypes - An array of allowed valid content type IDs an author can pick entries from.
 *
 * @throws Will throw an error if allowedContentTypes is not a non-empty array.
 * @throws Will throw an error if allowedEntries is not one of the supported values.
 *
 * @returns {void}
 */
function createReference(
  contentType,
  {
    fieldId = "metadata",
    fieldName = "Metadata",
    allowedEntries = "one-to-many",
    allowedContentTypes = [],
  } = {}
) {
  if (!Array.isArray(allowedContentTypes) || allowedContentTypes.length === 0) {
    throw new Error(
      `createReference: 'allowedContentTypes' must be a non-empty array of content type IDs.`
    );
  }

  const linkValidation = [
    {
      linkContentType: allowedContentTypes,
    },
  ];

  switch (allowedEntries) {
    case "one":
      contentType.createField(fieldId, {
        name: fieldName,
        type: "Link",
        linkType: "Entry",
        validations: linkValidation,
        required: true,
      });
      contentType.changeFieldControl(fieldId, "builtin", "entryLinkEditor");
      break;

    case "zero-to-one":
      contentType.createField(fieldId, {
        name: fieldName,
        type: "Link",
        linkType: "Entry",
        validations: linkValidation,
        required: false,
      });
      contentType.changeFieldControl(fieldId, "builtin", "entryLinkEditor");
      break;

    case "one-to-many":
      contentType.createField(fieldId, {
        name: fieldName,
        type: "Array",
        items: {
          type: "Link",
          linkType: "Entry",
          validations: linkValidation,
        },
        required: true,
      });
      contentType.changeFieldControl(fieldId, "builtin", "entryLinksEditor");
      break;

    case "zero-to-many":
      contentType.createField(fieldId, {
        name: fieldName,
        type: "Array",
        items: {
          type: "Link",
          linkType: "Entry",
          validations: linkValidation,
        },
        required: false,
      });
      contentType.changeFieldControl(fieldId, "builtin", "entryLinksEditor");
      break;

    default:
      throw new Error(
        `createReference: 'allowedEntries' must be one of 'only-one', 'no-more-than-one', 'at-least-one', or 'many'. Received: '${allowedEntries}'`
      );
  }
}

module.exports = {
  createTitle,
  createCodeId,
  createURL,
  createMultiSelect,
  createSingleSelect,
  createText,
  createReference,
};
