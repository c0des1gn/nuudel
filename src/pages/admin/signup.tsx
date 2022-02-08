import React from 'react';
import SignUp from '../../forms/Signup';
import { useRouter } from 'next/router';
import { PageProps } from '../_app';
import { ICurrentUser } from 'nuudel-core';
import { CONF } from '../../config';
import { isServer } from 'nuudel-utils';

interface IProps extends PageProps {
  error?: string;
  user?: ICurrentUser;
}

const Signup = (props: IProps): JSX.Element => {
  const router = useRouter();
  if (
    !CONF.active &&
    typeof props.user !== 'undefined' &&
    props.user.type !== 'Admin' &&
    !isServer
  ) {
    try {
      router.push('/admin/login');
    } catch {
      window.location.href = '/admin/login';
    }
  }
  return <SignUp user={props.user} allowSignup={CONF.active} />;
};

export default Signup;
