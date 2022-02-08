import React from 'react';
import { useTranslation } from 'react-i18next';
import { Forms } from 'nuudel-core';
import App from '@App';
import { capitalizeFirstLetter } from 'nuudel-utils';
import { GetStaticProps, InferGetStaticPropsType, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { ControlMode, Permission } from 'nuudel-utils';

export const getStaticProps = async () => {
  return {
    props: {},
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

function Form(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const { listname, IsDlg } = router.query;
  const _Props: any = {
    IsDlg: IsDlg === '0' ? IsDlg : '1',
    formType: ControlMode.New,
    permission: Permission.Add,
    id: undefined,
    listname: capitalizeFirstLetter(
      listname instanceof Array ? listname[0] : listname,
    ),
  };
  //const { t, i18n } = useTranslation();
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
