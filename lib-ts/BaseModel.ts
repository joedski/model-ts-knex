import Knex, { Transaction, QueryBuilder } from "knex";
import ModelField, { RecordFieldType } from "./ModelField";

// Copied from knex's .d.ts file.
type SafePartial<T> = T extends {} ? Partial<T> : any;

// TODO: Something with these types... could be helpful.
export type AnyKnex<
  TRecord extends {} = any,
  TResult = SafePartial<TRecord>[]
> =
  | Transaction<TRecord, TResult>
  | QueryBuilder<TRecord, TResult>
  | Knex<TRecord, TResult>;

export interface CreateBaseModelOptions {
  /**
   * The default knex to start with.
   * This is used any time you don't use `.trx(transaction)`.
   */
  knex: AnyKnex;
}

type AnyModelField = ModelField<any, boolean, boolean>;

export interface ModelParams<
  TFields extends Record<string, AnyModelField> = {}
> {
  fields: TFields;
}

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

/**
 * Creates your BaseModel definition with things such as your app's Knex instance.
 * @param options Options necessary to configure all models.
 */
export function defineBaseModel(options: CreateBaseModelOptions) {
  /**
   * A BaseModel factory using your app's options.
   */
  return function parametrizeBaseModel<TModelParams extends ModelParams>(
    params: TModelParams
  ) {
    return class BaseModel {
      tableName: string | null = null;
      fields: TModelParams["fields"] = params.fields;
      knex: AnyKnex = options.knex;
    };
  };
}
