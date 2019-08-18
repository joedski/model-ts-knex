import { BaseModel } from "./fixtures";
import ModelField from "../../lib-ts/ModelField";

describe('BaseModel functionality', () => {
  test('should autogenerate an appropriate table name if none is specified', () => {
    class $RamseysTestKitchenModel extends BaseModel({
      fields: {
        id: ModelField.increments().notInNew(),
        yelling: ModelField.enum(['yes'] as const).notNullable(),
      },
    }) {};

    const RamseysTestKitchenModel = new $RamseysTestKitchenModel();

    expect(RamseysTestKitchenModel.tableName).toBe('ramseys_test_kitchen');
  })

  test('should use the specified name if one is specified', () => {
    class $SomeOtherTestModel extends BaseModel({
      tableName: 'totally_different_name',
      fields: {
        id: ModelField.increments().notInNew(),
      },
    }) {}

    const SomeOtherTestModel = new $SomeOtherTestModel();

    expect(SomeOtherTestModel.tableName).toBe('totally_different_name');
  })
});
