import React, {useEffect} from 'react';
import clsx from 'clsx';
import Toolbar from '@mui/material/Toolbar';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
// import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import {ICurrentUser} from 'nuudel-core';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import routes from '../../../routes';
import {useParams, usePathname, useSearchParams} from 'next/navigation';
import {Collapse} from '@mui/material';
import Icon from '@mui/material/Icon';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import HeaderUserbox from './HeaderUserBox';
import {CONF} from '../../../config';
import {t} from '@Translate';
import {capitalizeFirstLetter} from 'nuudel-utils';
import {Text, Link} from 'nuudel-core';
import {useApolloClient} from '@apollo/react-hooks';
import {QUERY} from 'nuudel-core';
import {SNACKBAR_STATE_QUERY} from '../../../graphql/queries';
import styles from './styles.module.scss';

export const drawerWidth = '240px';
export const closedDrawerWidth = '73px';

const heading = (path: string, query: any = {}) => {
  const line1 = path?.replace('/', ''); //remove first slash
  const line2 = line1.replace(/-/g, ' '); // replace other slash with >
  const line3 = line2.replace(/\[(.+?)\]/g, (full: string, match: string) => {
    if (query[match]) {
      match = query[match];
    }
    return match;
  });
  let line4 = line3.split('/');
  // page path fix on blog
  if (query?.post_type === 'page' && line4[line4.length - 1] === 'post') {
    line4[line4.length - 1] = 'page';
  }
  line4 = line4.map(p => t(capitalizeFirstLetter(p), {defaultValue: p}));
  return line4.join(' > '); //slash with >
};

// export default function MiniDrawer() {
type Props = {user?: ICurrentUser; children?: any};
const Layout: React.FC<Props> = ({children, ...props}) => {
  const pathname = usePathname(),
    param = useParams(),
    searchParams = useSearchParams();
  let query: any = {...param};
  searchParams.forEach((value: string, key: string) => {
    query[key] = value;
  });
  const client: any = useApolloClient();
  // verifies if routeName is the one active (in browser input)
  function activeRoute(routeName: any) {
    return pathname === routeName ? true : false;
  }

  const [open, setOpen] = React.useState(false);
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const [expand, setExpand] = React.useState(
    new Array<boolean>(routes.length).map(b => false),
  );
  /*
  const color = 'white';
  ///////////////////////////////////////////////////////////
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [
    mobileMoreAnchorEl,
    setMobileMoreAnchorEl,
  ] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };
  const menuId = 'primary-search-account-menu';
  const mobileMenuId = 'primary-search-account-menu-mobile';
 ///////////////////////////////////////////////////////////
 // */
  useEffect(() => {
    const cacheData = client?.readQuery({
      query: SNACKBAR_STATE_QUERY,
    });
    if (cacheData?.isLeftDrawerOpen !== open) {
      handleDrawerOpen(!open);
    }
  }, []);

  const handleDrawerOpen = (openDrawer: boolean) => {
    setOpen(openDrawer);
    const cacheData = client?.readQuery({
      query: SNACKBAR_STATE_QUERY,
    });
    client.writeQuery({
      query: QUERY,
      data: {...cacheData, isLeftDrawerOpen: openDrawer},
    });
  };

  const hadleMobileMenu = () => {
    setMobileMenu(!mobileMenu);
  };

  const handleClick = (key: number) => {
    let copy: boolean[] = [...expand];
    copy[key] = !copy[key];
    setExpand(copy);
  };

  const Menus = ({routes, root, type = undefined}) => {
    return (
      <List component={!root ? 'div' : 'nav'} disablePadding={!root}>
        {routes
          .filter(
            (f: any) =>
              typeof f.perm === 'undefined' ||
              type === 'Admin' ||
              (type && f.perm.indexOf(type) >= 0),
          )
          .map((prop: any, key: any) => {
            var listItemClasses;
            listItemClasses = clsx({
              [styles.selectedMenu]: activeRoute(prop.path),
            });
            const whiteFontClasses = clsx({
              [styles.selectedMenu]: activeRoute(prop.path),
            });
            return prop.child instanceof Array && prop.child.length > 0 ? (
              <span
                key={key}
                className={styles.item}
                style=\{{width: !open ? closedDrawerWidth : drawerWidth}}>
                <ListItem
                  sx=\{{cursor: 'pointer'}}
                  onClick={() => handleClick(key)}
                  key={key}
                  className={listItemClasses}>
                  <ListItemIcon>
                    {typeof prop.icon === 'string' ? (
                      <Icon className={clsx(whiteFontClasses)}>
                        {prop.icon}
                      </Icon>
                    ) : (
                      <prop.icon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={prop.name} />
                  {open && (expand[key] ? <ExpandLess /> : <ExpandMore />)}
                </ListItem>
                <Collapse in={expand[key]} timeout="auto" unmountOnExit>
                  <Menus routes={prop.child} root={false}></Menus>
                </Collapse>
              </span>
            ) : (
              <Link href={prop.path} key={key}>
                <span
                  className={styles.item}
                  style=\{{width: !open ? closedDrawerWidth : drawerWidth}}>
                  <ListItem
                    key={key}
                    sx={theme => ({
                      paddingLeft: !root ? theme.spacing(4) : 'auto',
                    })}
                    className={listItemClasses}>
                    <ListItemIcon>
                      {typeof prop.icon === 'string' ? (
                        <Icon className={clsx(whiteFontClasses)}>
                          {prop.icon}
                        </Icon>
                      ) : (
                        <prop.icon />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={prop.name} />
                  </ListItem>
                </span>
              </Link>
            );
          })}
      </List>
    );
  };

  return (
    <Box
      sx=\{{display: 'flex', width: '100%', height: 'auto', minHeight: '100%'}}>
      <MuiAppBar
        sx={theme => ({
          transition: theme.transitions.create(['width', 'left'], {
            // easing: theme.transitions.easing.sharp,
            duration: open
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen,
          }),
          zIndex: theme.zIndex.drawer + 1,
          [theme.breakpoints.up('md')]: {
            left: open ? drawerWidth : '0',
            width: open ? `calc(100% - ${drawerWidth})` : '100%',
          },
        })}
        position="fixed">
        <Toolbar className={styles.headerToolbar}>
          <Link href="/">
            <Avatar
              sx=\{{display: open ? 'none' : 'flex'}}
              alt={CONF.site_title}
              src={CONF.logo.uri}
            />
          </Link>
          <div className={styles.hiddenMdUp}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={hadleMobileMenu}
              edge="start"
              sx=\{{marginRight: '36px', marginLeft: '10px'}}>
              <MenuIcon />
            </IconButton>
          </div>
          <div className={styles.hiddenSmDown}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => handleDrawerOpen(true)}
              edge="start"
              sx=\{{
                marginRight: '36px',
                marginLeft: '10px',
                display: open ? 'none' : 'inline-flex',
              }}>
              <MenuIcon />
            </IconButton>
          </div>
          <Text variant="h6" noWrap className={styles.pageTitle}>
            {heading(pathname, query)}
          </Text>
          <div className={styles.grow} />
          <Box display="flex" alignItems="center" justifyContent="center">
            <HeaderUserbox />
          </Box>
        </Toolbar>
      </MuiAppBar>
      <MuiDrawer
        variant="temporary"
        open={mobileMenu}
        // onOpen={hadleMobileMenu}
        onClose={hadleMobileMenu}
        anchor="left"
        sx=\{{display: {xs: 'block', md: 'none'}}}>
        <Box
          className={styles.toolbar}
          color="text.primary"
          style=\{{justifyContent: 'space-evenly'}}>
          <Link
            href="/"
            style=\{{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            noLinkStyle>
            <Avatar alt={CONF.site_title} src={CONF.logo.uri} />
            <Text className={styles.title} variant="h6">
              &nbsp;{CONF.site_title}
            </Text>
          </Link>
          <Grid container style=\{{justifyContent: 'flex-end'}}>
            <IconButton onClick={hadleMobileMenu}>
              <ChevronLeftIcon />
            </IconButton>
          </Grid>
        </Box>
        <Divider />
        <Menus routes={routes} type={props.user?.type} root></Menus>
      </MuiDrawer>
      <MuiDrawer
        variant="permanent"
        className={clsx(styles.drawer, {
          [styles.drawerOpen]: open,
          [styles.drawerClose]: !open,
        })}
        PaperProps=\{{
          sx: {
            overflowX: 'hidden',
            width: !open ? closedDrawerWidth : drawerWidth,
            transition: theme =>
              theme.transitions.create('all', {
                easing: theme.transitions.easing.sharp,
                duration: open
                  ? theme.transitions.duration.enteringScreen
                  : theme.transitions.duration.leavingScreen,
              }),
          },
        }}
        sx=\{{
          display: {xs: 'none', md: 'block'},
        }}>
        <Box
          className={styles.toolbar}
          color="text.primary"
          style=\{{justifyContent: 'space-evenly'}}>
          <Link
            href="/"
            style=\{{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            noLinkStyle>
            <Avatar alt={CONF.site_title} src={CONF.logo.uri} />
            <Text className={styles.title} variant="h6">
              &nbsp;{CONF.site_title}
            </Text>
          </Link>
          <Grid container style=\{{justifyContent: 'flex-end'}}>
            <IconButton onClick={() => handleDrawerOpen(false)}>
              <ChevronLeftIcon />
            </IconButton>
          </Grid>
        </Box>
        <Divider />
        <Menus routes={routes} type={props.user?.type} root></Menus>
      </MuiDrawer>
      <main
        className={clsx(styles.content, {
          [styles.contentOpen]: open,
          [styles.contentClose]: !open,
        })}>
        <div className={styles.toolbar} />
        {children}
      </main>
    </Box>
  );
};
export default Layout;
