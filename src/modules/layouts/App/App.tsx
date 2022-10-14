import React, { FC } from 'react';
import { useRouter } from 'next/router';
import { NextComponentType, NextPageContext } from 'next';
import { useQuery } from '@apollo/react-hooks';
import { PageProps } from '../../../pages/_app';
import Layout from '../Layout/Layout';
//import {Spinner} from 'nuudel-core';
import { currentUserQuery } from '../../../graphql/queries';
import { withApollo } from 'nuudel-core';
import { isServer } from 'nuudel-utils';
import { USER_ID } from '../../../config';
import { UI } from 'nuudel-core';
import LoginLayout from '../LoginLayout/LoginLayout';
import { CONF } from '../../../config';

type Props = {
  component: NextComponentType<any, any, any> | FC<any>;
  query: PageProps['query'];
  pathname: PageProps['pathname'];
  req?: NextPageContext['req'];
  IsDlg?: string;
};

export type ComponentPageProps = Pick<Props, 'pathname' | 'query'> & {
  user: any['me'];
};

let unauthenticatedPathnames = ['/admin/login', '/admin/reset-password'];

if (CONF.active) {
  unauthenticatedPathnames.push('/admin/signup');
}

const App = ({
  component: Component,
  query,
  pathname,
  ...props
}: Props): JSX.Element | null => {
  const router = useRouter();
  const { IsDlg = props.IsDlg, success } = router.query;
  let userId: string = UI.getItem(USER_ID);
  // redirect
  if (!userId && !unauthenticatedPathnames.includes(pathname) && !isServer) {
    try {
      router.push('/admin/login');
    } catch {
      window.location.href = '/admin/login';
    }
  }

  const { data } = useQuery(currentUserQuery, {
    skip: unauthenticatedPathnames.includes(pathname) || isServer || !userId,
  });

  const isAnUnauthenticatedPage =
    pathname !== undefined && unauthenticatedPathnames.includes(pathname);

  /* // HOOK aldaa garaad bsn
  // Need to wrap calls of `Router.replace` in a use effect to prevent it being called on the server side
  // https://github.com/zeit/next.js/issues/6713
  useEffect(() => {
    // Redirect the user to the login page if not authenticated
    if (!isServer && !isAnUnauthenticatedPage && (!data || !data.currentUser)) {
      router.push('/admin/login');
    }
  }, [data, isAnUnauthenticatedPage, pathname]); // */

  //if (loading && !isServer) {
  //  return <Spinner color="primary" size={20} />;
  //}

  if (
    !isAnUnauthenticatedPage &&
    (!data?.currentUser || userId !== data?.currentUser?._id)
  ) {
    return null;
  }

  return isAnUnauthenticatedPage ? (
    <LoginLayout>
      <Component query={query} pathname={pathname} {...props} />
    </LoginLayout>
  ) : '1' === IsDlg ? (
    <Component
      query={query}
      IsDlg
      pathname={pathname}
      user={data?.currentUser}
      {...props}
    />
  ) : (
    <Layout user={data?.currentUser}>
      <Component
        query={query}
        pathname={pathname}
        user={data?.currentUser}
        {...props}
      />
    </Layout>
  );
};

export default withApollo(App);
