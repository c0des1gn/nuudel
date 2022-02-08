import { ApolloClient } from '@apollo/client';
export interface IDataGridProps {
  title: string;
  description?: string;
  listname: string;
  pagination: Paging;
  initdata?: any[];
  filter: any;
  pageSize?: number;
  id?: number;
  apollo: ApolloClient<any>;
  fields?: any[];
  sort?: any[];
  context: any;
  viewName?: string;
  showDateFilter?: boolean;
  dataProvider: any; //IDataProvider;
  IsGrouping: boolean;
  IsFiltering: boolean;
  IsSorting: boolean;
  IsSelection: boolean;
  IsReordering: boolean;
  IsSearching: boolean;
  IsColumnChooser: boolean;
  IsExport: boolean;
  hiddenColumns: string[];
  reloadCount?: number;
  ColumnExtensions?: any[];
  showDlg?: boolean;
  user?: any;
  basepath?: string;
}

/**
 * pagination with next and previous buttons.
 */
export enum Paging {
  None = 0,
  Pagination = 1,
  InfiniteScroll = 2,
}
