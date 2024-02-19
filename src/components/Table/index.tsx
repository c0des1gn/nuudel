import React, {FC, useEffect, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';
import dynamic from 'next/dynamic';
import {IDataGridProps} from '../../forms/dataGrid/IDataGridProps';
import {t} from '@Translate';
import {capitalizeFirstLetter, dateToISOString} from 'nuudel-utils';
import {Spinner} from 'nuudel-core';
import {Box, FormControl} from '@mui/material';

const DynamicComponent: any = dynamic(
  () => import('../../forms/dataGrid/DataGrid'),
  {
    ssr: false,
    loading: () => <Spinner />,
  },
);

export const Table: FC<IDataGridProps> = ({...props}) => {
  const {user} = props;
  const query = useParams();
  let {listname} = query || {};
  listname = capitalizeFirstLetter(
    listname instanceof Array ? listname[0] : listname,
  );

  let hiddenColumns =
    listname === 'Test'
      ? [
          '_id',
          '_createdby',
          '_modifiedby',
          //'createdAt',
          'updatedAt',
        ]
      : [];

  const [filter, setFilter] = React.useState('');
  const [showDateFilter, setShowDateFilter] = React.useState(false);

  useEffect(() => {}, [user]);

  return (
    <div>
      {!!user && (
        <DynamicComponent
          {...props}
          IsColumnChooser={user?.type && user.type !== 'User'}
          showDateFilter={showDateFilter}
          hiddenColumns={hiddenColumns}
          filter={filter}
        />
      )}
    </div>
  );
};

export default Table;
