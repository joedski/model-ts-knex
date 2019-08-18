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

export class FooModel extends BaseModel({
  fields: {
    id: ModelField.integer()
      .unsigned()
      .primary()
      .notNullable()
      .notInNew(),
    foo: ModelField.integer()
  }
}) { }

export type FooRecord = RecordType<FooModel>;
export type NewFooRecord = NewRecordType<FooModel>;
