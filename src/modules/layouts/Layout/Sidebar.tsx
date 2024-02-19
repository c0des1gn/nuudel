import React from 'react';
import {useRouter, usePathname} from 'next/navigation';
import {Image, Link} from 'nuudel-core';
import Drawer from '@mui/material/Drawer';
import Hidden from '@mui/material/Hidden';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Icon from '@mui/material/Icon';
import clsx from 'clsx';
import styles from './styles.module.scss';

export default function Sidebar(props: any) {
  const router = useRouter(),
    pathname = usePathname();

  // verifies if routeName is the one active (in browser input)
  function activeRoute(routeName: any) {
    return pathname === routeName ? true : false;
  }
  const {logo, image, logoText, routes} = props;

  var links = (
    <List className={styles.list}>
      {routes.map((prop: any, key: any) => {
        const whiteFontstyles = clsx({
          [' ' + styles.whiteFont]: activeRoute(prop.path),
        });
        return (
          <Link href={prop.path} key={key}>
            <span className={styles.item}>
              <ListItem
                className={clsx(styles.itemLink, {
                  ['whiteLink']: activeRoute(prop.path),
                })}>
                {typeof prop.icon === 'string' ? (
                  <Icon className={clsx(styles.itemIcon, whiteFontstyles)}>
                    {prop.icon}
                  </Icon>
                ) : (
                  <prop.icon
                    className={clsx(styles.itemIcon, whiteFontstyles)}
                  />
                )}
                {
                  <ListItemText
                    primary={prop.name}
                    className={clsx(styles.itemText, whiteFontstyles)}
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
    <div className={styles.logo}>
      <Link href="/">
        <span className={clsx(styles.logoLink)}>
          <div className={styles.logoImage}>
            <Image
              src="/images/adminLogo.png"
              alt="logo"
              className={styles.img}
            />
          </div>
        </span>
      </Link>
      <span className={styles.logoLink}> {logoText}</span>
    </div>
  );
  return (
    <div>
      <Hidden smDown implementation="css">
        <Drawer
          anchor="left"
          variant="permanent"
          classes=\{{
            paper: clsx(styles.drawerPaper, {
              [styles.drawerOpen]: props.open,
              [styles.drawerClose]: !props.open,
            }),
          }}>
          {brand}
          <div className={styles.sidebarWrapper}>{links}</div>
        </Drawer>
      </Hidden>
    </div>
  );
}
