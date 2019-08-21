import Knex, { Transaction } from 'knex';
import { defineBaseModel } from '../../lib-ts/BaseModel';
import ModelField from '../../lib-ts/ModelField';
import { RecordType, NewRecordType } from '../../lib-ts/utilTypes';

/**
 * Used as simple wrapping around a type to prevent
 * other conditional types from invoking distributive behavior
 * on naked type parameters.
 *
 * @see http://www.typescriptlang.org/docs/handbook/advanced-types.html#distributive-conditional-types
 */
type Nondistributed<T> = T extends any ? T : never;

/**
 * Determines if two types are mutually assignable to each other.
 * Evaluates to a definite true or false even on unions where one
 * is a superset of another.
 */
export type MutuallyAssignable<T, U> = Nondistributed<T> extends U
  ? Nondistributed<U> extends T
    ? true
    : false
  : false;

/**
 * An instance purely for example.
 */
export const knex = Knex({ client: 'pg' });

/**
 * Our BaseModel (factory) for tests.
 */
export const BaseModel = defineBaseModel({ knex });

export function withTransaction<R>(
  fn: (trx: Transaction) => Promise<R>
): Promise<R> {
  let result: R;
  return knex
    .transaction(trx =>
      fn(trx).then(r => {
        result = r;
      })
    )
    .then(() => result);
}

class $FooModel extends BaseModel({
  fields: {
    id: ModelField.increments().notInNew(),
    foo: ModelField.integer(),
    bar_id: ModelField.unsignedInteger().references(() => BarModel, 'id'),
  },
}) {}

export const FooModel = new $FooModel();

export type FooRecord = RecordType<$FooModel>;
export type NewFooRecord = NewRecordType<$FooModel>;

class $BarModel extends BaseModel({
  fields: {
    id: ModelField.increments().notInNew(),
    name: ModelField.string().notNullable(),
  },
}) {}

export const BarModel = new $BarModel();

export type BarRecord = RecordType<$BarModel>;
export type NewBarRecord = NewRecordType<$BarModel>;

class $KitchenSinkModel extends BaseModel({
  fields: {
    id: ModelField.increments().notInNew(),
    nullable: ModelField.integer(),
    integer: ModelField.integer().notNullable(),
    unsignedInteger: ModelField.unsignedInteger().notNullable(),
    bigInteger: ModelField.bigInteger().notNullable(),
    text: ModelField.text().notNullable(),
    string: ModelField.string().notNullable(),
    string20: ModelField.string(20).notNullable(),
    float: ModelField.float().notNullable(),
    decimal: ModelField.decimal().notNullable(),
    boolean: ModelField.boolean().notNullable(),
    date: ModelField.date().notNullable(),
    datetime: ModelField.datetime().notNullable(),
    time: ModelField.time().notNullable(),
    timestamp: ModelField.timestamp({ useTz: true }).notNullable(),
    // binary?
    enum: ModelField.enum([
      'foo',
      'bar',
      'baz',
      'frabnobz',
      'diganobz',
    ] as const).notNullable(),
    json: ModelField.json(),
    jsonb: ModelField.jsonb(),
    uuid: ModelField.uuid().notNullable(),
    fk: ModelField.unsignedInteger()
      .notNullable()
      .references(() => BarModel, 'id'),
  },
}) {}

export const KitchenSinkModel = new $KitchenSinkModel();

export type KitchenSinkRecord = RecordType<$KitchenSinkModel>;
export type NewKitchenSinkRecord = NewRecordType<$KitchenSinkModel>;
