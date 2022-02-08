import { ControlMode, Permission } from 'nuudel-utils';
import { ICurrentUser } from 'nuudel-core';
//import { PageProps } from '../_app';

export interface IParentProps {
  id?: string;
  formType: ControlMode;
  onClose?();
  onSubmit?(data: any);
  permission?: Permission;
  //query?: PageProps['query'];
  //pathname?: PageProps['pathname'];
  user?: ICurrentUser;
  IsDlg?: boolean;
}
