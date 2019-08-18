import { tableNameOfModelClassName } from "../../lib-ts/util";

describe('util', () => {
  describe('tableNameOfModelClassName', () => {
    test('should create the expected name from a class name', () => {
      expect(tableNameOfModelClassName('FooModel')).toBe('foo');
      expect(tableNameOfModelClassName('RemoteServerModel')).toBe('remote_server');
      expect(tableNameOfModelClassName('PackedBoxesModel')).toBe('packed_boxes');
      expect(tableNameOfModelClassName('$ModelWithPrefixModel')).toBe('model_with_prefix');
    });
  });
});
