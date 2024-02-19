import React, {useState, useEffect} from 'react';
import {Text, ICurrentUser, useAuth, UI, Link, Image, Box} from 'nuudel-core';
import {Language} from 'nuudel-utils';
import {USER_LANG} from '../../config';
import {COLORS} from '../../theme/variables/palette';
import I8, {changeLanguage, defaultLocale} from '@Translate';
import {changeLanguageMutation} from './Query';
import {useMutation} from '@apollo/react-hooks';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {InputBase} from '@mui/material';
import {styled} from '@mui/material/styles';

const StyledInput = styled(InputBase)(({theme}) => ({
  backgroundColor: COLORS['background-light'],
  border: `1px solid ${COLORS['border-light']}`,
  height: '30px',

  boxSizing: 'content-box',
  '&:hover': {textDecoration: 'underline'},
  '& .MuiSelect-standard': {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: theme.spacing(2),
  },
  '& .MuiSvgIcon-root': {
    right: '5px',
    fontSize: '18px',
  },
}));

interface IProps {
  user?: ICurrentUser;
  imageLinkMn?: string;
  imageLinkEn?: string;
  saveChanges?: boolean;
  invert?: boolean;
  color?: string;
  className?: string;
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

  const handleChange = event => {
    clearTimeout(_debounce);
    let current: string = event.target.value;
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
  };

  let _debounce: any = undefined;
  useEffect(() => {
    return function cleanup() {
      clearTimeout(_debounce);
    };
  }, []);

  return (
    <div className={!props.className ? '' : props.className}>
      <Select
        value={locale}
        variant="standard"
        onChange={handleChange}
        input={<StyledInput />}>
        <MenuItem value={'en-US'}>
          <Box
            sx=\{{
              display: 'flex',
              height: '27px',
              justifyContent: 'center',
              alignItems: 'center',
              '& .FlagImage': {
                marginRight: '12px',
                display: 'flex',
              },
            }}>
            <Image
              src={imageLinkEn}
              width={27}
              height={16}
              className="FlagImage"
              alt="English language"
            />
            <Text variant="caption">English</Text>
          </Box>
        </MenuItem>
        <MenuItem value={'mn-MN'}>
          <Box
            sx=\{{
              display: 'flex',
              height: '27px',
              justifyContent: 'center',
              alignItems: 'center',
              '& .FlagImage': {
                marginRight: '12px',
                display: 'flex',
              },
            }}>
            <Image
              src={imageLinkMn}
              width={27}
              height={16}
              className="FlagImage"
              alt="Монгол хэл"
            />
            <Text variant="caption">Монгол</Text>
          </Box>
        </MenuItem>
      </Select>
    </div>
  );
};

export default LangSwitcher;
