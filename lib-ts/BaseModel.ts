import {
  AnyKnex,
  ModelFieldKeys,
  AnyArray,
  RecordTypeOfFields,
  NewRecordTypeOfFields,
  AnyModelFieldset,
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

export interface ModelParams<TFields extends AnyModelFieldset = {}> {
  tableName?: string;
  fields: TFields;
}

type WhereCondition<TFields extends AnyModelFieldset> =
  | Partial<RecordTypeOfFields<TFields>>
  | ((queryBuilder: QueryBuilder) => void)
  | ((this: QueryBuilder) => void);

/**
 * The underlying BaseModel class that gets later parametrized.
 */
export class BaseModel<TFields extends AnyModelFieldset> {
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
    const thisWithTransaction = Object.create(this) as this;
    thisWithTransaction.knex = trx;
    return thisWithTransaction;
  }

  // Query Builders.

  /**
   * Find records that match the where-condition.
   * @param where An object of key/value pairs to match or a querybuilder function.
   * @param select What fields to return.
   */
  public findWhere(
    where: WhereCondition<TFields>
  ): QueryBuilder<RecordTypeOfFields<TFields>, RecordTypeOfFields<TFields>[]>;
  public findWhere<
    TSelect extends AnyArray<ModelFieldKeys<BaseModel<TFields>>>
  >(
    where: WhereCondition<TFields>,
    select: TSelect
  ): QueryBuilder<
    RecordTypeOfFields<TFields>,
    Pick<RecordTypeOfFields<TFields>, TSelect[number]>[]
  >;
  public findWhere(
    where: WhereCondition<TFields>,
    select: AnyArray<ModelFieldKeys<BaseModel<TFields>>> = []
  ): QueryBuilder<any, any> {
    return this.knex
      .from(this.tableName)
      .select(select)
      .where(where);
  }

  /**
   * Find the first record that matches the where-condition.
   * @see `findWhere`
   * @param where An object of key/value pairs to match or a querybuilder function.
   * @param select What fields to return.
   */
  public findOneWhere(
    where: WhereCondition<TFields>
  ): QueryBuilder<RecordTypeOfFields<TFields>, RecordTypeOfFields<TFields>[]>;
  public findOneWhere<
    TSelect extends AnyArray<ModelFieldKeys<BaseModel<TFields>>>
  >(
    where: WhereCondition<TFields>,
    select: TSelect
  ): QueryBuilder<
    RecordTypeOfFields<TFields>,
    Pick<RecordTypeOfFields<TFields>, TSelect[number]>[]
  >;
  public findOneWhere(
    where: WhereCondition<TFields>,
    select: AnyArray<ModelFieldKeys<BaseModel<TFields>>> = []
  ) {
    return this.findWhere(where, select).limit(1);
  }

  /**
   * Insert a new record, optionally returning an array containing a value
   * from the newly inserted record.
   * @param record New record to insert.
   * @param returning What prop you want to return after insert, if any.
   */
  public insertOne(
    record: NewRecordTypeOfFields<TFields>
  ): QueryBuilder<RecordTypeOfFields<TFields>, never[]>;
  public insertOne<
    TKey extends Extract<keyof RecordTypeOfFields<TFields>, string>
  >(
    record: NewRecordTypeOfFields<TFields>,
    returning: TKey
  ): QueryBuilder<
    RecordTypeOfFields<TFields>,
    (RecordTypeOfFields<TFields>[TKey])[]
  >;
  public insertOne<
    TKey extends Extract<keyof RecordTypeOfFields<TFields>, string>
  >(
    record: NewRecordTypeOfFields<TFields>,
    returning?: TKey
  ): QueryBuilder<any, any> {
    const query = this.knex.into(this.tableName).insert(record);

    if (returning != null) {
      return query.returning(returning);
    }

    return query;
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
