import React, { useEffect, useRef, useState } from 'react';
import { PageProps } from '../_app';
import { useRouter } from 'next/router';
import { H1, Button, Text, Spinner, Grid, Link, Image } from 'nuudel-core';
import { Container, Paper, Box } from '@material-ui/core';
import SignInForm from '../../forms/SignIn';
import { USER_KEY, USER_TOKEN, USER_ID, USER_LANG } from '../../config';
import { UI, DeviceId } from 'nuudel-core';
import { Language } from 'nuudel-utils';
import { ISignInFormValues } from '../../forms/SignIn/types';
import gql from 'graphql-tag';
import { useApolloClient } from '@apollo/react-hooks';
import { store } from 'nuudel-core';
import { sign_in } from 'nuudel-core';
import I8, { t, changeLanguage } from '@Translate';
import styles from '../../forms/SignIn/styles.module.scss';
import { Copyright } from 'nuudel-core';
import { Message, TOGGLE_SNACKBAR_MUTATION } from 'nuudel-core';
import { useMutation } from '@apollo/react-hooks';
import { CONF } from '../../config';

export const SIGN_IN_SCREEN = {
  id: 'SignIn',
  name: 'app.SignIn',
  title: '',
};

interface AuthData {
  auth: string;
}

interface AuthError {
  message: string;
}

interface AuthVars {
  email: string;
  password: string;
}

interface OAuthVars {
  provider: string;
  accessToken: string;
}

const AUTH_USER = gql`
  query Auth($email: String!, $password: String!) {
    auth(email: $email, password: $password) {
      _id
      token
      currency
      locale
      type
      status
      refreshToken
    }
  }
`;

const OAUTH_USER = gql`
  query Oauth($provider: String!, $accessToken: String!) {
    oauth(provider: $provider, accessToken: $accessToken) {
      _id
      token
      currency
      locale
      type
      status
      refreshToken
    }
  }
`;

interface IProps extends PageProps {
  autologin: boolean;
  showGuestBtn: boolean;
  isModal: boolean;
  componentId: string;
  username?: string;
  error?: string;
}

const SignInScreen = (props: IProps): JSX.Element => {
  const { autologin = false, showGuestBtn = false, isModal = false } = props;
  const router = useRouter();
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);

  const [messageMutation] = useMutation(TOGGLE_SNACKBAR_MUTATION);

  const guest_login = () => {
    handleOAuth('guest', DeviceId.uniqueId + '|' + DeviceId.device);
  };
  let _debounce: any = undefined;
  useEffect(() => {
    if (autologin && !props.isModal) {
      // no need auto login
      //guest_login();
    }
    //function cleanup()
    return () => {
      clearTimeout(_debounce);
      // Make sure to unregister the listener during cleanup
    };
  }, [props]);

  const handleSubmit = async (
    { email, password }: ISignInFormValues,
    reset: Function,
  ) => {
    setLoading(true);
    let res: any = undefined;
    try {
      // get auth server response
      res = await client.query<AuthData, AuthVars>({
        query: AUTH_USER,
        variables: {
          email: `${email}`,
          password: `${password}`,
        },
      });
    } catch {}

    if (!res || res.errors || !res.data) {
      setLoading(false);
      reset();
      showToast(t('EmailPasswordIsWrong'));
      return;
    }
    loginSuccess(email, res);
  };

  const handleOAuth = async (provider, accessToken) => {
    setLoading(true);
    // get auth server response
    const res = await client.query<AuthData, OAuthVars>({
      query: OAUTH_USER,
      variables: {
        provider: `${provider}`,
        accessToken: `${accessToken}`,
      },
    });

    if (!res || res.errors || !res.data) {
      setLoading(false);
      showToast(t('OAuthIsFailed'));
      return;
    }
    if (provider === 'guest') {
      res.data['oauth']._id = '';
    }
    loginSuccess(null, res);
  };

  const loginSuccess = async (key: string | null, res) => {
    const auth = !res.data.auth ? res.data.oauth : res.data.auth;
    if (key) {
      UI.setItem(USER_KEY, key);
    }
    UI.setItem(USER_ID, auth['_id']);
    UI.setItem(USER_TOKEN, auth['token']);

    // set Language by user's option
    const locale = !auth['locale'] ? 'mn-MN' : Language[auth['locale']];
    UI.setItem(USER_LANG, locale);

    store.dispatch(
      sign_in({
        userId: auth['_id'],
        currency: auth['currency'],
        locale: Language[auth['locale']],
        token: auth['token'],
        type: auth['type'],
        status: auth['status'],
      }),
    );

    if (I8.language !== locale) {
      changeLanguage(locale);
    } else {
      setLoading(false);
    }
    _debounce = setTimeout(
      () => router.push('/admin?success=1', undefined, { shallow: false }),
      50,
    );
  };

  const showToast = text => {
    messageMutation({
      variables: { msg: text, type: 'error' },
    });
  };

  const render = (
    <div
      style={{
        minHeight: '90vh',
        margin: 0,
        padding: 0,
      }}
    >
      <Container maxWidth="sm">
        <Message />
        <Paper elevation={3} className={styles.paperStyle}>
          {loading && <Spinner />}
          <Grid container direction="column">
            {CONF.logo && CONF.logo.uri ? (
              <Image
                className={styles.logo}
                src={CONF.logo.uri}
                //width={100}
                height={100}
              />
            ) : (
              <h2 className={styles.title}>{t('SignIn')}</h2>
            )}
            <SignInForm onSubmit={handleSubmit} username={props.username} />
            <div className={styles.linkCont}>
              {CONF.active && (
                <Link
                  noLinkStyle
                  href="/admin/signup"
                  className={styles.link + ' ' + styles.marginLeft}
                >
                  {t('CreateAnAccount')}
                </Link>
              )}
              <Link
                noLinkStyle
                href="/admin/reset-password"
                className={styles.link + ' ' + styles.marginLeft}
              >
                {t('Forgotpassword?')}
              </Link>
              {showGuestBtn && (
                <>
                  <Text> | </Text>
                  <button
                    onClick={() => {
                      if (!loading) guest_login();
                    }}
                    className={styles.link}
                  >
                    {t('LoginAsGuest')}
                  </button>
                </>
              )}
            </div>
          </Grid>
        </Paper>
        <Box mt={10}>
          <Copyright />
        </Box>
      </Container>
    </div>
  );

  return isModal ? render : <div className={styles.root}>{render}</div>;
};

export default SignInScreen;
