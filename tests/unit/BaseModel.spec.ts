import { BaseModel, FooModel } from './fixtures';
import ModelField from '../../lib-ts/ModelField';

describe('BaseModel functionality', () => {
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

  describe('Query Builder Methods', () => {
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
        FooModel.findWhere(q => q.where({ bar_id: 1 }).orWhere({ bar_id: 2 }), [
          'id',
        ]).toString()
      ).toMatchSnapshot();
      expect(
        FooModel.findWhere(q => q.where({ bar_id: 1 }).orWhere({ bar_id: 2 }), [
          'id',
          'foo',
        ]).toString()
      ).toMatchSnapshot();
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
  });
});
