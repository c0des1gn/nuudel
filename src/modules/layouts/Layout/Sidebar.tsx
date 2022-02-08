import React from 'react';
import gql from 'graphql-tag';
import { useRouter } from 'next/router';
import {
  makeStyles,
  Theme as AugmentedTheme,
  createStyles,
} from '@material-ui/core/styles';
import { Image, Link } from 'nuudel-core';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';
import clsx from 'clsx';

import { drawerWidth, miniDrawerWidth } from './Layout';

const useStyles = makeStyles((theme: AugmentedTheme) =>
  createStyles({
    drawerOpen: {
      width: `${drawerWidth}px`,
    },
    drawerClose: {
      width: `${miniDrawerWidth}px`,
    },
    drawerPaper: {
      position: 'fixed',
      top: '0',
      bottom: '0',
      left: '0',
      zIndex: 1,
    },
    logo: {
      position: 'relative',
      padding: '15px 15px',
      display: 'flex',
      overflow: 'hidden',
      zIndex: 4,
      'background-color': '#3d4977',
      '&:after': {
        content: '""',
        position: 'absolute',
        bottom: '0',

        height: '1px',
        right: '15px',
        width: 'calc(100% - 30px)',
      },
    },
    logoLink: {
      padding: '5px 0',
      display: 'block',
      fontSize: '24px',
      textAlign: 'left',
      fontWeight: 400,
      lineHeight: '30px',
      textDecoration: 'none',
      backgroundColor: 'transparent',
    },

    logoImage: {
      width: '30px',
      display: 'inline-block',
      maxHeight: '30px',
      marginRight: '15px',
    },
    img: {
      width: '35px',
      top: '22px',
      position: 'absolute',
      verticalAlign: 'middle',
      border: '0',
    },
    list: {
      marginTop: '20px',
      paddingLeft: '0',
      paddingTop: '0',
      paddingBottom: '0',
      marginBottom: '0',
      listStyle: 'none',
      position: 'unset',
    },
    item: {
      position: 'relative',
      display: 'block',
      textDecoration: 'none',
      '&:hover,&:focus,&:visited,&': {
        color: '#000',
      },
    },
    itemLink: {
      display: 'flex',
      overflow: 'hidden',
      width: 'auto',
      transition: 'all 300ms linear',
      margin: '10px 0',
      position: 'relative',
      padding: '10px 15px',
      backgroundColor: 'transparent',
    },
    itemIcon: {
      width: '24px',
      height: '30px',
      fontSize: '24px',
      lineHeight: '30px',
      float: 'left',
      marginRight: '15px',
      textAlign: 'center',
      verticalAlign: 'middle',
    },
    itemIconRTL: {
      marginRight: '3px',
      marginLeft: '15px',
      float: 'right',
    },
    itemText: {
      margin: '0',
      lineHeight: '30px',
      fontSize: '14px',
    },
    itemTextRTL: {
      textAlign: 'right',
    },

    sidebarWrapper: {
      position: 'relative',
      height: 'calc(100vh - 75px)',
      overflow: 'auto',
      zIndex: 4,
      overflowScrolling: 'touch',
    },
    whiteFont: {
      color: '#fff',
    },
    whiteLink: {
      color: '#fff',
    },
  }),
);

export default function Sidebar(props: any) {
  const router = useRouter();
  const classes = useStyles();
  // verifies if routeName is the one active (in browser input)
  function activeRoute(routeName: any) {
    return router.pathname === routeName ? true : false;
  }
  const { logo, image, logoText, routes } = props;
  const color = 'white';
  var links = (
    <List className={classes.list}>
      {routes.map((prop: any, key: any) => {
        var listItemClasses;
        listItemClasses = clsx({
          ['whiteLink']: activeRoute(prop.path),
        });
        const whiteFontClasses = clsx({
          [' ' + classes.whiteFont]: activeRoute(prop.path),
        });
        return (
          <Link href={prop.path} passHref key={key}>
            <span className={classes.item}>
              <ListItem button className={classes.itemLink + listItemClasses}>
                {typeof prop.icon === 'string' ? (
                  <Icon className={clsx(classes.itemIcon, whiteFontClasses)}>
                    {prop.icon}
                  </Icon>
                ) : (
                  <prop.icon
                    className={clsx(classes.itemIcon, whiteFontClasses)}
                  />
                )}
                {
                  <ListItemText
                    primary={prop.name}
                    className={clsx(classes.itemText, whiteFontClasses)}
                    disableTypography={true}
                  />
                }
              </ListItem>
            </span>
          </Link>
        );
      })}
    </List>
  );
  var brand = (
    <div className={classes.logo}>
      <Link href="/">
        <span className={clsx(classes.logoLink)}>
          <div className={classes.logoImage}>
            <Image
              src="/images/adminLogo.png"
              alt="logo"
              className={classes.img}
            />
          </div>
        </span>
      </Link>
      <span className={classes.logoLink}> {logoText}</span>
    </div>
  );
  return (
    <div>
      <Hidden smDown implementation="css">
        <Drawer
          anchor="left"
          variant="permanent"
          classes=\{{
            paper: clsx(classes.drawerPaper, {
              [classes.drawerOpen]: props.open,
              [classes.drawerClose]: !props.open,
            }),
          }}
        >
          {brand}
          <div className={classes.sidebarWrapper}>{links}</div>
        </Drawer>
      </Hidden>
    </div>
  );
}
