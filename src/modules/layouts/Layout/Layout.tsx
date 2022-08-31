import React, { useEffect } from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { alpha } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import { ICurrentUser } from '@Interfaces';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import NotificationsIcon from '@material-ui/icons/Notifications';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';
import MoreIcon from '@material-ui/icons/MoreVert';

import routes from '../../../routes';
import { useRouter } from 'next/router';
import { Collapse } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Badge from '@material-ui/core/Badge';
import HeaderUserbox from './HeaderUserBox';
import { CONF } from '../../../config';
import { t } from '@Translate';
import { capitalizeFirstLetter } from 'nuudel-utils';
import { Text, Link } from 'nuudel-core';
import { useApolloClient } from '@apollo/react-hooks';
import { QUERY } from 'nuudel-core';
import { SNACKBAR_STATE_QUERY } from '../../../graphql/queries';

export const drawerWidth = 240;
export const miniDrawerWidth = 140;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      width: '100%',
      height: 'auto',
      minHeight: '100%',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      [theme.breakpoints.up('md')]: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
    menuButton: {
      marginRight: 36,
      marginLeft: 10,
    },
    hide: {
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    pageTitle: {
      //textTransform: 'capitalize',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing(9) + 1,
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      '@media print': {
        display: 'none',
      },
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(2),
      //backgroundColor: theme.palette.background.default,

      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
      },
    },
    contentOpen: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
    contentClose: {
      width: `calc(100% - ${theme.spacing(9) + 1}px)`,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.easeIn,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    item: {
      position: 'relative',
      display: 'block',
      textDecoration: 'none',
      '&:hover,&:focus,&:visited,&': {
        color: theme.palette.text.primary,
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
      // ...defaultFont,
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
      color: "rgba('0,0,0', 0.8)",
    },
    itemText: {
      // ...defaultFont,
      margin: '0',
      lineHeight: '30px',
      fontSize: '14px',
      color: theme.palette.text.primary,
    },
    selectedMenu: {
      //color: theme.palette.primary.main,
      backgroundColor: alpha(
        theme.palette.action.selected,
        theme.palette.action.selectedOpacity,
      ),
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    logoImage: {
      width: '30px',
      display: 'inline-block',
      maxHeight: '30px',
      // marginLeft: "10px",
      marginRight: '15px',
    },
    headerToolbar: {
      padding: '0 10px',
    },
    grow: {
      flexGrow: 1,
    },
  }),
);

const heading = (path: string, query: any) => {
  const line1 = path.replace('/', ''); //remove first slash
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
  line4 = line4.map(p => t(capitalizeFirstLetter(p), { defaultValue: p }));
  return line4.join(' > '); //slash with >
};

// export default function MiniDrawer() {
type Props = { user?: ICurrentUser };
const Layout: React.FC<Props> = ({ children, ...props }) => {
  const router = useRouter();
  const client: any = useApolloClient();
  // verifies if routeName is the one active (in browser input)
  function activeRoute(routeName: any) {
    return router.pathname === routeName ? true : false;
  }

  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const [expand, setExpand] = React.useState(
    new Array<boolean>(routes.length).map(b => false),
  );

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

  useEffect(() => {
    const cacheData = client.readQuery({
      query: SNACKBAR_STATE_QUERY,
    });
    if (cacheData?.isLeftDrawerOpen !== open) {
      handleDrawerOpen(!open);
    }
  }, []);

  ///////////////////////////////////////////////////////////
  const handleDrawerOpen = (openDrawer: boolean) => {
    setOpen(openDrawer);
    const cacheData = client.readQuery({
      query: SNACKBAR_STATE_QUERY,
    });
    client.writeQuery({
      query: QUERY,
      data: { ...cacheData, isLeftDrawerOpen: openDrawer },
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

  const Menus = ({ routes, root, type = undefined }) => {
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
              [' ' + classes.selectedMenu]: activeRoute(prop.path),
            });
            const whiteFontClasses = clsx({
              [' ' + classes.selectedMenu]: activeRoute(prop.path),
            });
            return prop.child instanceof Array && prop.child.length > 0 ? (
              <span key={key} className={classes.item}>
                <ListItem
                  button
                  onClick={() => handleClick(key)}
                  key={key}
                  className={listItemClasses}
                >
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
              <Link href={prop.path} passHref key={key}>
                <span className={classes.item}>
                  <ListItem
                    button
                    key={key}
                    className={!root ? classes.nested : listItemClasses}
                  >
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
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar className={classes.headerToolbar}>
          <Avatar
            className={clsx({
              [classes.hide]: open,
            })}
            alt={CONF.site_title}
            src={CONF.logo.uri}
          />
          <Hidden mdUp implementation="css">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={hadleMobileMenu}
              edge="start"
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
          <Hidden smDown implementation="css">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => handleDrawerOpen(true)}
              edge="start"
              className={clsx(classes.menuButton, {
                [classes.hide]: open,
              })}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>

          <Text variant="h6" noWrap className={classes.pageTitle}>
            {heading(router.pathname, router.query)}
          </Text>
          <div className={classes.grow} />
          <Box display="flex" alignItems="center" justifyContent="center">
            <IconButton aria-label="show 17 new notifications" color="inherit">
              <Badge badgeContent={17} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <HeaderUserbox />
          </Box>
        </Toolbar>
      </AppBar>

      <Hidden mdUp implementation="css">
        <SwipeableDrawer
          open={mobileMenu}
          onOpen={hadleMobileMenu}
          onClose={hadleMobileMenu}
          anchor="left"
        >
          <Box
            className={classes.toolbar}
            color="text.primary"
            style=\{{ justifyContent: 'space-evenly' }}
          >
            <Avatar alt={CONF.site_title} src={CONF.logo.uri} />
            <Text variant="h5">&nbsp;{CONF.site_title}</Text>
            <Grid container style=\{{ justifyContent: 'flex-end' }}>
              <IconButton onClick={hadleMobileMenu}>
                <ChevronLeftIcon />
              </IconButton>
            </Grid>
          </Box>
          <Divider />
          <Menus routes={routes} type={props.user?.type} root></Menus>
        </SwipeableDrawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          variant="permanent"
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
          classes=\{{
            paper: clsx({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
          }}
        >
          <Box
            className={classes.toolbar}
            color="text.primary"
            style=\{{ justifyContent: 'space-evenly' }}
          >
            <Avatar alt={CONF.site_title} src={CONF.logo.uri} />
            <Text variant="h5">&nbsp;{CONF.site_title}</Text>
            <Grid container style=\{{ justifyContent: 'flex-end' }}>
              <IconButton onClick={() => handleDrawerOpen(false)}>
                <ChevronLeftIcon />
              </IconButton>
            </Grid>
          </Box>

          <Divider />
          <Menus routes={routes} type={props.user?.type} root></Menus>
        </Drawer>
      </Hidden>

      <main
        className={clsx(classes.content, {
          [classes.contentOpen]: open,
          [classes.contentClose]: !open,
        })}
      >
        <div className={classes.toolbar} />
        {children}
      </main>
    </div>
  );
};
export default Layout;
