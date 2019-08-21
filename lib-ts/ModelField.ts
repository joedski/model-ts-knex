import { Raw } from 'knex';
import { BaseModel } from './BaseModel';
import { AnyModelFieldset } from './utilTypes';

type ColumnType =
  /**
   * Knex has special translation for increments, so we're
   * effectively treating it as a special type.
   */
  | ['increments']
  | ['bigIncrements']
  | ['integer']
  | ['bigInteger']
  /**
   * there's an optional 'medium' | 'big' that could go after,
   * but that's for mysql only, and I'm using postgres.
   */
  | ['text']
  | ['string', number | null]
  | ['float', number | null, number | null]
  | ['decimal', number | null, number | null]
  | ['boolean']
  | ['date']
  | ['datetime', { useTz?: boolean; precision?: number }]
  | ['time', number | null]
  | ['timestamp', { useTz?: boolean; precision?: number }]
  | ['binary']
  | [
      'enum',
      string[] | readonly string[] | null,
      { useNative?: boolean; enumName?: string }
    ]
  | ['json']
  | ['jsonb']
  | ['uuid'];

export interface ModelFieldForeignKeyConstraint {
  model: BaseModel<AnyModelFieldset>;
  columnName: string;
  onDelete: null | string | Raw;
  onUpdate: null | string | Raw;
}

export default class ModelField<
  TSType,
  InNew extends boolean = true,
  NotNullable extends boolean = false
> {
  // Type Factory Helpers

  public static increments() {
    // NOTE: increments in knex implies a number of things but we don't set those separately here.
    return new ModelField<number>(['increments']).notNullable();
  }
  public static bigIncrements() {
    // NOTE: bigIncrements in knex implies a number of things but we don't set those separately here.
    return new ModelField<string>(['bigIncrements']).notNullable();
  }
  public static integer() {
    return new ModelField<number>(['integer']);
  }
  public static bigInteger() {
    return new ModelField<string>(['bigInteger']);
  }
  public static text() {
    return new ModelField<string>(['text']);
  }
  public static string(length: number = 256) {
    return new ModelField<string>(['string', length]);
  }
  public static float(precision?: number, scale?: number) {
    return new ModelField<number>([
      'float',
      typeof precision === 'number' ? precision : null,
      typeof scale === 'number' ? scale : null,
    ]);
  }
  public static decimal(precision?: number, scale?: number) {
    return new ModelField<number>([
      'decimal',
      typeof precision === 'number' ? precision : null,
      typeof scale === 'number' ? scale : null,
    ]);
  }
  public static boolean() {
    return new ModelField<boolean>(['boolean']);
  }
  public static date() {
    // TODO: You can toggle parsing of dates and get back strings.  How to account for that?
    return new ModelField<Date>(['date']);
  }
  public static datetime(
    options: { useTz?: boolean; precision?: number } = {}
  ) {
    // TODO: You can toggle parsing of datetimes and get back strings.  How to account for that?
    return new ModelField<Date>(['datetime', options]);
  }
  public static time(precision?: number) {
    return new ModelField<string>([
      'time',
      typeof precision === 'number' ? precision : null,
    ]);
  }
  public static timestamp(
    options: { useTz?: boolean; precision?: number } = {}
  ) {
    return new ModelField<Date>(['timestamp', options]);
  }
  public static binary() {
    // TODO: What's the actual types used here?  Have to check all the drivers, I guess.
    return new ModelField<Buffer | Uint8Array>(['binary']);
  }
  public static enum<TValues extends string[] | readonly string[]>(
    values: TValues,
    options: { useNative?: boolean; enumName?: string } = {}
  ) {
    // TODO: Need better enum typing.  Any way to obviate need for `as const`?
    return new ModelField<TValues[number]>(['enum', values, options]);
  }
  public static json<T = unknown>() {
    // TODO: Should we do anything typewise about json?
    return new ModelField<T>(['json']);
  }
  public static jsonb<T = unknown>() {
    // TODO: Should we do anything typewise about json?
    return new ModelField<T>(['jsonb']);
  }
  public static uuid() {
    return new ModelField<string>(['uuid']);
  }

  // Type Factory Convenience Helpers

  public static unsignedInteger() {
    return ModelField.integer().unsigned();
  }

  constructor(type: ColumnType) {
    this.$type = type;
  }

  // NOTE: name is specified by the field key, not in this class.
  public $wasNamed: string | null = null;
  public $type: ColumnType;
  public $useInNew: InNew = true as InNew;
  public $unsigned: boolean = false;
  public $comment: string | null = null;
  public $notNullable: NotNullable = false as NotNullable;
  public $default: boolean | number | string | Raw | null = null;
  public $primary: boolean = false;
  public $unique: boolean = false;
  public $foreignKeyConstraint: ModelFieldForeignKeyConstraint | null = null;

  // Fluent mutators ala knex to set the above props.
  // Includes type coercion to maintain exact type params
  // for useful derivation via RecordFieldType<T>.

  public useInNew<TInNew extends boolean>(inNew: TInNew) {
    const next = (this as ModelField<
      TSType,
      boolean,
      NotNullable
    >) as ModelField<TSType, TInNew, NotNullable>;
    next.$useInNew = inNew;
    return next;
  }

  public notInNew() {
    return this.useInNew(false);
  }

  public unsigned() {
    this.$unsigned = true;
    return this;
  }

  public comment(commentString: string | null) {
    this.$comment = commentString;
    return this;
  }

  public notNullable() {
    const next = this as ModelField<TSType, InNew, true>;
    next.$notNullable = true;
    return next;
  }

  public default(value: boolean | number | string | Raw) {
    this.$default = value;
    return this;
  }

  public primary() {
    this.$primary = true;
    return this;
  }

  public unique() {
    this.$unique = true;
    return this;
  }

  /**
   * Specifies that this column previously had a different name.
   * This should only be kept around for 1 migration.
   * @param oldName Name of this column in the previous version of the table.
   */
  public wasNamed(oldName: string) {
    this.$wasNamed = oldName;
    return this;
  }

  /**
   * Specify a foreign key constraint on this column.
   * @param modelGetter Function returning a Model interface instance.
   * @param fieldName Field name on that Model interface instance.
   */
  // NOTE: the constraint used to be `extends BaseModel<AnyFieldset>` but that caused
  // issues with the QueryBuilder type on the constraint type vs the subclassed type.
  // Changing it to `any` is kind of a cop-out, but at least `BaseModel<TFields>` itself
  // still constrains `TFields`.
  public references<TModel extends BaseModel<any>>(
    // function to avoid circular dependency issues.
    modelGetter: () => TModel,
    fieldName: Extract<keyof TModel['fields'], string>
  ) {
    this.$foreignKeyConstraint = {
      get model() {
        return modelGetter();
      },
      columnName: fieldName,
      onDelete: null,
      onUpdate: null,
    };
    return this;
  }

  /**
   * Specify a command to run on delete of a foreign key.
   * This has no effect unless called after `#references()`.
   * @param command Command to run on delete, such as 'CASCADE'.
   */
  public onDelete(command: string | Raw) {
    if (this.$foreignKeyConstraint != null) {
      this.$foreignKeyConstraint.onDelete = command;
    }
    return this;
  }

  /**
   * Specify a command to run on update of a foreign key.
   * This has no effect unless called after `#references()`.
   * @param command Command to run on update.
   */
  public onUpdate(command: string | Raw) {
    if (this.$foreignKeyConstraint != null) {
      this.$foreignKeyConstraint.onUpdate = command;
    }
    return this;
  }

  // Other Methods

  public toJSONSchema() {
    const notNullableType = (() => {
      switch (this.$type[0]) {
        case 'string': {
          return {
            type: 'string',
            maxLength: this.$type[1] || 256,
          };
        }

        // These two are serialized as strings since JS will lose precision on them.
        case 'bigIncrements':
        case 'bigInteger':
        case 'text': {
          return {
            type: 'string',
          };
        }

        case 'increments': {
          return {
            type: 'integer',
            minimum: 0,
          };
        }

        case 'integer': {
          if (this.$unsigned) {
            return {
              type: 'integer',
              minimum: 0,
            };
          }
          return {
            type: 'integer',
          };
        }

        case 'float':
        case 'decimal': {
          return {
            type: 'number',
          };
        }

        case 'boolean': {
          return {
            type: 'boolean',
          };
        }

        case 'date': {
          return {
            type: 'string',
            format: 'date',
          };
        }

        case 'datetime': {
          return {
            type: 'string',
            format: 'date-time',
          };
        }

        case 'time': {
          return {
            type: 'string',
            format: 'time',
          };
        }

        case 'timestamp': {
          // TODO: how should timestamps be handled?  datestring?  unix epoch?
          return {
            type: 'string',
            format: 'date-time',
          };
        }

        case 'binary': {
          // TODO: how should binary columns be handled?  if at all?
          return {
            type: 'string',
          };
        }

        case 'enum': {
          // TODO: How to handle cases where the dev uses a pre-specified enum?
          // make them always specify it here?
          // make them provide a JSONPointer schema reference?
          if (this.$type[1]) {
            return {
              type: 'string',
              enum: this.$type[1],
            };
          }
          return {
            type: 'string',
          };
        }

        case 'json':
        case 'jsonb': {
          // TODO: Something more thorough than this.
          // May want to have some ability to specify TS/JS type info
          // which would be better than just having that type param
          // hovering around without actually doing anything.
          return {
            type: 'object',
          };
        }

        case 'uuid': {
          return {
            type: 'string',
            format: 'uuid',
          };
        }

        default: {
          throw new Error(`Unknown type "${this.$type[0]}"`);
        }
      }
    })();

    if (this.$notNullable) {
      return notNullableType;
    }

    return {
      oneOf: [notNullableType, { type: 'null' }],
    };
  }
}
