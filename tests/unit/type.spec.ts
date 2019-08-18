import { FooRecord, NewFooRecord } from "./fixtures";

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

    expect(fooRecord).toBeTruthy();
  });

  test('successfully compiles assignment of record to variable of new record type', () => {
    const newFooRecord: NewFooRecord = {
      foo: 4,
      bar_id: 24,
    };

    expect(newFooRecord).toBeTruthy();
  });

  test('should properly eliminate keys marked inNew:false in New- record types', () => {
    type NotInNewFooKeys = Exclude<keyof FooRecord, keyof NewFooRecord>;
    const keysNotInNew: NotInNewFooKeys[] = ['id'];

    expect(keysNotInNew).toBeTruthy();
  });
});
