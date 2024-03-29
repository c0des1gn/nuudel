import React, {useState, useEffect} from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {
  TreeDataState,
  CustomTreeData,
  SelectionState,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  VirtualTable,
  TableHeaderRow,
  TableTreeColumn,
} from '@devexpress/dx-react-grid-material-ui';
import {Spinner, Menu, Link, Text} from 'nuudel-core';
import {useQuery, useMutation} from '@apollo/react-hooks';
import Add from '@mui/icons-material/Add';
import {useRouter} from 'next/navigation';
import {
  UPDATE_CATEGORY_MUTATION,
  REMOVE_CATEGORY_MUTATION,
} from './CategoryMutation';
import {Message, TOGGLE_SNACKBAR_MUTATION} from 'nuudel-core';
import {GET_CATEGORIES} from './CategoryQuery';
import {useApolloClient} from '@apollo/react-hooks';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {t} from '@Translate';

const ROOT_ID = null;

const getRowId = row => row.cid;
const getChildRows = (row, rootRows) => {
  const childRows = rootRows.filter(
    r => r && r.parent_id === (row ? row.cid : ROOT_ID),
  );
  if (childRows.length) {
    return childRows;
  }
  return row && row.hasChild ? [] : null;
};

const Category: React.FC = () => {
  const router = useRouter();
  const [messageMutation] = useMutation(TOGGLE_SNACKBAR_MUTATION);
  const client: any = useApolloClient();
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);

  const [deleteCategoryMutation] = useMutation<any, any>(
    REMOVE_CATEGORY_MUTATION,
    {
      // onError: (error) => {
      // },
      // onCompleted: (data) => {
      // },
      // refetchQueries: {
      // },
      update(cache, result: any) {
        let dat: any = [];
        const deletedId = result.data.removeCategory._id;
        // 1. Read the cache from the items we want
        try {
          dat = cache.readQuery({query: GET_CATEGORIES});
          dat = dat.getCategories.itemSummaries;
        } catch {
          dat = [...data];
        }
        // 2. Filter the deleted item
        setData(dat.filter((item: any) => item._id !== deletedId));
      },
    },
  );

  const [updateCategoryMutation] = useMutation<any, any>(
    UPDATE_CATEGORY_MUTATION,
    {
      // onError: (error) => {
      // },
      // onCompleted: (data) => {
      // },
      // refetchQueries: {
      // },
      update(cache, result) {
        const data: any = cache.readQuery({query: GET_CATEGORIES});
        const returnedData = {...result.data};
        const returnedDataValue: any = Object.values(returnedData)[0];
        data.getCategories.itemSummaries.map((item: any) => {
          if (item._id === returnedDataValue._id) {
            item.name = returnedDataValue.name;
            item.slug = returnedDataValue.slug;
            item.parent_id = returnedDataValue.parent_id;
            item.hasChild = returnedDataValue.hasChild;
          }
        });
      },
    },
  );

  const [columns] = useState([
    {name: 'name', title: t('Name')},
    {
      name: 'slug',
      title: t('Slug'),
      getCellValue: row => `${row.slug}`,
    },
    {
      name: 'createdAt',
      title: t('Created Date'),
      getCellValue: row => new Date(Date.parse(row.createdAt)).toLocaleString(),
    },
  ]);

  const [tableColumnExtensions] = useState([
    {columnName: 'name', width: 400},
    {columnName: 'slug', width: 120, align: 'right' as const},
  ]);

  const [expandedRowIds, setExpandedRowIds] = useState([]);
  const [selection, setSelection] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    const rowIdsWithNotLoadedChilds = [ROOT_ID, ...expandedRowIds].filter(
      rowId => data.findIndex(row => row && row.parent_id === rowId) === -1,
    );
    if (rowIdsWithNotLoadedChilds.length) {
      if (loading) return;
      setLoading(true);
      Promise.all(
        rowIdsWithNotLoadedChilds.map(async (rowId: any) => {
          let rData = await client.query({
            query: GET_CATEGORIES,
            variables: {
              filter: `{ "parent_id": ${!rowId ? 'null' : '"' + rowId + '"'} }`,
            },
            fetchPolicy: 'no-cache',
          });

          if (rData && rData.data && rData.data.getCategories) {
            return rData.data.getCategories.itemSummaries;
          }
          return [];
        }),
      )
        .then(loadedData => {
          if (loadedData && loadedData.length) {
            setData(data.concat(...loadedData));
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [expandedRowIds]);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (data) {
    return (
      <div>
        <Message />
        <Box sx={theme => ({paddingBottom: theme.spacing(2)})}>
          <Link href="category">
            <Button variant="contained" color="primary" startIcon={<Add />}>
              {t('Add new category')}
            </Button>
          </Link>

          <Button
            variant="contained"
            sx={theme => ({marginLeft: theme.spacing(2)})}
            aria-controls="action-menu"
            aria-haspopup="true"
            onClick={handleClick}
            startIcon={<MoreVertIcon />}>
            {t('Action')}
          </Button>
        </Box>
        <Menu
          items={[
            {
              label: t('Edit'),
              onClick: () => {
                if (selection.length === 1) {
                  let index = data.findIndex(it => it.cid === selection[0]);
                  if (index >= 0 && data[index]) {
                    router.push(`/admin/category/${data[index]._id}`);
                  }
                } else {
                  setError(true);
                  handleClose();
                }
                /*
                let newData: any = {};
                    updateCategoryMutation({
                      variables: {
                        id: newData.cid,
                        name: newData.name,
                        parent_id: newData.parent_id,
                        slug: newData.slug,
                        img: null,
                      },
                    })
                      .then(data => {
                        messageMutation({
                          variables: {
                            msg: 'Updated successfully',
                            type: 'success',
                          },
                        });
                      })
                      .catch(err => {
                        messageMutation({
                          variables: { msg: err.message, type: 'error' },
                        });
                      });
                  // */
              },
            },
            {
              label: t('Delete'),
              onClick: () => {
                if (selection.length === 1) {
                  let index = data.findIndex(it => it.cid === selection[0]);
                  if (index >= 0 && data[index]) {
                    deleteCategoryMutation({
                      variables: {id: selection[0]},
                    })
                      .then(data => {
                        messageMutation({
                          variables: {
                            msg: 'Deleted successfully',
                            type: 'success',
                          },
                        });
                        setSelection([]);
                        setError(false);
                        handleClose();
                      })
                      .catch(err => {
                        messageMutation({
                          variables: {msg: err.message, type: 'error'},
                        });
                      });
                    setData([...data].splice(index, 1));
                  }
                } else {
                  setError(true);
                }
              },
            },
          ]}
          id="action-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}></Menu>
        <Paper style=\{{position: 'relative'}}>
          {error && (
            <Text
              style=\{{paddingTop: '10px', paddingLeft: '10px'}}
              color="error">
              {t('Check only one checkbox at a time')}
            </Text>
          )}
          <Grid rows={data} columns={columns} getRowId={getRowId}>
            <SelectionState
              selection={selection}
              onSelectionChange={setSelection}
            />
            <TreeDataState
              expandedRowIds={expandedRowIds}
              onExpandedRowIdsChange={setExpandedRowIds}
            />
            <CustomTreeData getChildRows={getChildRows} />
            <VirtualTable
              columnExtensions={tableColumnExtensions}
              height="auto"
            />
            <TableHeaderRow />
            <TableTreeColumn for="name" showSelectionControls />
          </Grid>
          {loading && <Spinner />}
        </Paper>
      </div>
    );
  } else {
    return (
      <div>
        <Spinner overflowHide />
        {' ' + t('loading')}
      </div>
    );
  }
};

export default Category;
