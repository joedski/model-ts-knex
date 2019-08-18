import Knex, { Transaction, QueryBuilder } from "knex";
import ModelField from "./ModelField";

// Copied from knex's .d.ts file.
type SafePartial<T> = T extends {} ? Partial<T> : any;

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
 * Convenience alias mostly used for conditional types.
 */
export type AnyModelField = ModelField<any, boolean, boolean>;

/**
 * Gets only the field keys for fields that should appear in new records,
 * omitting those which don't.
 */
type NewRecordFieldKeys<TFields> = TFields extends Record<string, AnyModelField>
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
export type RecordFieldType<T> =
  T extends ModelField<infer TSType, boolean, infer NotNullable>
  ? NotNullable extends true ? TSType : TSType | null
  : never;

/**
 * Gets a plain record type of a given Model.
 */
export type RecordType<
  TModel extends { fields: Record<string, AnyModelField> }
  > = TModel["fields"] extends Record<string, AnyModelField>
  ? {
    [K in keyof TModel["fields"]]: RecordFieldType<TModel["fields"][K]>;
  }
  : never;

/**
 * Gets a plain record type for a new record of a given Model.
 */
export type NewRecordType<
  TModel extends { fields: Record<string, AnyModelField> }
  > = Pick<RecordType<TModel>, NewRecordFieldKeys<TModel["fields"]>>;
