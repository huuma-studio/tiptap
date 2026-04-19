/**
 * Validation schema for Tiptap document JSON.
 *
 * Integrates with `@huuma/validate` so Tiptap documents can be validated using
 * the same schema API as other form fields.
 *
 * @module
 */

import {
  type DocumentType,
  type Extension,
  getSchema,
  type Mark,
  type Node,
} from "@tiptap/core";
import {
  type BaseProperty,
  BaseSchema,
  type JSONSchema,
  jsonSchemaTypes,
  type Property,
  type Validation,
} from "@huuma/validate";

interface TipTapDocumentSchemaProperty extends Property {
  extensions: (Mark | Node | Extension)[];
}

/**
 * A `@huuma/validate` schema that validates Tiptap {@linkcode DocumentType} JSON
 * against the Tiptap schema derived from the provided extensions.
 */
export class TipTapDocumentSchema extends BaseSchema<DocumentType> {
  #extensions: (Mark | Node | Extension)[];
  constructor(
    { isRequired, validators, extensions }: TipTapDocumentSchemaProperty = {
      isRequired: true,
      validators: [],
      extensions: [],
    },
  ) {
    const jsonSchema: JSONSchema = {
      type: [...jsonSchemaTypes],
    };
    const property: BaseProperty = {
      isRequired,
      validators: [...validators],
      baseValidators: [],
    };
    super("unknown", jsonSchema, property);
    this.#extensions = extensions;
  }
  /** Validates `value` against the Tiptap schema and returns the normalised document or errors. */
  validate(value: DocumentType): Validation<DocumentType> {
    const schema = getSchema(this.#extensions);
    try {
      const node = schema.nodeFromJSON(value);
      node.toJSON();
      return { value: node.toJSON() as DocumentType, errors: undefined };
    } catch (e) {
      if (e instanceof Error) {
        return { value: undefined, errors: [{ message: e.message }] };
      }
      return { value: undefined, errors: [{ message: String(e) }] };
    }
  }

  protected override create(property: TipTapDocumentSchemaProperty): this {
    return new TipTapDocumentSchema(property) as this;
  }
}
