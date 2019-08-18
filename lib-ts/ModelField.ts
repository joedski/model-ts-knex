import { Raw } from "knex";

type ColumnType =
  | ['integer']
  | ['bigInteger']
  /**
   * there's an optional 'medium' | 'big' that could go after,
   * but that's for mysql only, and I'm using postgres.
   */
  | ['text']
  | ['string', number | null]
  | ['float', number | null, number | null]
  | ['decimal', number | null, number | null]
  | ['boolean']
  | ['date']
  | ['datetime', { useTz?: boolean; precision?: number }]
  | ['time', number | null]
  | ['timestamp', { useTz?: boolean; precision?: number }]
  | ['binary']
  | ['enum', Array<string> | null, { useNative?: boolean; enumName?: string }]
  | ['json']
  | ['jsonb']
  | ['uuid']
  ;

export default class ModelField<TSType, InNew extends boolean = true, NotNullable extends boolean = false> {
  // Type Factory Helpers

  public static integer() {
    const field = new ModelField<number>();
    field.$type = ['integer'];
    return field;
  }
  public static bigInteger() {
    const field = new ModelField<number>();
    field.$type = ['bigInteger'];
    return field;
  }
  public static text() {
    const field = new ModelField<string>();
    field.$type = ['text'];
    return field;
  }
  public static string(length: number = 256) {
    const field = new ModelField<string>();
    field.$type = ['string', length];
    return field;
  }
  public static float(precision?: number, scale?: number) {
    const field = new ModelField<number>();
    field.$type = ['float', typeof precision === 'number' ? precision : null, typeof scale === 'number' ? scale : null];
    return field;
  }
  public static decimal(precision?: number, scale?: number) {
    const field = new ModelField<number>();
    field.$type = ['decimal', typeof precision === 'number' ? precision : null, typeof scale === 'number' ? scale : null];
    return field;
  }
  public static boolean() {
    const field = new ModelField<boolean>();
    field.$type = ['boolean'];
    return field;
  }
  public static date() {
    // TODO: You can toggle parsing of dates and get back strings.  How to account for that?
    const field = new ModelField<Date>();
    field.$type = ['date'];
    return field;
  }
  public static datetime(options: { useTz?: boolean; precision?: number } = {}) {
    // TODO: You can toggle parsing of datetimes and get back strings.  How to account for that?
    const field = new ModelField<Date>();
    field.$type = ['datetime', options];
    return field;
  }
  public static time(precision?: number) {
    const field = new ModelField<string>();
    field.$type = ['time', typeof precision === 'number' ? precision : null];
    return field;
  }
  public static timestamp(options: { useTz?: boolean; precision?: number } = {}) {
    const field = new ModelField<Date>();
    field.$type = ['timestamp', options];
    return field;
  }
  public static binary() {
    // TODO: What's the actual types used here?  Have to check all the drivers, I guess.
    const field = new ModelField<Buffer | Uint8Array>();
    field.$type = ['binary'];
    return field;
  }
  public static enum<TValues extends Array<string>>(values: TValues, options: { useNative?: boolean; enumName?: string } = {}) {
    // TODO: Enum...
    const field = new ModelField<TValues>();
    field.$type = ['enum', values, options];
    return field;
  }
  public static json<T = unknown>() {
    // TODO: Should we do anything about json?
    const field = new ModelField<T>();
    field.$type = ['json'];
    return field;
  }
  public static jsonb<T = unknown>() {
    // TODO: Should we do anything about json?
    const field = new ModelField<T>();
    field.$type = ['jsonb'];
    return field;
  }
  public static uuid() {
    const field = new ModelField<string>();
    field.$type = ['uuid'];
    return field;
  }

  // NOTE: name is specified by the field key, not in this class.
  public $wasNamed: string | null = null;
  public $type!: ColumnType;
  public $useInNew: InNew = true as InNew;
  public $unsigned: boolean = false;
  public $comment: string | null = null;
  public $notNullable: NotNullable = false as NotNullable;
  public $default: boolean | number | string | Raw | null = null;
  public $primary: boolean = false;
  public $unique: boolean = false;

  // Fluent mutators ala knex to set the above props.
  // Includes type coercion to maintain exact type params
  // for useful derivation via RecordFieldType<T>.

  public useInNew<TInNew extends boolean>(inNew: TInNew) {
    const next = this as ModelField<TSType, boolean, NotNullable> as ModelField<TSType, TInNew, NotNullable>;
    next.$useInNew = inNew;
    return next;
  }

  public notInNew() {
    return this.useInNew(false);
  }

  public unsigned() {
    this.$unsigned = true;
    return this;
  }

  public comment(commentString: string | null) {
    this.$comment = commentString;
    return this;
  }

  public notNullable() {
    const next = this as ModelField<TSType, InNew, true>;
    next.$notNullable = true;
    return next;
  }

  public default(value: boolean | number | string | Raw) {
    this.$default = value;
    return this;
  }

  public primary() {
    this.$primary = true;
    return this;
  }

  public unique() {
    this.$unique = true;
    return this;
  }

  /**
   * Specifies that this column previously had a different name.
   * This should only be kept around for 1 migration.
   * @param oldName Name of this column in the previous version of the table.
   */
  public wasNamed(oldName: string) {
    this.$wasNamed = oldName;
    return this;
  }
}
