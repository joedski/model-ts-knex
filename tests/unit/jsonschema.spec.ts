import { KitchenSinkModel } from './fixtures';

describe('JSONSchema Generation', () => {
  test('should generate a JSON Schema as expected', () => {
    const recordSchema = KitchenSinkModel.toRecordJSONSchema();
    const newRecordSchema = KitchenSinkModel.toNewRecordJSONSchema();

    expect(recordSchema).toMatchSnapshot();
    expect(newRecordSchema).toMatchSnapshot();
  });
});
