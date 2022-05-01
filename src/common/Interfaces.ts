export interface ICurrentUser {
  _id: string;
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  type: string;
  _verifiedEmail: string;
  //avatar: IImage;
  phone: string;
  mobile: string;
}

export interface IAppProps {
  query: any;
  pathname: any;
  user?: ICurrentUser;
  IsDlg?: boolean;
}

export interface IPartner {
  custom: boolean;
}
