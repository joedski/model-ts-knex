import Knex, { Transaction, QueryBuilder } from 'knex';
import ModelField from './ModelField';

// Copied from knex's .d.ts file.
type SafePartial<T> = T extends {} ? Partial<T> : any;

/**
 * Simple type alias to deduplicate a lot of unioning on readonly T[].
 */
// TODO: Remove in favor of just using `readonly T[]`?
export type AnyArray<T> = T[] | readonly T[];

/**
 * Any knex object that can be used to build queries.
 */
// TODO: Something with these types... could be helpful.
export type AnyKnex<
  TRecord extends {} = any,
  TResult = SafePartial<TRecord>[]
> =
  | Transaction<TRecord, TResult>
  | QueryBuilder<TRecord, TResult>
  | Knex<TRecord, TResult>;

/**
 * Convenience alias for a common type used in constraints.
 */
export type AnyModelFieldset = Record<string, AnyModelField>;

export type ModelFieldKeys<
  TModel extends { fields: AnyModelFieldset }
> = keyof TModel['fields'];

/**
 * Convenience alias mostly used for conditional types.
 */
export type AnyModelField = ModelField<any, boolean, boolean>;

/**
 * Gets only the field keys for fields that should appear in new records,
 * omitting those which don't.
 */
type NewRecordFieldKeys<TFields> = TFields extends AnyModelFieldset
  ? keyof TFields extends infer TKeys
    ? TKeys extends keyof TFields
      ? TFields[TKeys] extends ModelField<any, true, any>
        ? TKeys
        : never
      : never
    : never
  : never;

/**
 * Extract the TS type from a ModelField, accounting for nullability.
 */
export type RecordFieldType<T> = T extends ModelField<
  infer TSType,
  boolean,
  infer NotNullable
>
  ? NotNullable extends true
    ? TSType
    : TSType | null
  : never;

/**
 * Get a plain record type of a given fieldset.
 */
export type RecordTypeOfFields<T extends AnyModelFieldset> = {
  [K in keyof T]: RecordFieldType<T[K]>;
};

/**
 * Get a plain record type of a given Model.
 */
export type RecordType<
  TModel extends { fields: AnyModelFieldset }
> = RecordTypeOfFields<TModel['fields']>;

/**
 * Get a plain record type for a new record of a given fieldset.
 */
export type NewRecordTypeOfFields<T extends AnyModelFieldset> = Pick<
  RecordTypeOfFields<T>,
  NewRecordFieldKeys<T>
>;

/**
 * Get a plain record type for a new record of a given Model.
 */
export type NewRecordType<
  TModel extends { fields: AnyModelFieldset }
> = NewRecordTypeOfFields<TModel['fields']>;
