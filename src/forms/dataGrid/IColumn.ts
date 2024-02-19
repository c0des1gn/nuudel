export interface IColumn {
  /**
   * A unique key for identifying the column.
   */
  name: string;
  /**
   * Name to render on the column header.
   */
  title: string;
  /**
   * Type of field.
   */
  type?: string;
  /**
   * LookupList of field.
   */
  LookupList?: string;
}
