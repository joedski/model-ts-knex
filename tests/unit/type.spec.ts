import { FooRecord, NewFooRecord, KitchenSinkRecord, NewKitchenSinkRecord } from "./fixtures";

// As a general note, most of these tests don't actually do much with
// the variables themselves, rather this is more about the compile step.
// All these tests should be compiled successfully by TSC.
// The assertions are there to make sure Jest reports successes.

describe('Type Derivation and Assertion', () => {
  test('successfully compiles assignment of record to variable of (existing) record type', () => {
    const fooRecord: FooRecord = {
      id: 5,
      foo: 25,
      bar_id: null,
    };

    const kitchenSinkRecord: KitchenSinkRecord = {
      id: 1,
      nullable: null,
      integer: 4,
      unsignedInteger: 42,
      bigInteger: '12345678',
      text: 'foo',
      string: 'foo',
      string20: 'foo',
      float: 1.2,
      decimal: 1.2,
      boolean: false,
      date: new Date(),
      datetime: new Date(),
      time: '12:45',
      timestamp: new Date(),
      enum: 'baz',
      json: { foo: true },
      jsonb: null,
      uuid: 'b91e1376-99c1-487c-b943-0df9983e5e82',
      fk: 24,
    }

    expect(fooRecord).toBeTruthy();
    expect(kitchenSinkRecord).toBeTruthy();
  });

  test('successfully compiles assignment of record to variable of new record type', () => {
    const newFooRecord: NewFooRecord = {
      foo: 4,
      bar_id: 24,
    };

    const newKitchenSinkRecord: NewKitchenSinkRecord = {
      nullable: null,
      integer: 4,
      unsignedInteger: 42,
      bigInteger: '12345678',
      text: 'foo',
      string: 'foo',
      string20: 'foo',
      float: 1.2,
      decimal: 1.2,
      boolean: false,
      date: new Date(),
      datetime: new Date(),
      time: '12:45',
      timestamp: new Date(),
      enum: 'baz',
      json: { foo: true },
      jsonb: null,
      uuid: 'b91e1376-99c1-487c-b943-0df9983e5e82',
      fk: 24,
    }

    expect(newFooRecord).toBeTruthy();
    expect(newKitchenSinkRecord).toBeTruthy();
  });

  test('should properly eliminate keys marked inNew:false in New- record types', () => {
    type NotInNewFooKeys = Exclude<keyof FooRecord, keyof NewFooRecord>;
    const keysNotInNew: NotInNewFooKeys[] = ['id'];

    expect(keysNotInNew).toBeTruthy();
  });
});
