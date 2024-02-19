import React from 'react';
import {Forms} from 'nuudel-core';
import App from '@App';
import {capitalizeFirstLetter} from 'nuudel-utils';
import {GetStaticProps, InferGetStaticPropsType, GetStaticPaths} from 'next';
import {usePathname, useParams, useSearchParams} from 'next/navigation';
import {ControlMode, Permission} from 'nuudel-utils';

interface IProps {}

function Form({...props}: IProps) {
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
    IsDlg: IsDlg === '0' ? IsDlg : '1',
    formType: ControlMode.Display,
    permission: Permission.Read,
    id: id instanceof Array ? id[0] : id,
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
