import React from 'react';
import {Text, Container, Link, Image} from 'nuudel-core';
import {t} from '@Translate';
import styles from './styles.module.scss';
import PersonIcon from '@mui/icons-material/Person';
import {UI} from 'nuudel-core';
import {CONF, USER_TOKEN} from '../../config';
import config from '../../common/config.json';

const _conf = !CONF?.site_title ? config : CONF;

interface ITrackingProps {
  tracking?: string;
}

export const HomePage = (props: ITrackingProps) => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.image} />
        <Container
          maxWidth="md"
          sx={theme => ({
            padding: theme.spacing(3),
            zIndex: 2,
            color: '#fff',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          })}>
          <div className={styles.logo}>
            {_conf.logo && _conf.logo.uri ? (
              <Image src={_conf.logo.uri} width={50} height={50} />
            ) : (
              <Text variant="h3" color="inherit">
                {_conf.site_title}
              </Text>
            )}
          </div>
          <div className={styles.contact}>
            <PersonIcon className={styles.contact} fontSize="small" />
            {!UI.getItem(USER_TOKEN) ? (
              <span>
                <Link href="/admin/login">{t('Login')}</Link>
              </span>
            ) : (
              <span>
                <Link href="/admin">{t('Admin')}</Link>
              </span>
            )}
          </div>
        </Container>
        <Container
          maxWidth="md"
          sx={theme => ({
            padding: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            zIndex: 2,
            [theme.breakpoints.up('sm')]: {
              marginTop: '16rem',
            },
            [theme.breakpoints.down('xs')]: {
              marginTop: '7rem',
            },
          })}>
          <Text variant="h5" color="#fff">
            {t('Enter tracking number')}
          </Text>
        </Container>
      </div>
    </div>
  );
};
