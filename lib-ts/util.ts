import snakeCase = require("lodash/snakeCase");

/**
 * Create a table name from a class name by trimming off any non-alpha prefix,
 * removing the trailing word `Model` if it's there, and converting it to `snake_case`.
 * @param name Name of the Class, usually gotten from `constructor.name`.
 */
export function tableNameOfModelClassName(name: string): string {
  const trimmedName = name.replace(/Model$/, '').replace(/^[^a-zA-Z]+/, '');
  return snakeCase(trimmedName);
}
