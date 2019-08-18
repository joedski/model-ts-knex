import Knex from 'knex';
import { defineBaseModel } from '@/BaseModel';
import ModelField from '@/ModelField';
import { RecordType, NewRecordType } from '@/utilTypes';

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
