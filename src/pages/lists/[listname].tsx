import React from 'react';
import styles from '../../theme/styles/styles.module.scss';
import { useTranslation } from 'react-i18next';
import { Table } from '@Components';
import App from '@App';
import { capitalizeFirstLetter } from 'nuudel-utils';
import { GetStaticProps, InferGetStaticPropsType, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';

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

function Lists(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const { listname } = router.query;
  const _dataGridProps: any = {
    listname: capitalizeFirstLetter(
      listname instanceof Array ? listname[0] : listname,
    ),
  };
  //const { t, i18n } = useTranslation();
  return (
    <div className={styles.listContainer}>
      {!listname ? (
        <></>
      ) : (
        <App
          component={Table}
          {..._dataGridProps}
          pathname={router.pathname}
          query={router.query}
        />
      )}
    </div>
  );
}

export default Lists;
