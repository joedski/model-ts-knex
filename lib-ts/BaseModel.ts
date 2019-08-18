import { AnyKnex, AnyModelField } from './utilTypes';

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
  fields: TFields;
}

/**
 * The underlying BaseModel class that gets later parametrized.
 */
export class BaseModel<TFields extends Record<string, AnyModelField>> {
  tableName: string | null = null;

  constructor(
    public knex: AnyKnex,
    public fields: TFields
  ) {}
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
      }
    };
  };
}
