import { makeStyles, createStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      display: 'flex',
      alignContent: 'flex-end',
    },
    image: {
      height: '100%',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      opacity: '0.2',
      zIndex: 1,
      [theme.breakpoints.up('sm')]: {
        backgroundImage: 'url(/images/delivery.jpg)',
      },
      [theme.breakpoints.down('xs')]: {
        backgroundImage: 'url(/images/delivery_s.jpg)',
        backgroundSize: 'contain',
      },
    },
    header: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      minHeight: '100vh',
      background:
        '-webkit-linear-gradient(rgba(29, 38, 113, 0.8), rgba(195, 55, 100, 0.8))',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      [theme.breakpoints.up('sm')]: {},
      [theme.breakpoints.down('xs')]: {},
    },
    trackingContainer: {
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
    },
    navbar: {
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
    },
    logo: {
      display: 'inline-block',
    },
    contact: {
      display: 'flex',
      alignItems: 'center',
    },
    contactIcon: {
      marginRight: theme.spacing(1),
    },
    trackingSearchbar: {
      padding: theme.spacing(2),
      width: '100%',
      maxWidth: '30rem',
      marginBottom: theme.spacing(2),
    },
    submitButton: {
      padding: '15px',
    },
    trackingText: {
      color: '#fff',
      marginBottom: theme.spacing(2),
    },
    text: {
      marginBottom: theme.spacing(1),
      textAlign: 'center',
    },
    detailContainer: {
      padding: theme.spacing(4),
    },
    stepperContainer: {
      paddingBottom: theme.spacing(3),
    },
    stepper: {
      width: '100%',
    },
    detailTitle: {
      fontWeight: 500,
      paddingBottom: theme.spacing(1),
      textTransform: 'uppercase',
    },
    iconbox: {
      position: 'relative',
    },
    line: {
      flex: 1,
      height: '5px',
      minWidth: '50px',
    },
    icon: {
      width: theme.spacing(7),
      height: theme.spacing(7),
      fontSize: theme.spacing(5),
    },
    successColor: {
      backgroundColor: theme.palette.success.main,
    },
    errorColor: {
      backgroundColor: theme.palette.warning.main,
    },
    normalColor: {
      backgroundColor: theme.palette.grey[300],
    },
    progressBox: {
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4),
    },
    progressText: {
      backgroundColor: theme.palette.grey[100],
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      display: 'inline-block',
      borderRadius: '4px',
    },
  }),
);
