import config from './common/config.json';

import {
  USER_TOKEN,
  USER_LANG,
  INIT_DATE,
  INIT_DATA,
  NOTI_TOKEN,
  CONF,
  setConf,
  setHost,
  HOST,
  URL,
} from 'nuudel-utils';

export {
  USER_TOKEN,
  USER_LANG,
  INIT_DATE,
  INIT_DATA,
  NOTI_TOKEN,
  CONF,
  setConf,
  setHost,
  HOST,
  URL,
};

if (!CONF || CONF.minVersion === '1.0.0') {
  setConf(config);
}

export const GUEST_USER_ID = '1234567890abcd0987654321';
export const DARKMODE = 'darkMode';
export const NOTI_COUNT = 'noti_count';
