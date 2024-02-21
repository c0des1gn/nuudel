import React, {Fragment} from 'react';
import {useMutation, useApolloClient, useQuery} from '@apollo/react-hooks';
import {
  Avatar,
  Box,
  Menu,
  Button,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import {Text} from 'nuudel-core';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import {t} from '@Translate';
import {currentUserQuery} from '../../../graphql/queries/index';
import {logoutMutation} from '../../../graphql/mutations';
import {signOut, UI} from 'nuudel-core';
import {useRouter} from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import {tokenObj, USER_LANG, USER_TOKEN} from 'nuudel-utils';
import styles from './styles.module.scss';

export default function HeaderUserbox() {
  const client = useApolloClient();
  const router = useRouter();
  const [logout, {loading: logoutLoading}] = useMutation<any>(logoutMutation, {
    onCompleted: () => {
      try {
        client.cache.reset();
        //client.resetStore(); //To reset the cache without refetching active queries, use client.clearStore() instead of
      } catch {}
      client.clearStore();
      signOut(router); // redirect user to login page
    },
  });
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const {data, error, loading} = useQuery(currentUserQuery);
  if (loading || logoutLoading || error || !data) {
    if (error?.message?.includes('not logged')) {
      const token = UI.getItem(USER_TOKEN);
      if (token) {
        const obj = tokenObj(token);
        if (obj?._id && obj.exp < Math.ceil(Date.now() / 1000)) {
          router.replace(`/admin/login`, {scroll: true});
        }
      }
    }
    return <></>;
  }

  const {currentUser} = data;

  return (
    <Fragment>
      <Button
        color="inherit"
        onClick={handleClick}
        className={styles.sectionDesktop}>
        <ListItem alignItems="flex-start" style=\{{padding: '0 10px'}}>
          <ListItemAvatar>
            <Avatar
              alt={currentUser?.firstname || currentUser?.username}
              src={currentUser?.avatar && currentUser?.avatar.uri}
            />
          </ListItemAvatar>
          <ListItemText
            style=\{{textTransform: 'capitalize'}}
            primary={currentUser?.firstname}
            secondary={
              <Text
                component="span"
                variant="body2"
                className={`${styles.inline} ${styles.userRole}`}>
                {t(currentUser?.type) || ''}
              </Text>
            }
          />
        </ListItem>
        <span className="pl-1 pl-xl-3">
          <i className="icon-download-arrow-1" style=\{{fontSize: '20px'}} />
        </span>
      </Button>
      <div className={styles.sectionMobile}>
        <IconButton
          aria-label="show more"
          aria-haspopup="true"
          onClick={handleClick}
          color="inherit">
          <i
            className="icon-options"
            style=\{{lineHeight: 1, transform: 'rotate(90deg)'}}
          />
        </IconButton>
      </div>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        //getContentAnchorEl={null}
        open={Boolean(anchorEl)}
        anchorOrigin=\{{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin=\{{
          vertical: 'center',
          horizontal: 'center',
        }}
        onClose={handleClose}>
        <div className={styles.px2}>
          <List>
            <Box color="text.primary" className={styles.textCenter}>
              <Avatar
                sizes="44"
                alt={currentUser?.firstname || currentUser?.username}
                src={currentUser?.avatar && currentUser?.avatar.uri}
                style=\{{margin: '0 auto'}}
              />
            </Box>
            <div className="pl-3  pr-3">
              <div
                className={`${styles.w500} ${styles.pt2} ${styles.textCenter} ${styles.lineHeight1}`}>
                {currentUser?.username}
              </div>
              <div className={styles.textCenter}>
                {t(currentUser?.type) || ''}
              </div>
            </div>
            <Divider className={`${styles.mt2} ${styles.w100}`} />

            <ListItem component="a" href="/admin/reset-password?code=reset">
              {t('Change password')}
            </ListItem>

            <Divider className="w-100" />

            <ListItem component="a" href="/admin/profile">
              {t('Profile')}
            </ListItem>

            <Divider className="w-100" />
            <ListItem className="">
              <Button
                onClick={() => {
                  handleClose();
                  logout();
                }}
                fullWidth={true}
                startIcon={
                  <i className="icon-exit" style=\{{fontSize: '12px'}} />
                }
                color="secondary">
                {t('Logout')}
              </Button>
            </ListItem>
          </List>
        </div>
      </Menu>
    </Fragment>
  );
}
