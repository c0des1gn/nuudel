import I8 from 'i18next';
//import memoize from 'lodash.memoize';

const translationGetters = {
  // lazy requires (metro bundler does not support symlinks)
  en: () => require('./en.json'),
  mn: () => require('./mn.json'),
};
const defaultLocale = 'mn-MN';

const translate = (key: string, options?) => I8.t(key, options); //memoize((key, config) => I8.t(key, config), (key, config) => (config ? key + JSON.stringify(config) : key));

if (!I8.isInitialized) {
  I8.init({
    lng: defaultLocale,
    fallbackLng: 'en-US',
    ns: ['trans'],
    defaultNS: 'trans',
    resources: {
      ['mn-MN']: { trans: translationGetters['mn']() },
      ['en-US']: { trans: translationGetters['en']() },
    },
    keySeparator: false,
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
    },
    parseMissingKeyHandler: function(key) {
      return !key || typeof key !== 'string' ? '' : key.split('.').pop() + '!';
    },
  });
}

export { translate as t, defaultLocale };
export default I8;
