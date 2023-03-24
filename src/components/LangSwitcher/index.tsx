import React, {useState, useEffect} from 'react';
import {Text, ICurrentUser, useAuth, UI, Link, Image} from 'nuudel-core';
import {Language} from 'nuudel-utils';
import {USER_LANG} from '../../config';
import {COLORS} from '../../theme/variables/palette';
import I8, {changeLanguage, defaultLocale} from '@Translate';
import {changeLanguageMutation} from './Query';
import {useMutation} from '@apollo/react-hooks';

interface IProps {
  user?: ICurrentUser;
  imageLinkMn?: string;
  imageLinkEn?: string;
  saveChanges?: boolean;
  invert?: boolean;
  color?: string;
}

const LangSwitcher: React.FC<IProps> = (props: IProps) => {
  const user = props.user || useAuth();
  const {
    imageLinkMn = '/svg/mongolian-flag.svg',
    imageLinkEn = '/svg/american-flag.svg',
    saveChanges = false,
    invert = true,
    color,
  } = props;
  const lang = user.settings?.locale;
  const [locale, setLocale] = useState(!lang ? defaultLocale : Language[lang]);

  const [changeLangMutation] = useMutation<any, any>(changeLanguageMutation, {
    onCompleted: data => {
      if (data?.changeLanguage) {
        changeLanguage(Language[data?.changeLanguage]);
      }
    },
    onError: err => {
      if (I8.language !== locale) {
        changeLanguage(locale);
      }
    },
    fetchPolicy: 'no-cache',
  });

  let _debounce: any = undefined;
  useEffect(() => {
    return function cleanup() {
      clearTimeout(_debounce);
    };
  }, []);

  const isSwither = !invert ? 'mn-MN' !== locale : 'mn-MN' === locale;

  return (
    <div>
      <Link
        onClick={() => {
          clearTimeout(_debounce);
          let current: string = locale === 'mn-MN' ? 'en-US' : 'mn-MN';
          UI.setItem(USER_LANG, current);
          setLocale(current);
          _debounce = setTimeout(() => {
            if (I8.language !== current) {
              if (saveChanges && !!lang) {
                changeLangMutation({
                  variables: {
                    locale: current === 'en-US' ? 'English' : 'Mongolian',
                  },
                });
              } else {
                changeLanguage(current);
              }
            }
          }, 1000);
        }}
        style={{
          display: 'flex',
          flexDirection: 'row',
          cursor: 'pointer',
          textDecoration: 'none',
        }}>
        <div
          style={{marginRight: '8px', marginTop: '2px', marginBottom: '2px'}}>
          <Image
            src={isSwither ? imageLinkEn : imageLinkMn}
            width={25}
            height={15}
          />
        </div>
        <Text
          style={{
            fontSize: '12px',
            lineHeight: '20px',
            color: color || COLORS['text-dark'],
          }}>
          {isSwither ? 'English' : 'Монгол'}
        </Text>
      </Link>
    </div>
  );
};

export default LangSwitcher;
