import Knex from 'knex';
import { defineBaseModel } from '../../lib-ts/BaseModel';
import ModelField from '../../lib-ts/ModelField';
import { RecordType, NewRecordType } from '../../lib-ts/utilTypes';

/**
 * An instance purely for example.
 */
export const knex = Knex({ client: "pg" });

/**
 * Our BaseModel (factory) for tests.
 */
export const BaseModel = defineBaseModel({ knex });

class $FooModel extends BaseModel({
  fields: {
    id: ModelField.increments()
      .notInNew(),
    foo: ModelField.integer(),
    bar_id: ModelField.unsignedInteger().references(() => BarModel, 'id'),
  }
}) { }

export const FooModel = new $FooModel();

export type FooRecord = RecordType<$FooModel>;
export type NewFooRecord = NewRecordType<$FooModel>;

class $BarModel extends BaseModel({
  fields: {
    id: ModelField.increments().notInNew(),
    name: ModelField.string().notNullable(),
  }
}) {};

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
    enum: ModelField.enum(['foo', 'bar', 'baz', 'frabnobz', 'diganobz'] as const).notNullable(),
    json: ModelField.json(),
    jsonb: ModelField.jsonb(),
    uuid: ModelField.uuid().notNullable(),
    fk: ModelField.unsignedInteger().notNullable().references(() => BarModel, 'id'),
  }
}) {}

export const KitchenSinkModel = new $KitchenSinkModel();

export type KitchenSinkRecord = RecordType<$KitchenSinkModel>;
export type NewKitchenSinkRecord = NewRecordType<$KitchenSinkModel>;
