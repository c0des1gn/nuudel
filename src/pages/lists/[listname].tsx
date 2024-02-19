import React from 'react';
import styles from '../../theme/styles/styles.module.scss';
import {Table} from '@Components';
import App from '@App';
import {capitalizeFirstLetter, stringify_params} from 'nuudel-utils';
import {useParams, usePathname, useSearchParams} from 'next/navigation';

interface IProps {}

function Lists({...props}: IProps) {
  const query = useParams(),
    pathname = usePathname(),
    searchParams = useSearchParams();

  let param: any = {};
  searchParams.forEach((value: string, key: string) => {
    param[key] = value;
  });

  const {listname} = query || {};
  const _dataGridProps: any = {
    listname: capitalizeFirstLetter(
      listname instanceof Array ? listname[0] : listname,
    ),
  };
  return (
    <div className={styles.listContainer}>
      {!listname ? (
        <></>
      ) : (
        <App
          component={Table}
          {..._dataGridProps}
          pathname={pathname + stringify_params(param, '?')}
          query={query}
        />
      )}
    </div>
  );
}

export default Lists;
