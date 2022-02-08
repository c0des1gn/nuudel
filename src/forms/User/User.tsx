import React, { FC } from 'react';
import { Table } from '@Components';
import { ICurrentUser } from 'nuudel-core';
//import { useRouter } from 'next/router';

interface IUserProps {
  error?: string;
  user?: ICurrentUser;
}

export const Users: FC<IUserProps> = (props: IUserProps) => {
  //const router = useRouter();
  const _dataGridProps: any = {
    ...props,
    listname: 'User',
  };
  return (
    <div>
      <Table
        {..._dataGridProps}
        //pathname={router.pathname}
        //query={router.query}
        basepath={'/admin/signup'}
        IsDlg={'0'}
      />
    </div>
  );
};

export default Users;
