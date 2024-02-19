import React from 'react';
import {Forms} from 'nuudel-core';
import App from '@App';
import {usePathname, useParams, useSearchParams} from 'next/navigation';
import {ControlMode, Permission, capitalizeFirstLetter} from 'nuudel-utils';

interface IProps {}

export function Form({...props}: IProps) {
  const pathname = usePathname(),
    param = useParams(),
    searchParams = useSearchParams();
  let query: any = {};
  searchParams.forEach((value: string, key: string) => {
    query[key] = value;
  });
  const {listname, id} = param || {};
  const {IsDlg} = query;
  const _Props: any = {
    ...props,
    IsDlg: IsDlg === '0' ? IsDlg : '1',
    formType: ControlMode.Display,
    permission: Permission.Read,
    id: id instanceof Array ? id[0] : id,
    listname: capitalizeFirstLetter(
      listname instanceof Array ? listname.join('') : listname,
    ),
  };
  return !listname ? (
    <></>
  ) : (
    <App component={Forms} {..._Props} pathname={pathname} query={query} />
  );
}

export default Form;
