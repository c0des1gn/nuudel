import React, { Fragment } from 'react';
import { useMutation, useApolloClient, useQuery } from '@apollo/react-hooks';
import {
  Avatar,
  Box,
  Menu,
  Button,
  List,
  ListItem,
  Divider,
} from '@material-ui/core';
import { Text } from 'nuudel-core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { t } from '@Translate';
import { currentUserQuery } from '../../../graphql/queries/index';
import { logoutMutation } from '../../../graphql/mutations';
import { signOut } from 'nuudel-core';
import { useRouter } from 'next/router';
import IconButton from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerOpen: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    inline: {
      display: 'inline',
    },
    mt2: {
      marginTop: '20px',
    },
    px2: {
      paddingLeft: '10px',
      paddingRight: '10px',
    },
    pt2: {
      paddingTop: '20px',
    },
    w100: {
      fontWeight: 'lighter',
    },
    w500: {
      fontWeight: 'bold',
    },
    textCenter: {
      textAlign: 'center',
    },
    lineHeight1: {
      lineHeight: 1,
    },
    userRole: {
      color: theme.palette.grey[300],
    },
    sectionMobile: {
      display: 'flex',
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    sectionDesktop: {
      paddingTop: 0,
      paddingBottom: 0,
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'flex',
        alignItems: 'center',
      },
    },
  }),
);

export default function HeaderUserbox() {
  const client = useApolloClient();
  const router = useRouter();
  const [logout, { loading: logoutLoading }] = useMutation<any>(
    logoutMutation,
    {
      onCompleted: () => {
        client.clearStore();
        //client.cache.reset()
        //client.resetStore(); //To reset the cache without refetching active queries, use client.clearStore() instead of
        signOut(router); // redirect user to login page
      },
    },
  );
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const classes = useStyles();

  const { data, error, loading } = useQuery(currentUserQuery);

  if (logoutLoading) return <></>;
  if (loading) return <></>;
  if (error) return <></>;
  const { currentUser } = data;

  return (
    <Fragment>
      <Button
        color="inherit"
        onClick={handleClick}
        className={classes.sectionDesktop}
      >
        <ListItem alignItems="flex-start" style=\{{ padding: '0 10px' }}>
          <ListItemAvatar>
            <Avatar
              alt={currentUser.firstname || currentUser.username}
              src={currentUser.avatar && currentUser.avatar.uri}
            />
          </ListItemAvatar>
          <ListItemText
            style=\{{ textTransform: 'capitalize' }}
            primary={currentUser.firstname}
            secondary={
              <React.Fragment>
                <Text
                  component="span"
                  variant="body2"
                  className={`${classes.inline} ${classes.userRole}`}
                >
                  {t(currentUser.type) || ''}
                </Text>
              </React.Fragment>
            }
          />
        </ListItem>
        <span className="pl-1 pl-xl-3">
          <i className="icon-download-arrow-1" style=\{{ fontSize: '20px' }} />
        </span>
      </Button>
      <div className={classes.sectionMobile}>
        <IconButton
          aria-label="show more"
          aria-haspopup="true"
          onClick={handleClick}
          color="inherit"
        >
          <MoreIcon />
        </IconButton>
      </div>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        getContentAnchorEl={null}
        open={Boolean(anchorEl)}
        anchorOrigin=\{{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin=\{{
          vertical: 'center',
          horizontal: 'center',
        }}
        onClose={handleClose}
      >
        <div className={classes.px2}>
          <List>
            <Box
              component="div"
              color="text.primary"
              className={classes.textCenter}
            >
              <Avatar
                sizes="44"
                alt={currentUser.firstname || currentUser.username}
                src={currentUser.avatar && currentUser.avatar.uri}
                style=\{{ margin: '0 auto' }}
              />
            </Box>
            <div className="pl-3  pr-3">
              <div
                className={`${classes.w500} ${classes.pt2} ${classes.textCenter} ${classes.lineHeight1}`}
              >
                {currentUser.username}
              </div>
              <div className={classes.textCenter}>
                {t(currentUser.type) || ''}
              </div>
            </div>
            <Divider className={`${classes.mt2} ${classes.w100}`} />

            <ListItem
              button
              component="a"
              href="/admin/reset-password?code=reset"
            >
              {t('Change password')}
            </ListItem>

            <Divider className="w-100" />

            <ListItem button component="a" href="/admin/profile">
              {t('Profile settings')}
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
                  <i className="icon-exit" style=\{{ fontSize: '12px' }} />
                }
                color="secondary"
              >
                {t('Logout')}
              </Button>
            </ListItem>
          </List>
        </div>
      </Menu>
    </Fragment>
  );
}
