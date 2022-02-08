import React from 'react';
import { NextPageContext } from 'next';
import App from '../modules/layouts/App/App';
import i18n from '@Translate';
import Head from 'next/head';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { CONF } from '../config';
import { UI } from 'nuudel-core';
import { isServer } from 'nuudel-utils';
import useDarkMode from 'use-dark-mode';
import { withRouter } from 'next/router';
import { setTheme } from '@Variables';
import { thememode } from '../theme';
import { COLORS } from '@Variables';
//import ErrorBoundary from '../modules/layouts/ErrorBoundary';
//import withRedux from "next-redux-wrapper";
//import { store } from "../hocs/withRedux";

// @ts-ignore
import '../theme/global.scss';
import '../../public/fontello/css/ecommerce.css';

const { NEXT_PUBLIC_GOOGLE_ANALYTICS_ID } = process?.env;

export type PageProps = {
  query?: { code?: string; emailToken?: string };
  pathname?: string;
  req?: NextPageContext['req'];
};

const MyApp: React.FC = ({ Component, pageProps, router }: any) => {
  // i opt out of localStorage and the built in onChange handler because I want all theming to be based on the user's OS preferences
  const darkMode = useDarkMode(false, {
    storageKey: 'darkMode',
    onChange: null,
  });

  if (!isServer) {
    UI.setItem('DARKMODE', 'light');
    let mode: boolean = UI.getItem('DARKMODE') === 'dark';
    try {
      if (mode && !darkMode.value) {
        darkMode.enable();
      } else if (!mode && darkMode.value) {
        darkMode.disable();
      }
    } catch (e) {
      //console.log(e);
    }
  }

  const theme = React.useMemo(() => thememode(darkMode?.value), [
    darkMode.value,
  ]);

  pageProps.pathname = router?.pathname;
  pageProps.query = router?.query;

  const setColors = () => {
    const colors = setTheme(darkMode?.value);
    Object.keys(colors).forEach(key => {
      const cssKey = `--${key}`;
      const cssValue = colors[key];
      document.body.style.setProperty(cssKey, cssValue);
    });
  };

  React.useEffect(() => {
    if (!isServer) {
      setColors();
    }
    // Remove the server-side injected CSS.
    //const jssStyles = document.querySelector('#jss-server-side');
    //if (jssStyles) {
    //  jssStyles.parentElement.removeChild(jssStyles);
    //}
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <Head>
          <title>{CONF.site_title}</title>
          {/* PWA primary color */}
          <meta name="theme-color" content={COLORS.primary} />
          <meta name="description" content={CONF.site_description} />
          <meta name="keywords" content={CONF.site_keywords.join(' ')} />
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
          {NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
            ></script>
          )}
          {NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('globals', '${NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
            `,
              }}
            ></script>
          )}
        </Head>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {router.pathname && router.pathname.startsWith('/admin') ? (
          <App component={Component} {...pageProps} />
        ) : (
          <Component {...pageProps}></Component>
        )}
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default withRouter(MyApp);
//export default withRedux(store)(withRouter(MyApp));
