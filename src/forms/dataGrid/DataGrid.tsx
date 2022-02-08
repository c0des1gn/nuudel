import React from 'react';
import styles from './DataGrid.module.scss';
import moment from 'moment';
import { IDataGridProps, Paging } from './IDataGridProps';
import { IListFormState } from './iListState';
import { IColumn } from './IColumn';
import {
  PagingState,
  SortingState,
  CustomPaging,
  GroupingState,
  SelectionState,
  SearchState,
  FilteringState,
  IntegratedFiltering,
  IntegratedGrouping,
  IntegratedSelection,
  IntegratedSorting,
  SummaryState,
  IntegratedSummary,
  ExportPanel,
} from '@devexpress/dx-react-grid';
import {
  Grid as GridTable,
  DragDropProvider,
  Table,
  TableHeaderRow,
  TableSelection,
  TableColumnResizing,
  TableColumnReordering,
  SearchPanel,
  ColumnChooser,
  TableColumnVisibility,
  TableFilterRow,
  TableGroupRow,
  GroupingPanel,
  PagingPanel,
  Toolbar,
  TableSummaryRow,
} from '@devexpress/dx-react-grid-material-ui';
import {
  Plugin,
  Template,
  TemplatePlaceholder,
} from '@devexpress/dx-react-core';
import { Paper, IconButton, withStyles } from '@material-ui/core';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import IconCloud from '@material-ui/icons/CloudDownload';
import {
  MessageBar,
  MessageBox,
  Spinner,
  Text,
  Button,
  Link,
  TextField,
  Dialog,
  IFrame,
  Drawer,
  Menu,
} from 'nuudel-core';
import { MessageBarType } from 'nuudel-core';
import { DataProvider } from 'nuudel-core';
import { dateToString, getPath, dateToISOString } from 'nuudel-utils';
import { IDataProvider } from 'nuudel-core';
import { ListFormService } from 'nuudel-core';
import { t } from '@Translate';
import { alpha } from '@material-ui/core/styles';
import Add from '@material-ui/icons/Add';
import RefreshIcon from '@material-ui/icons/Cached';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import PrintIcon from '@material-ui/icons/Print';
import EditIcon from '@material-ui/icons/Edit';
import { withRouter } from 'next/router';
import { WithRouterProps } from 'next/dist/client/with-router';
import { StatusColor } from './StatusColor';
import { RESET_PASSWORD } from '../User/UserMutation';
import gql from 'graphql-tag';
import { ControlMode } from 'nuudel-utils';
import xlsx from 'xlsx';

const useStyles = theme => ({
  tableStriped: {
    '& tbody tr:nth-of-type(odd)': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
  },
});

type dialogOrDrawer =
  | 'assign'
  | 'dialog'
  | 'drawer'
  | 'all'
  | 'dialog_refresh'
  | 'drawer_refresh';

const LinkCell = (props: any) => (
  <Table.Cell {...props}>
    <Link target="_blank" href={props.url}>
      {props.value}
    </Link>
  </Table.Cell>
);

const DialogCell = (props: any) => (
  <Table.Cell {...props}>
    <Link onClick={props.onChange}>
      {props.value?.replace(/^[a-zA-Z0-9]{24}\:\:/, '')}
    </Link>
  </Table.Cell>
);

const ButtonCell = ({ onClick, ...props }: any) => (
  <Table.Cell {...props}>
    {!props.value || props.value === '--' ? (
      <div style={{ marginTop: '-14px', marginBottom: '-14px' }}>
        <IconButton onClick={onClick}>
          <AssignmentIndIcon />
        </IconButton>
      </div>
    ) : (
      props.value
    )}
  </Table.Cell>
);

const Styles = () => ({
  button: {
    fontSize: '14px',
  },
});

const RefreshGridBase = props => {
  const { onRefresh, classes } = props;
  return (
    <IconButton aria-label="refresh" color="inherit" onClick={onRefresh}>
      <RefreshIcon />
    </IconButton>
  );
};
const RefreshGrid = withStyles(Styles, { name: 'RefreshGrid' })(
  RefreshGridBase,
);

const CustomPanel = props => (
  <Plugin name="CustomPanel">
    <Template name="toolbarContent">
      <RefreshGrid {...props} />
      <TemplatePlaceholder />
    </Template>
  </Plugin>
);

export interface IListBase {
  _id: number | string;
}

class DataGrid extends React.Component<
  IDataGridProps & WithRouterProps,
  IListFormState
> {
  protected _isConfigurationValid: boolean = false;
  protected _mounted: boolean = false;
  protected _getRowId = row => row._id;
  protected _exporterRef = React.createRef<any>();
  private _highLightedRow = 'deliveryStatus';
  public static readonly _pageSize: number = 10;
  protected _dataProvider: IDataProvider = undefined;
  protected readonly systemFields: string[] = [
    '_createdby',
    '_modifiedby',
    'createdAt',
    'updatedAt',
    'latitude',
    'longitude',
    '_id',
  ];

  constructor(props: IDataGridProps & WithRouterProps) {
    super(props);
    if (!props.dataProvider) {
      this._dataProvider = new DataProvider(ListFormService);
      this._isConfigurationValid = this._dataProvider.validateSettings();
    } else if (props.dataProvider) {
      this._dataProvider = props.dataProvider;
      this._isConfigurationValid = props.dataProvider.validateSettings();
    }

    let datenow = new Date();
    this.state = {
      loading: true,
      refreshing: false,
      data: props.initdata || [],
      total: 0,
      filter: props.filter ? props.filter : '',
      isSaving: false,
      notifications: [],
      fieldErrors: {},
      tableColumnExtensions:
        props.ColumnExtensions ||
        [
          //{ columnName: '_id', align: 'right', wordWrapEnabled: false },
        ],
      columns: this._setupColumns(),
      ColumnWidths: [],
      columnOrder: [],
      fields: [],
      sorting: props.sort,
      pageSize: this.props.pageSize || DataGrid._pageSize,
      pageSizes: [
        ...new Set([this.props.pageSize || DataGrid._pageSize, 100, 250]),
      ],
      currentPage: 0,
      hiddenColumnNames:
        this.props.hiddenColumns && this.props.hiddenColumns.length > 0
          ? [...new Set([...this.props.hiddenColumns, '_id'])]
          : this.systemFields,
      startDate: dateToISOString(
        new Date(datenow.getFullYear(), datenow.getMonth(), 1),
      ),
      endDate: dateToISOString(new Date().setHours(23, 59, 59, 999)),
      selection: [],
      dialog: '',
      drawer: '',
      assign: '',
      alert: false,
      filters: [],
      searchValue: '',
      anchorEl: null,
      next: false,
      basepath: this.props.basepath || getPath(props.listname),
      spining: false,
      linkTitle: 'title',
      exporting: false,
      dialogPrint: [],
      totalSummaryItems: [{ columnName: '_id', type: 'count' }],
    };
  }

  static defaultProps = {
    pageSize: this._pageSize,
    pagination: Paging.Pagination,
    sort: [{ columnName: 'createdAt', direction: 'desc' }],
    initdata: [],
    title: '',
    description: '',
    filter: '',
    fields: null,
    context: { host: '' },
    dataProvider: null,
    IsGrouping: false,
    IsFiltering: false,
    IsSorting: true,
    IsSelection: true,
    IsReordering: true,
    IsSearching: true,
    IsColumnChooser: true,
    IsExport: true,
    hiddenColumns: ['_id'],
    ColumnExtensions: [
      { columnName: '_id', wordWrapEnabled: true, width: 200 },
    ],
    showDlg: true,
  };

  protected changeColumnOrder = newOrder => {
    this.setState({ columnOrder: newOrder });
  };

  protected hiddenColumnNamesChange = hiddenColumnNames => {
    this.setState({ hiddenColumnNames });
  };

  initListColumns() {
    if (this._dataProvider) {
      this._dataProvider.getFields(this.props.listname).then((cols: any[]) => {
        let colWidth: any[] = [],
          hiddenCol: string[] = [],
          linktitle = '';

        cols.forEach((item, index: number) => {
          colWidth.push({ columnName: item.name, width: 148 });
          if (item.name.startsWith('_')) {
            hiddenCol.push(item.name);
          } else if (
            !linktitle &&
            this.state.hiddenColumnNames.indexOf(item.name) < 0
          ) {
            //choose fitst showed column become link
            linktitle = item.name;
          }
        });
        let fields: string[] = cols.map(f => f.name);
        this.setState(
          {
            linkTitle: linktitle || 'title',
            columns: cols,
            fields: fields,
            ColumnWidths: colWidth,
            hiddenColumnNames: [
              ...new Set([...this.state.hiddenColumnNames, ...hiddenCol]),
            ],
            columnOrder: [...new Set([...fields, ...this.props.hiddenColumns])],
            totalSummaryItems: [
              { columnName: linktitle || '_id', type: 'count' },
            ],
          },
          () => this.fetchData(0),
        );
      });
    }
  }

  componentDidMount() {
    this._mounted = true;
    if (!this.state.columns || this.state.columns.length <= 1) {
      this.initListColumns();
    } else if (!this.state.data) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    this._mounted = false;
    //this._dataProvider = null;
    clearTimeout(this._debounce);
    clearTimeout(this.debounce);
  }

  componentDidUpdate(prevProps) {
    const { filter, sort, listname } = this.props;
    let pageSize =
      prevProps.pagination === Paging.None ||
      this.props.pagination === Paging.None
        ? 200
        : this.props.pageSize || prevProps.pageSize;
    if (
      prevProps.listname !== listname ||
      prevProps.filter !== filter ||
      prevProps.sort !== sort
    ) {
      this.setState(
        {
          currentPage: 0,
          total: 0,
          loading: true,
          next: false,
          filter: filter ? filter : '',
          sorting: sort ? sort : '',
          pageSize: pageSize,
          basepath: this.props.basepath || getPath(listname),
          hiddenColumnNames:
            this.props.hiddenColumns && this.props.hiddenColumns.length > 0
              ? [...new Set([...this.props.hiddenColumns, '_id'])]
              : this.systemFields,
        },
        () => {
          this.initListColumns();
        },
      );
    } else if (prevProps.pageSize !== this.props.pageSize) {
      this.setState({
        pageSize: pageSize,
      });
    }
  }

  openLink = (url: string) => {
    if (url.startsWith('/forms/')) {
      this.setState({ drawer: url, spining: true });
    } else if (this.props.showDlg) {
      this.setState({
        dialog: url,
        spining: true,
      });
    } else {
      this.props.router.push(url);
    }
  };

  private Cell = (props: any) => {
    if (props.column.name === 'url' && props.value && props.row) {
      return (
        <LinkCell
          {...props}
          url={`${this.state.basepath}/${props.row._id}/display`}
        />
      );
    } else if (
      props.column.name === this.state.linkTitle &&
      props.value &&
      props.row
    ) {
      return (
        <DialogCell
          {...props}
          onChange={() =>
            this.openLink(`${this.state.basepath}/${props.row._id}/display`)
          }
        />
      );
    }
    return <Table.Cell {...props} />;
  };

  private TableRow = ({ row, tableRow, children, ...restProps }) => {
    return (
      <Table.Row
        {...restProps}
        row={row}
        tableRow={tableRow}
        //className={classes.tableStriped}
        onClick={() => {
          this.openLink(`${this.state.basepath}/${row._id}/display`);
        }}
        style={{
          cursor: 'pointer',
          ...StatusColor[
            Object.keys(StatusColor).indexOf(row[this._highLightedRow]) < 0
              ? 'None'
              : row[this._highLightedRow]
          ],
        }}
      >
        {children}
      </Table.Row>
    );
  };

  protected _debounce: any = undefined;
  public changeSearchValue = (searchValue: string) => {
    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => {
      this.fetchData(0);
    }, 300);
    this.setState({
      searchValue,
    });
  };

  public changeSorting = sorting => {
    this.setState(
      {
        loading: true,
        sorting: sorting,
      },
      () => this.fetchData(0),
    );
  };

  public doRefresh = (): boolean => {
    let refreshed = false;
    if (!this.state.loading) {
      refreshed = true;
      this.setState(
        {
          loading: true,
        },
        () => this.fetchData(this.state.currentPage, 'no-cache'),
      );
    }
    return refreshed;
  };

  protected changeSelection = (selection: (string | number)[]) => {
    this.setState({ selection });
  };

  public changeCurrentPage = (currentPage: number) => {
    if (this.state.currentPage !== currentPage) {
      this.setState(
        {
          loading: true,
          currentPage: currentPage,
        },
        () => this.fetchData(currentPage),
      );
    }
  };

  public changePageSize = (pageSize: number) => {
    const { total, currentPage: stateCurrentPage } = this.state;
    const totalPages = Math.ceil(total / pageSize);
    let currentPage = Math.min(stateCurrentPage, totalPages - 1);
    currentPage = currentPage >= 0 ? currentPage : 0;
    this.setState(
      {
        loading: true,
        pageSize: pageSize,
        currentPage: currentPage,
      },
      () => this.fetchData(currentPage),
    );
  };

  private convertFilter(filters: any[]) {
    let fltr = {};
    filters.forEach(f => {
      if (!!f.value) {
        switch (f.operation) {
          case 'contains':
            fltr[f.columnName]['$regex'] = `${f.value}`; //  /value/
            break;
          case 'notContains':
            fltr[f.columnName]['$not']['$regex'] = `${f.value}`;
            break;
          case 'startsWith':
            fltr[f.columnName]['$regex'] = `^${f.value}.*`; //  /^value/
            break;
          case 'endsWith':
            fltr[f.columnName]['$regex'] = `.*${f.value}$`; //  /value$/
            break;
          case 'equal':
            fltr[f.columnName] = f.value;
            break;
          case 'notEqual':
            fltr[f.columnName]['$ne'] = f.value;
            break;
          default:
            break;
        }
      }
    });
    return JSON.stringify(fltr);
  }

  public changeFilters = filters => {
    this.setState({
      filters: filters,
    });
  };

  protected searchAssign() {
    let keyword: string = this.state.searchValue
      ? this.state.searchValue.replace(/['"<>]/g, '')
      : '';
    let search: string = '';
    let filter: string = this.filterFormat(this.props.filter);
    let sorting: string = this.sortFormat(
      this.state.sorting || this.props.sort,
    );
    // remote search
    if (keyword && !!this.state.linkTitle) {
      if (this.props.listname === 'Product') {
        search = keyword;
      } else {
        if (!filter || filter === '{}') {
          filter = `{ "${this.state.linkTitle}": "${keyword}"}`;
        } else {
          filter = `{ ${filter}, "${this.state.linkTitle}": "${keyword}"}`;
        }
      }
    }
    return {
      pageSize: 2000,
      total: 0,
      search: search,
      currentPage: 0,
      filter: filter,
      listname: this.props.listname,
      sorting: sorting,
    };
  }

  sortFormat(sorting: any): string {
    if (sorting instanceof Array) {
      if (sorting.length > 0 && sorting[0].columnName) {
        let srt = {};
        sorting.forEach(s => {
          srt[s.columnName] = s.direction === 'asc' ? 1 : -1;
        });
        sorting = JSON.stringify(srt);
      } else {
        sorting = '';
      }
    }
    return sorting;
  }

  filterFormat(filter: any): string {
    filter = !this.props.filter ? '' : this.props.filter;
    return filter;
  }

  private fetchData(page = this.state.currentPage, fetchPolicy?: string) {
    let { sorting } = this.state;
    sorting = this.sortFormat(sorting);
    let filter: string = this.filterFormat(this.props.filter);
    this._dataProvider
      .readListData({
        listname: this.props.listname,
        filter: filter,
        search: !!this.state.searchValue ? this.state.searchValue : '',
        total: page > 0 ? this.state.total : 0,
        currentPage: page,
        pageSize: this.state.pageSize,
        sorting: sorting,
        fetchPolicy,
      })
      .then(r => {
        if (this._mounted) {
          if (r) {
            //console.log(JSON.stringify(r.itemSummaries));
            this.setState((prevState, props) => ({
              data:
                props.pagination === Paging.InfiniteScroll &&
                page > 0 &&
                !!this.state.next
                  ? [...prevState.data, ...r.itemSummaries]
                  : r.itemSummaries,
              currentPage: page,
              total: r.total,
              loading: false,
              refreshing: false,
              next: !!r.next,
            }));
          } else {
            this.setState({
              currentPage: page,
              total: 0,
              loading: false,
              refreshing: false,
            });
          }
        }
      })
      .catch(error => {
        if (this._mounted) {
          this.setState({ loading: false, refreshing: false });
        }
      });
  }

  /*
  Some brute force to identify the type of field and return the text value of the field, trying to avoid one more rest call for field types
  Tested, Single line, Multiline, Choice, Number, Boolean, Lookup and Managed metadata, 
  */
  private _getFieldValueAsText(field: any, type?: string): string {
    let fieldValue: string = null;
    if (field === null || typeof field === 'undefined') {
      return fieldValue;
    }
    switch (typeof field) {
      case 'object':
        if (field instanceof Array) {
          if (!field.length) {
            fieldValue = '';
          }
          // people
          else if (field[0].Title) {
            fieldValue = field.map(value => value.Title).join(', ');
          }
          // name
          else if (field[0].Name) {
            fieldValue = field.map(value => value.Name).join(', ');
          }
          //username
          else if (field[0].UserName) {
            fieldValue = field.map(value => value.UserName).join(', ');
          }
          // choice and others
          else {
            fieldValue = field.join(', ');
          }
        } else {
          // lookup
          if (field.Title) {
            fieldValue = field.Title;
          } else if (field.Name) {
            fieldValue = field.Name;
          } else if (field.UserName) {
            fieldValue = field.UserName;
          }
        }
        break;
      default:
        if (type === 'DateTime') {
          fieldValue = field ? dateToString(field, 'YYYY/MM/DD HH:mm') : field;
        } else {
          fieldValue = field;
        }
        break;
    }
    return fieldValue;
  }

  private writeToExcel(data: any[]): void {
    let ws = xlsx.utils.aoa_to_sheet(data);
    let wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(
      wb,
      ws,
      (this.props.title || this.props.listname) +
        (this.state.selection.length > 0 ? '-selected' : ''),
    );
    xlsx.writeFile(
      wb,
      `${this.props.listname +
        '-' +
        new Date().toLocaleDateString('en-US')}.xlsx`,
    );
  }

  formatDataExcel(data: any[]) {
    let Columns: IColumn[] = [];
    this.state.columns.forEach((col: IColumn) => {
      if (this.state.hiddenColumnNames.indexOf(col.name) < 0) {
        Columns.push(col);
      }
    });

    let _grid: any[] = data.map((row: any, index: number) => {
      let _row: string[] = [],
        i: number = 0;
      Columns.forEach((viewColumn: IColumn) => {
        let value = '';
        if (viewColumn.name.indexOf('.') > 0) {
          let c = viewColumn.name.split('.');
          if (c.length === 2) value = row[c[0]] && row[c[0]][c[1]];
          else if (c.length === 3)
            value = row[c[0]] && row[c[0]][c[1]] && row[c[0]][c[1]][c[2]];
          else if (c.length === 4)
            value =
              row[c[0]] &&
              row[c[0]][c[1]] &&
              row[c[0]][c[1]][c[2]] &&
              row[c[0]][c[1]][c[2]][c[3]];
          else if (c.length === 5)
            value =
              row[c[0]] &&
              row[c[0]][c[1]] &&
              row[c[0]][c[1]][c[2]] &&
              row[c[0]][c[1]][c[2]][c[3]] &&
              row[c[0]][c[1]][c[2]][c[3]][c[4]];
          else value = row[viewColumn.name];
        } else {
          value = row[viewColumn.name];
        }
        _row[i++] = this._getFieldValueAsText(value, viewColumn.type);
      });
      return _row;
    });
    this.writeToExcel([Columns.map(col => col.title)].concat(_grid));
    this.setState({ exporting: false });
  }

  public onExport = (): void => {
    this.setState({ exporting: true });
    if (this._isConfigurationValid) {
      if (this.state.selection.length > 0) {
        this.formatDataExcel(
          this.state.selection.map(index => this.state.data[index]),
        );
      } else {
        this._dataProvider
          .readListData(this.searchAssign())
          .then(
            //resolve
            (r: any) => {
              if (r && r.itemSummaries.length > 0) {
                this.formatDataExcel(r.itemSummaries);
              }
            },
            //reject
            (data: any) => {},
          )
          .catch(ex => {
            this.showToast(t('Excel export failed'), 'error');
            this.setState({ exporting: false });
          });
      }
    }
  };

  /**
   *  Specify the columns and their properties
   */
  private _setupColumns(): IColumn[] {
    const columnsSingleClient: IColumn[] = [
      {
        title: 'ID',
        name: '_id',
      },
    ];
    return columnsSingleClient;
  }

  private showToast = (
    text: string,
    type: MessageBarType = 'info',
    duration: number = 5000,
  ) => {
    if (text) {
      if (this.state.notifications.length === 0) {
        this.setState({ notifications: [{ text, type, duration }] });
      } else {
        this.setState({
          notifications: [
            ...this.state.notifications,
            { text, type, duration },
          ],
        });
      }
    }
  };
  protected debounce: any = undefined;
  private renderNotifications() {
    if (this.state.notifications.length === 0) {
      return null;
    }
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => {
      this.setState({ notifications: [] });
    }, this.state.notifications[0].duration || 5000);
    return (
      <div>
        {this.state.notifications.map((item, idx) => (
          <MessageBar
            key={idx}
            messageBarType={item.type || 'info'}
            onClose={e => this.clearNotification(idx)}
          >
            {item.text}
          </MessageBar>
        ))}
      </div>
    );
  }

  private clearNotification(idx: number) {
    this.setState((prevState, props) => ({
      notifications: prevState.notifications.splice(idx, 1),
    }));
  }

  protected onchangeDate = (e: any) => {
    let startdate = dateToISOString(e?.target?.value);
    if (typeof startdate !== 'undefined' && startdate !== null) {
      this.onchangeFilter(this.state.endDate, startdate);
    }
  };

  protected onchangeFilter = (
    e: any = this.state.endDate,
    startDate = this.state.startDate,
  ) => {
    let endDate = !e?.target?.value ? e : dateToISOString(e.target.value);
    if (typeof endDate !== 'undefined' && endDate !== null) {
      const currentPage = 0;
      this.setState(
        {
          startDate: startDate,
          endDate:
            new Date(startDate) > new Date(endDate) ? startDate : endDate,
          currentPage: currentPage,
        },
        () => this.fetchData(currentPage),
      );
    }
  };

  public handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ anchorEl: e.currentTarget });
  };

  protected handleClose = () => {
    this.setState({ anchorEl: null });
  };

  protected removeItem = () => {
    this.setState({ alert: false });
    //this.setState({ loading: true });
    if (this.state.selection.length === 1) {
      const row = this.state.data[this.state.selection[0]];
      if (row && row._id) {
        this._dataProvider.lfs.client
          .mutate({
            mutation: gql`mutation Delete${this.props.listname}($_id: ObjectId!) {
              delete${this.props.listname}(_id: $_id) {
                _id
              }
            }`,
            variables: {
              _id: row._id,
            },
          })
          .then(r => {
            if (r && r.data) {
              const id = r.data['delete' + this.props.listname]._id || row._id;
              let rows = [...this.state.data];
              let index: number = Number(this.state.selection[0]);
              if (index < rows.length && id === rows[index]._id) {
                rows.splice(index, 1);
                this.setState({ data: rows, selection: [] });
              }
            }
            this.showToast(t('Item deleted successfully'), 'success');
            this.handleClose();
          })
          .catch(e => {
            this.showToast(t('Deletion unsuccessful') + ': ' + e, 'error');
            this.handleClose();
          });
      }
    } else {
      this.showToast(t('Check only one checkbox at a time'), 'warning');
    }
    //this.setState({ loading: false });
  };

  protected closeDialogOrDrawer = (name: dialogOrDrawer = 'all') => {
    if (name === 'assign') {
      this.setState({ assign: '', spining: false });
    } else if (name.startsWith('drawer')) {
      this.setState({ drawer: '', spining: false });
      if (name === 'drawer_refresh') {
        this.doRefresh();
      }
    } else if (name.startsWith('dialog')) {
      this.setState({ dialog: '', spining: false });
      if (name === 'dialog_refresh') {
        this.doRefresh();
      }
    } else {
      this.setState({ dialog: '', drawer: '', assign: '', spining: false });
    }
  };

  protected resetPassword = () => {
    //this.setState({ loading: true });
    if (this.state.selection.length === 1) {
      const row = this.state.data[this.state.selection[0]];
      const pass: string = Math.random()
        .toString(36)
        .substring(2, 10);
      if (row && row._id) {
        this._dataProvider.lfs.client
          .mutate({
            mutation: RESET_PASSWORD,
            variables: {
              id: row._id,
              password: pass,
            },
          })
          .then(r => {
            if (r.data && r.data.passwordResetByAdmin) {
              this.showToast(
                t('Password reset successfully') + ': ' + pass,
                'success',
                20000,
              );
            } else {
              this.showToast(t('Password reset unsuccessful'), 'error');
            }
            this.handleClose();
          })
          .catch(e => {
            this.showToast(
              t('Password reset unsuccessful') + ': ' + e,
              'error',
            );
            this.handleClose();
          });
      }
    } else {
      this.showToast(t('Check only one checkbox at a time'), 'warning');
    }
    //this.setState({ loading: false });
  };

  hideSpinner = () => {
    this.setState({
      spining: false,
    });
  };

  printLabels = (selected: (string | number)[]) => {
    const deliveries = selected.map((s, i) => this.state.data[i]);
    this.setState({ dialogPrint: deliveries });
  };

  printShelf = (selected: (string | number)[]) => {
    const shelf = selected.map((s, i) => this.state.data[i]);
    this.setState({ dialogPrint: shelf });
  };

  public render(): React.ReactElement<IDataGridProps> {
    const { columnOrder, pageSizes, total } = this.state;

    if (!this._isConfigurationValid) {
      return (
        <div className={styles.notification}>
          <div className={styles.notificationIcon}>
            <i className={styles.notificationIcon} aria-hidden="true" />
            <span className={styles.notificationHeader}>
              {t('Please enter list in property')}
            </span>
          </div>
        </div>
      );
    } else {
      if (this.state.loading) {
        return <Spinner overflowHide size={20} color="inherit" />;
      } else {
        return (
          <div className={styles.dataGrid}>
            <Paper>
              {this.renderNotifications()}
              {this.props.showDlg && (
                <Dialog
                  fullScreen
                  title={t(this.props.listname, {
                    defaultValue: this.props.listname,
                  })}
                  open={!!this.state.dialog}
                  onClose={() => this.closeDialogOrDrawer('dialog')}
                >
                  {this.state.spining && <Spinner />}
                  {!!this.state.dialog && (
                    <IFrame
                      url={`${this.state.dialog}?IsDlg=1`}
                      height="1200px"
                      width="800px"
                      loading="eager"
                      frameBorder={0}
                      importance="high"
                      onClose={e =>
                        this.closeDialogOrDrawer(
                          e === true ? 'dialog_refresh' : 'dialog',
                        )
                      }
                      onLoad={this.hideSpinner}
                      className={styles.iframeContainer}
                    />
                  )}
                </Dialog>
              )}
              {
                // close all dialog second solution
                <Link
                  noLinkStyle
                  style={{ display: 'none' }}
                  onClick={() => this.closeDialogOrDrawer()}
                  id="closealldialogordrawer"
                >
                  {'Close'}
                </Link>
              }
              {this.props.showDlg && (
                <Drawer
                  anchor="right"
                  open={Boolean(!!this.state.drawer)}
                  onClose={() =>
                    this.closeDialogOrDrawer(
                      this.state.spining ||
                        this.state.drawer.endsWith('/display')
                        ? 'drawer'
                        : 'drawer_refresh',
                    )
                  }
                  onOpen={() => {}}
                >
                  {this.state.spining && <Spinner />}
                  {!!this.state.drawer && (
                    <IFrame
                      url={`${this.state.drawer}?IsDlg=1`}
                      hidden={!this.state.drawer}
                      //src={'https://www.youtube.com/embed/YJGCZCaIZkQ'}
                      height="100%"
                      loading="eager"
                      frameBorder={0}
                      importance="high"
                      onClose={e =>
                        this.closeDialogOrDrawer(
                          e === true ? 'drawer_refresh' : 'drawer',
                        )
                      }
                      onLoad={this.hideSpinner}
                      //scrolling="no"
                      //allowFullScreen={true}
                      //onInferredClick={() => alert('You clicked')}
                      //sandbox="allow-same-origin"
                    />
                  )}
                </Drawer>
              )}
              <MessageBox
                title={t('Delete')}
                description={t('AreYouSureToRemove')}
                show={this.state.alert}
                onSubmit={this.removeItem}
                onClose={() => {
                  this.setState({ alert: false });
                  this.handleClose();
                }}
              />
              <Button
                className={styles.button}
                color="primary"
                startIcon={<Add />}
                onClick={() => this.openLink(this.state.basepath)}
              >
                {t('New')}
              </Button>
              <>
                <Button
                  className={styles.button}
                  aria-controls="action-menu"
                  aria-haspopup="true"
                  onClick={this.handleClick}
                  startIcon={<MoreVertIcon />}
                >
                  {t('Action')}
                </Button>
                <Menu
                  items={[
                    {
                      label: t('Edit'),
                      icon: (
                        <EditIcon
                          fontSize="small"
                          className={styles.fixiconmenu}
                        />
                      ),
                      onClick: () => {
                        if (this.state.selection.length === 1) {
                          const row = this.state.data[this.state.selection[0]];
                          if (row && row._id) {
                            this.openLink(
                              `${
                                this.props.listname === 'User'
                                  ? '/admin/profile'
                                  : this.state.basepath
                              }/${row._id}`,
                            );
                          }
                        } else {
                          this.showToast(
                            t('Check only one checkbox at a time'),
                            'warning',
                          );
                        }
                        this.handleClose();
                      },
                    },
                    {
                      label: t('Delete'),
                      icon: (
                        <DeleteForeverIcon
                          fontSize="small"
                          className={styles.fixiconmenu}
                        />
                      ),
                      onClick: () => {
                        if (this.state.selection.length === 1) {
                          this.setState({ alert: true });
                        } else {
                          this.showToast(
                            t('Check only one checkbox at a time'),
                            'warning',
                          );
                        }
                      },
                    },
                    {
                      label: t('Excel Export'),
                      icon: (
                        <IconCloud
                          fontSize="small"
                          className={styles.fixiconmenu}
                        />
                      ),
                      disabled: !this.props.IsExport || this.state.exporting,
                      onClick: () => {
                        this.onExport();
                        this.handleClose();
                      },
                    },
                    this.props.listname === 'User' &&
                      this.props.user?.type === 'Admin' && {
                        label: t('Reset password'),
                        icon: (
                          <RefreshIcon
                            fontSize="small"
                            className={styles.fixiconmenu}
                          />
                        ),
                        onClick: () => {
                          if (this.state.selection.length === 1) {
                            this.resetPassword();
                          } else {
                            this.showToast(
                              t('Check only one checkbox at a time'),
                              'warning',
                            );
                          }
                        },
                      },
                  ].filter(ac => ac)}
                  id="action-menu"
                  anchorEl={this.state.anchorEl}
                  keepMounted={true}
                  open={Boolean(this.state.anchorEl)}
                  onClose={this.handleClose}
                ></Menu>
              </>

              {this.props.listname === 'Delivery' && this.props.showDateFilter && (
                <>
                  <TextField
                    label={t('Start date')}
                    className={styles.datetime}
                    value={dateToString(this.state.startDate)}
                    id="startdate"
                    variant="outlined"
                    type="datetime-local"
                    size="small"
                    InputProps={{
                      inputProps: {
                        min: '2022-01-01T00:00',
                        max: dateToString(this.state.endDate),
                      },
                    }}
                    onChange={this.onchangeDate}
                  />
                  <TextField
                    label={t('End date')}
                    className={styles.datetime}
                    value={dateToString(this.state.endDate)}
                    id="startdate"
                    variant="outlined"
                    type="datetime-local"
                    size="small"
                    InputProps={{
                      inputProps: {
                        min: dateToString(this.state.startDate),
                        max: dateToString(
                          dateToISOString(new Date().setHours(23, 59, 59, 999)),
                        ),
                      },
                    }}
                    onChange={this.onchangeFilter}
                  />
                </>
              )}
              <div className={styles.title}>{this.props.title}</div>
              {this.props.description && (
                <div className={styles.description}>
                  {this.props.description}
                </div>
              )}

              <div className={styles.paper}>
                <GridTable
                  rows={this.state.data}
                  columns={this.state.columns}
                  //getRowId={this._getRowId}
                >
                  <SummaryState totalItems={this.state.totalSummaryItems} />
                  {this.props.IsFiltering ? (
                    <FilteringState onFiltersChange={this.changeFilters} />
                  ) : null}
                  {this.props.IsSearching ? (
                    <SearchState
                      value={this.state.searchValue}
                      onValueChange={this.changeSearchValue}
                    />
                  ) : null}

                  {(this.props.IsGrouping || this.props.IsSorting) && (
                    <SortingState
                      sorting={this.state.sorting}
                      onSortingChange={this.changeSorting}
                    />
                  )}
                  {this.props.IsSelection && (
                    <SelectionState
                      selection={this.state.selection}
                      onSelectionChange={this.changeSelection}
                    />
                  )}
                  {this.props.IsGrouping && <GroupingState />}

                  {this.props.pagination === Paging.Pagination && (
                    <PagingState
                      defaultCurrentPage={0}
                      defaultPageSize={DataGrid._pageSize}
                      currentPage={this.state.currentPage}
                      onCurrentPageChange={this.changeCurrentPage}
                      pageSize={this.state.pageSize}
                      onPageSizeChange={this.changePageSize}
                    />
                  )}

                  {this.props.IsGrouping && <IntegratedGrouping />}
                  {this.props.IsFiltering && <IntegratedFiltering />}
                  {this.props.IsSorting && <IntegratedSorting />}
                  {this.props.IsSelection && <IntegratedSelection />}

                  {this.props.pagination === Paging.Pagination && (
                    <CustomPaging totalCount={total} />
                  )}

                  {(this.props.IsGrouping || this.props.IsReordering) && (
                    <DragDropProvider />
                  )}

                  {this.state.fields.indexOf(this._highLightedRow) < 0 ? (
                    <Table
                      columnExtensions={this.state.tableColumnExtensions}
                      cellComponent={this.Cell}
                      messages={{
                        noData: t('noData'),
                      }}
                    />
                  ) : (
                    <Table
                      columnExtensions={this.state.tableColumnExtensions}
                      cellComponent={this.Cell}
                      rowComponent={this.TableRow}
                      messages={{
                        noData: t('noData'),
                      }}
                    />
                  )}

                  <TableColumnVisibility
                    hiddenColumnNames={this.state.hiddenColumnNames}
                    onHiddenColumnNamesChange={this.hiddenColumnNamesChange}
                  />
                  <TableColumnResizing
                    defaultColumnWidths={this.state.ColumnWidths}
                  />
                  {this.props.IsReordering && (
                    <TableColumnReordering
                      order={columnOrder}
                      onOrderChange={this.changeColumnOrder}
                    />
                  )}
                  {this.props.IsSelection && (
                    <TableSelection
                      showSelectAll={true}
                      selectByRowClick={false}
                    />
                  )}

                  <IntegratedSummary />
                  <TableHeaderRow showSortingControls={this.props.IsSorting} />

                  {this.props.IsFiltering && (
                    <TableFilterRow showFilterSelector={true} />
                  )}
                  {this.props.pagination === Paging.Pagination && (
                    <PagingPanel
                      pageSizes={pageSizes}
                      messages={{
                        rowsPerPage: t('rowsPerPage'),
                        showAll: t('showAll'),
                        info: t('info'),
                      }}
                    />
                  )}

                  {this.props.IsGrouping && <TableGroupRow />}
                  {(this.props.IsGrouping ||
                    this.props.IsSearching ||
                    this.props.IsColumnChooser) && <Toolbar />}

                  <CustomPanel onRefresh={this.doRefresh} />
                  {this.props.IsColumnChooser && <ColumnChooser />}
                  {this.props.IsSearching && (
                    <SearchPanel
                      messages={{ searchPlaceholder: t('Search') }}
                    />
                  )}
                  {this.props.IsGrouping && (
                    <GroupingPanel showSortingControls={this.props.IsSorting} />
                  )}
                  <TableSummaryRow
                    messages={{
                      count: t('count'),
                      sum: t('sum'),
                      min: t('min'),
                      max: t('max'),
                      avg: t('avg'),
                    }}
                  />
                </GridTable>
              </div>
            </Paper>
          </div>
        );
      }
    }
  }
}

export default withRouter(DataGrid);
