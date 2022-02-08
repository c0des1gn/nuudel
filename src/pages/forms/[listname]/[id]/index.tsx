import React from 'react';
import { withApollo } from 'nuudel-core';
import { useTranslation } from 'react-i18next';
import { Forms } from 'nuudel-core';
import App from '@App';
import { capitalizeFirstLetter } from 'nuudel-utils';
import { GetStaticProps, InferGetStaticPropsType, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { ControlMode, Permission } from 'nuudel-utils';

export const getStaticProps = async () => {
  return {
    props: { formType: ControlMode.Edit, permission: Permission.Edit },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export function Form(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const { listname, id, IsDlg } = router.query;
  const _Props: any = {
    IsDlg: IsDlg === '0' ? IsDlg : '1',
    formType: props.formType,
    permission: props.permission,
    id: id instanceof Array ? id[0] : id,
    listname: capitalizeFirstLetter(
      listname instanceof Array ? listname[0] : listname,
    ),
  };
  const { t, i18n } = useTranslation();
  return !listname ? (
    <></>
  ) : (
    <App
      component={Forms}
      {..._Props}
      pathname={router.pathname}
      query={router.query}
    />
  );
}

export default Form;
