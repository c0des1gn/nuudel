import React, {useEffect, useRef, useState} from 'react';
import {PageProps} from '../_app';
import {useRouter, useSearchParams} from 'next/navigation';
import {Text, Spinner, Link, Image, Grid, Button, Divider} from 'nuudel-core';
import {Container, Paper} from '@mui/material';
import SignInForm from '../../forms/SignIn';
import {USER_TOKEN, USER_LANG} from '../../config';
import {UI, DeviceId} from 'nuudel-core';
import {Language} from 'nuudel-utils';
import {ISignInFormValues} from '../../forms/SignIn/types';
import gql from 'graphql-tag';
import {store} from 'nuudel-core';
import {sign_in} from 'nuudel-core';
import I8, {t, changeLanguage} from '@Translate';
import styles from '../../forms/SignIn/styles.module.scss';
import {Copyright} from 'nuudel-core';
import {Message, TOGGLE_SNACKBAR_MUTATION} from 'nuudel-core';
import {useMutation, useApolloClient} from '@apollo/react-hooks';
import {CONF} from '../../config';

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
  const {autologin = false, showGuestBtn = false, isModal = false} = props;
  const router = useRouter(),
    searchParams = useSearchParams();
  let query: any = {};
  searchParams.forEach((value: string, key: string) => {
    query[key] = value;
  });

  const client = useApolloClient();
  const [loading, setLoading] = useState(false);

  const [messageMutation] = useMutation(TOGGLE_SNACKBAR_MUTATION);

  const guest_login = () => {
    handleOAuth('guest', DeviceId.uniqueId + '|' + DeviceId.device);
  };
  var _debounce: any = undefined;
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

  const fb_login = (res: any) => {
    if (res?.status === 'connected' && res?.authResponse) {
      handleOAuth(
        'facebook',
        !res.authResponse?.accessToken ? '' : res.authResponse.accessToken,
      );
    } else if (res?.accessToken) {
      handleOAuth('facebook', res.accessToken);
    }
  };

  const errorGoogle = (err: any) => {
    setLoading(false);
    if (err?.error !== 'idpiframe_initialization_failed') {
      showToast(t('OAuthIsFailed'));
    }
  };

  const handleSubmit = async (
    {email, password}: ISignInFormValues,
    reset: Function,
  ) => {
    setLoading(true);
    let res: any = undefined,
      errorText: string = 'EmailPasswordIsWrong';
    try {
      // get auth server response
      res = await client.query<AuthData, AuthVars>({
        query: AUTH_USER,
        variables: {
          email: `${email}`,
          password: `${password}`,
        },
      });
    } catch (ex) {
      if (ex.graphQLErrors?.length === 0 && !!ex.networkError) {
        errorText = 'NoConnection';
      } else if (
        ex.graphQLErrors?.length > 0 &&
        ex.graphQLErrors[0]?.message !== 'Email and Password mismatch'
      ) {
        errorText = ex.graphQLErrors[0]?.message;
      }
    }

    if (!res || res.errors || !res.data) {
      setLoading(false);
      reset();
      showToast(t(errorText));
      return;
    }
    loginSuccess(email, res);
  };

  const handleOAuth = async (provider, accessToken) => {
    setLoading(true);

    let res: any = undefined;
    // get auth server response
    try {
      res = await client.query<AuthData, OAuthVars>({
        query: OAUTH_USER,
        variables: {
          provider: `${provider}`,
          accessToken: `${accessToken}`,
        },
      });
    } catch {}

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

    UI.setItem(USER_TOKEN, auth['token']);

    // set Language by user's option
    const locale = !auth['locale'] ? 'mn-MN' : Language[auth['locale']];
    UI.setItem(USER_LANG, locale);

    store.dispatch(
      sign_in({
        userId: auth['_id'],
        currency: auth['currency'],
        locale: locale,
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
    _debounce = setTimeout(() => {
      let link: string = '';
      let referringURL: string =
        (query?.referrer instanceof Array
          ? query.referrer.length > 0
            ? query['referrer'][0]
            : ''
          : query['referrer']) || document?.referrer;
      if (referringURL) {
        referringURL = decodeURI(referringURL);
        const url = window?.location?.origin;
        if (
          referringURL.startsWith(url) &&
          !referringURL.startsWith(url + window.location?.pathname)
        ) {
          link = referringURL;
        }
      }
      router.push(
        !link && ['Admin', 'Manager'].includes(auth['type'])
          ? '/admin?success=1'
          : link || '/',
        {scroll: !!link},
      );
    }, 50);
  };

  const showToast = (text: string) => {
    messageMutation({
      variables: {msg: text, type: 'error'},
    });
  };

  const render = (
    <div
      style=\{{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
      <Container maxWidth="xs">
        <Message />
        {/* <Paper elevation={3} className={styles.paperStyle}> */}
        {loading && <Spinner />}
        <div className={styles.paperStyle + ' ' + styles.border}>
          {!!CONF.logo?.uri ? (
            <Image className={styles.logo} src={CONF.logo.uri} alt="logo" />
          ) : (
            <Text variant="h5" align="center" style=\{{fontWeight: 500}}>
              {t('SignIn')}
            </Text>
          )}
          <SignInForm onSubmit={handleSubmit} username={props.username} />
          <div className={styles.marginTop}>
            <Divider />
          </div>
          <div className={styles.linkCont + ' ' + styles.text}>
            <Link
              href="/"
              className={styles.link}
              style=\{{float: 'left', textAlign: 'left'}}>
              {'⬅ ' + t('Home')}
            </Link>
            {CONF.active && (
              <Link
                noLinkStyle
                href="/admin/signup"
                className={styles.link + ' ' + styles.marginLeft}>
                {t('CreateAnAccount')}
              </Link>
            )}
            <Link
              noLinkStyle
              href="/admin/reset-password"
              className={styles.link + ' ' + styles.marginLeft}>
              {t('Forgotpassword?')}
            </Link>
            {showGuestBtn && (
              <>
                <Text> | </Text>
                <button
                  type="button"
                  onClick={() => {
                    if (!loading) guest_login();
                  }}
                  className={styles.link}>
                  {t('LoginAsGuest')}
                </button>
              </>
            )}
          </div>
        </div>
        {/* </Paper> */}
      </Container>
      <div style=\{{marginTop: '80px'}}>
        <Copyright />
      </div>
    </div>
  );

  return isModal ? render : <div className={styles.root}>{render}</div>;
};

export default SignInScreen;
