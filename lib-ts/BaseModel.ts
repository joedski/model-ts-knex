import {
  AnyKnex,
  AnyModelField,
  ModelFieldKeys,
  AnyArray,
  RecordTypeOfFields,
} from './utilTypes';
import { tableNameOfModelClassName } from './util';
import { QueryBuilder } from 'knex';

export interface CreateBaseModelOptions {
  /**
   * The default knex to start with.
   * This is used any time you don't use `.trx(transaction)`.
   */
  knex: AnyKnex;
}

export interface ModelParams<
  TFields extends Record<string, AnyModelField> = {}
> {
  tableName?: string;
  fields: TFields;
}

/**
 * The underlying BaseModel class that gets later parametrized.
 */
export class BaseModel<TFields extends Record<string, AnyModelField>> {
  tableName: string;

  constructor(public knex: AnyKnex, public fields: TFields) {
    this.tableName = tableNameOfModelClassName(
      Object.getPrototypeOf(this).constructor.name
    );
  }

  /**
   * Return a copy of this model instance with the given transaction
   * as the knex context.
   * @param trx Knex transaction query builder.
   */
  public withTransaction(trx: AnyKnex) {
    const thisWithTransaction = Object.create(this) as BaseModel<TFields>;
    thisWithTransaction.knex = trx;
    return thisWithTransaction;
  }

  // Query Builders.

  public findWhere(
    where:
      | Partial<RecordTypeOfFields<TFields>>
      | ((queryBuilder: QueryBuilder) => void)
  ): QueryBuilder<RecordTypeOfFields<TFields>, RecordTypeOfFields<TFields>[]>;
  public findWhere<
    TSelect extends AnyArray<ModelFieldKeys<BaseModel<TFields>>>
  >(
    where:
      | Partial<RecordTypeOfFields<TFields>>
      | ((queryBuilder: QueryBuilder) => void),
    select: TSelect
  ): QueryBuilder<
    RecordTypeOfFields<TFields>,
    Pick<RecordTypeOfFields<TFields>, TSelect[number]>[]
  >;
  public findWhere(
    where:
      | Partial<RecordTypeOfFields<TFields>>
      | ((queryBuilder: QueryBuilder) => void),
    select: AnyArray<ModelFieldKeys<BaseModel<TFields>>> = []
  ): QueryBuilder<any, any> {
    return this.knex
      .from(this.tableName)
      .select(select)
      .where(where);
  }

  public findOneWhere(
    where:
      | Partial<RecordTypeOfFields<TFields>>
      | ((queryBuilder: QueryBuilder) => void)
  ): QueryBuilder<RecordTypeOfFields<TFields>, RecordTypeOfFields<TFields>[]>;
  public findOneWhere<
    TSelect extends AnyArray<ModelFieldKeys<BaseModel<TFields>>>
  >(
    where:
      | Partial<RecordTypeOfFields<TFields>>
      | ((queryBuilder: QueryBuilder) => void),
    select: TSelect
  ): QueryBuilder<
    RecordTypeOfFields<TFields>,
    Pick<RecordTypeOfFields<TFields>, TSelect[number]>[]
  >;
  public findOneWhere(
    where:
      | Partial<RecordTypeOfFields<TFields>>
      | ((queryBuilder: QueryBuilder) => void),
    select: AnyArray<ModelFieldKeys<BaseModel<TFields>>> = []
  ) {
    return this.findWhere(where, select).limit(1);
  }

  // JSON Schema stuff.

  public toRecordJSONSchema() {
    // Not entirely happy with the return type, but at least for now
    // it's meant to be sorta opaque.
    const fieldNames = Object.keys(this.fields);
    return {
      type: 'object',
      required: fieldNames,
      properties: fieldNames.reduce(
        (acc, fieldName) => {
          acc[fieldName] = this.fields[fieldName].toJSONSchema();
          return acc;
        },
        {} as Record<string, object>
      ),
    };
  }

  public toNewRecordJSONSchema() {
    // Not entirely happy with the return type, but at least for now
    // it's meant to be sorta opaque.
    const fieldNames = Object.keys(this.fields).filter(
      key => this.fields[key].$useInNew
    );
    return {
      type: 'object',
      required: fieldNames,
      properties: fieldNames.reduce(
        (acc, fieldName) => {
          acc[fieldName] = this.fields[fieldName].toJSONSchema();
          return acc;
        },
        {} as Record<string, object>
      ),
    };
  }
}

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
    return class Model extends BaseModel<TModelParams['fields']> {
      constructor() {
        super(options.knex, params.fields);
        if (params.tableName) {
          this.tableName = params.tableName;
        }
      }
    };
  };
}
