import React, { FC, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { IDataGridProps } from '../../forms/dataGrid/IDataGridProps';
import { t } from '@Translate';
import { capitalizeFirstLetter, dateToISOString } from 'nuudel-utils';

const DynamicComponent = dynamic(
  () => import('../../forms/dataGrid/DataGrid'),
  {
    ssr: false,
  },
);

export const Table: FC<IDataGridProps> = ({ ...props }) => {
  const { user } = props;
  const router = useRouter();
  let { listname, tab = '0' } = router.query;
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
          showDateFilter={showDateFilter}
          hiddenColumns={hiddenColumns}
          filter={filter}
        />
      )}
    </div>
  );
};

export default Table;
