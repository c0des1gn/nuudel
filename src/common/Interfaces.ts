import { IPermission, IImage } from 'nuudel-core';
import { Currency, Language } from 'nuudel-utils';

export interface ISettings {
  notification: boolean;
  currency: Currency;
  locale: Language;
  _devices?: string[];
}

export interface ICurrentUser {
  _id: string;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  type: string;
  _verifiedEmail: string;
  avatar: IImage;
  permission: IPermission[];
  phone: string;
  mobile: string;
  settings?: ISettings;
}

export interface IAppProps {
  query: any;
  pathname: any;
  user?: ICurrentUser;
  IsDlg?: boolean;
}
