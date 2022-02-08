import React from 'react';
import { Text, Container, Link, Image } from 'nuudel-core';
import { t } from '@Translate';
import { useStyles } from './Style';
import PersonIcon from '@material-ui/icons/Person';
import { UI } from 'nuudel-core';
import { USER_KEY, CONF } from '../../config';
import config from '../../common/config.json';

const _conf = !CONF?.site_title ? config : CONF;

interface ITrackingProps {
  tracking?: string;
}

export const HomePage = (props: ITrackingProps) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.image} />
        <Container maxWidth="md" className={classes.navbar}>
          <div className={classes.logo}>
            {_conf.logo && _conf.logo.uri ? (
              <Image src={_conf.logo.uri} width={50} height={50} />
            ) : (
              <Text variant="h3" color="inherit">
                {_conf.site_title}
              </Text>
            )}
          </div>
          <div className={classes.contact}>
            <PersonIcon className={classes.contactIcon} fontSize="small" />
            {!UI.getItem(USER_KEY) ? (
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
        <Container maxWidth="md" className={classes.trackingContainer}>
          <Text variant="h5" className={classes.trackingText}>
            {t('Enter tracking number')}
          </Text>
        </Container>
      </div>
    </div>
  );
};
