import { BaseModel, FooModel, FooRecord, MutuallyAssignable } from './fixtures';
import ModelField from '../../lib-ts/ModelField';

describe('BaseModel functionality', () => {
  describe('BaseModel#tableName', () => {
    test('should autogenerate an appropriate table name if none is specified', () => {
      class $RamseysTestKitchenModel extends BaseModel({
        fields: {
          id: ModelField.increments().notInNew(),
          yelling: ModelField.enum(['yes'] as const).notNullable(),
        },
      }) {}

      const RamseysTestKitchenModel = new $RamseysTestKitchenModel();

      expect(RamseysTestKitchenModel.tableName).toBe('ramseys_test_kitchen');
    });

    test('should use the specified name if one is specified', () => {
      class $SomeOtherTestModel extends BaseModel({
        tableName: 'totally_different_name',
        fields: {
          id: ModelField.increments().notInNew(),
        },
      }) {}

      const SomeOtherTestModel = new $SomeOtherTestModel();

      expect(SomeOtherTestModel.tableName).toBe('totally_different_name');
    });
  });

  describe('Query Builder Methods', () => {
    describe('#findWhere', () => {
      test('should build a basic select with #findWhere', () => {
        expect(FooModel.findWhere({ bar_id: 4 }).toString()).toMatchSnapshot();
        expect(
          FooModel.findWhere({ bar_id: 4 }, ['id']).toString()
        ).toMatchSnapshot();
        expect(
          FooModel.findWhere({ bar_id: 4 }, ['id', 'foo']).toString()
        ).toMatchSnapshot();

        expect(
          FooModel.findWhere(q =>
            q.where({ bar_id: 1 }).orWhere({ bar_id: 2 })
          ).toString()
        ).toMatchSnapshot();
        expect(
          FooModel.findWhere(
            q => q.where({ bar_id: 1 }).orWhere({ bar_id: 2 }),
            ['id']
          ).toString()
        ).toMatchSnapshot();
        expect(
          FooModel.findWhere(
            q => q.where({ bar_id: 1 }).orWhere({ bar_id: 2 }),
            ['id', 'foo']
          ).toString()
        ).toMatchSnapshot();
      });

      test('should return a promise on RecordType[] if no select parameter is passed', () => {
        const fn1 = async () => FooModel.findWhere({ bar_id: 4 });
        const fn2: () => Promise<FooRecord[]> = fn1;
        const assignable: MutuallyAssignable<typeof fn1, typeof fn2> = true;

        expect(fn1).toBe(fn2);
        expect(assignable).toBe(true);
      });

      test('should return a promise on RecordType[] if an empty select parameter is passed', () => {
        const fn1 = async () => FooModel.findWhere({ bar_id: 4 }, []);
        const fn2: () => Promise<FooRecord[]> = fn1;
        const assignable: MutuallyAssignable<typeof fn1, typeof fn2> = true;

        expect(fn1).toBe(fn2);
        expect(assignable).toBe(true);
      });

      test('should return a promise on a partial RecordType[] if some select is passed', () => {
        const fn1 = async () => FooModel.findWhere({ bar_id: 4 }, ['id']);
        const fn2: () => Promise<{ id: number }[]> = fn1;
        const assignable1$2: MutuallyAssignable<typeof fn1, typeof fn2> = true;

        expect(fn1).toBe(fn2);
        expect(assignable1$2).toBe(true);

        const fn3 = async () =>
          FooModel.findWhere({ bar_id: 4 }, ['id', 'foo']);
        const fn4: () => Promise<{ id: number; foo: number | null }[]> = fn3;
        const assignable3$4: MutuallyAssignable<typeof fn3, typeof fn4> = true;

        expect(fn3).toBe(fn4);
        expect(assignable3$4).toBe(true);
      });
    });

    test('should build a basic select limited to 1 item with #findOneWhere', () => {
      expect(FooModel.findOneWhere({ bar_id: 4 }).toString()).toMatchSnapshot();
      expect(
        FooModel.findOneWhere({ bar_id: 4 }, ['id']).toString()
      ).toMatchSnapshot();
      expect(
        FooModel.findOneWhere({ bar_id: 4 }, ['id', 'foo']).toString()
      ).toMatchSnapshot();

      expect(
        FooModel.findOneWhere(q =>
          q.where({ bar_id: 1 }).orWhere({ bar_id: 2 })
        ).toString()
      ).toMatchSnapshot();
      expect(
        FooModel.findOneWhere(
          q => q.where({ bar_id: 1 }).orWhere({ bar_id: 2 }),
          ['id']
        ).toString()
      ).toMatchSnapshot();
      expect(
        FooModel.findOneWhere(
          q => q.where({ bar_id: 1 }).orWhere({ bar_id: 2 }),
          ['id', 'foo']
        ).toString()
      ).toMatchSnapshot();
    });

    test('should build a basic insert with #insertOne', () => {
      expect(
        FooModel.insertOne({ foo: 25, bar_id: 2 }).toString()
      ).toMatchSnapshot();
      expect(
        FooModel.insertOne({ foo: 25, bar_id: 2 }, 'id').toString()
      ).toMatchSnapshot();
    });
  });
});
