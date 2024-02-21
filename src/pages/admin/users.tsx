import React from 'react';
import User from '../../forms/User/Users';
import {PageProps} from '../_app';
import {ICurrentUser} from '@Interfaces';

interface IProps extends PageProps {
  error?: string;
  user?: ICurrentUser;
}

const Users: React.FC<IProps> = (props: IProps) => {
  return <User {...props} />;
};

export default Users;
