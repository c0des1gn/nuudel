import React from 'react';
import {Forms} from 'nuudel-core';
import App from '@App';
import {usePathname, useParams, useSearchParams} from 'next/navigation';
import {ControlMode, Permission, capitalizeFirstLetter} from 'nuudel-utils';

interface IProps {}

function Form({...props}: IProps) {
  const pathname = usePathname(),
    param = useParams(),
    searchParams = useSearchParams();
  let query: any = {};
  searchParams.forEach((value: string, key: string) => {
    query[key] = value;
  });
  const {listname} = param || {};
  const {IsDlg} = query;
  const _Props: any = {
    IsDlg: IsDlg === '0' ? IsDlg : '1',
    formType: ControlMode.New,
    permission: Permission.Add,
    id: undefined,
    listname: capitalizeFirstLetter(
      listname instanceof Array ? listname[0] : listname,
    ),
  };
  return !listname ? (
    <></>
  ) : (
    <App component={Forms} {..._Props} pathname={pathname} query={query} />
  );
}

export default Form;
