import I8, {ReactOptions} from 'i18next';
import {initReactI18next} from 'react-i18next';
import {USER_LANG} from '../config';
import {UI} from 'nuudel-core';
import memoize from 'lodash.memoize';
import Router from 'next/router';
import {isServer} from 'nuudel-utils';

const translationGetters = {
  // lazy requires (metro bundler does not support symlinks)
  'en-US': () => require('../loc/en-US.json'),
  'mn-MN': () => require('../loc/mn-MN.json'),
};
const defaultLocale = UI.getItem(USER_LANG) || 'mn-MN';

const translate = memoize(
  (key, config) => I8.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key),
);

const changeLanguage = (
  languageTag: string = defaultLocale,
  refresh: boolean = true,
) => {
  // clear translation cache
  translate.cache.clear();
  UI.setItem(USER_LANG, languageTag);
  I8.changeLanguage(languageTag).then(t => {
    if (refresh && !isServer) {
      try {
        Router.reload();
      } catch {}
    }
  });
};

if (!I8.isInitialized) {
  I8.use(initReactI18next).init({
    lng: defaultLocale,
    //debug: true,
    keySeparator: '.',
    fallbackLng: 'mn-MN',
    ns: ['translations'],
    defaultNS: 'translations',
    resources: {
      ['mn-MN']: {translations: translationGetters['mn-MN']()},
      ['en-US']: {translations: translationGetters['en-US']()},
    },
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
    },
    //updateMissing: false,
    //missingKeyNoValueFallbackToKey: true,
    parseMissingKeyHandler: function (key) {
      return !key || typeof key !== 'string'
        ? ''
        : key.split('.').pop() +
            ((process?.env?.NODE_ENV || process?.env?.ENV) === 'development'
              ? '!'
              : '');
    },
    react: {
      wait: true,
    },
  });
}

export {translate as t, defaultLocale, changeLanguage};
export default I8;
