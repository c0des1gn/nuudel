import React, {FC} from 'react';
import {Table} from '@Components';
import {ICurrentUser} from 'nuudel-core';
//import {useParams, usePathname} from 'next/navigation';

interface IUserProps {
  error?: string;
  user?: ICurrentUser;
}

export const Users: FC<IUserProps> = (props: IUserProps) => {
  //const query = useParams(),pathname= usePathname();
  const _dataGridProps: any = {
    ...props,
    listname: 'User',
  };
  return (
    <div>
      <Table
        {..._dataGridProps}
        //pathname={pathname}
        //query={query}
        basepath={'/admin/signup'}
        IsDlg={'0'}
      />
    </div>
  );
};

export default Users;
