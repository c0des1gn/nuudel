import {createTheme} from '@mui/material/styles';
import {setTheme, LIGHT, DARK} from './variables/palette';

// Create a theme instance.

export const thememode = (prefersDarkMode: boolean = false) => {
  const palette = setTheme(prefersDarkMode);
  return createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light', // For Dark Theme
      primary: {
        light: palette['primary-light'],
        main: palette.primary,
        dark: palette['primary-dark'],
      },
      secondary: {
        light: LIGHT.secondary,
        main: palette.secondary,
        dark: DARK.secondary,
      },
      error: {
        light: LIGHT.danger,
        main: palette.danger,
        dark: DARK.danger,
      },
      warning: {
        light: LIGHT.warning,
        main: palette.warning,
        dark: DARK.warning,
      },
      info: {
        light: LIGHT.info,
        main: palette.info,
        dark: DARK.info,
      },
      success: {
        light: LIGHT.success,
        main: palette.success,
        dark: DARK.success,
      },
      text: {
        primary: palette['text-dark'],
        secondary: palette.text,
        disabled: palette.disabled,
      },
      action: {
        //active: palette.icon,
        //hover: palette.icon,
        //selected: palette.icon,
        disabled: palette.disabled,
        //disabledBackground: palette['background-dark'],
      },
      //divider: palette['border-light'],
      background: {
        //default: palette['background-light'],
        default: palette.background,
        paper: palette.background,
      },
    },
    typography: {
      // In Chinese and Japanese the characters are usually larger,
      // so a smaller fontsize may be appropriate.
      fontSize: 14,
      fontFamily: [
        'Open Sans',
        'Segoe UI WestEuropean',
        'Segoe UI',
        '-apple-system',
        'BlinkMacSystemFont',
        'Helvetica Neue',
        'sans-serif',
        'Arial',
      ].join(','),
      // subtitle2 is used as textfield label
      subtitle2: {
        fontWeight: 700,
        fontSize: '14px',
        textTransform: 'none',
        // paddingLeft: '5px',
        // marginBottom: '16px',
        // marginTop: '8px',
      },
    },
    // Overrides style
    components: {
      // Textfield outlined input style
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
          },
        },
      },
      // button
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '0',
          },
          containedPrimary: {
            color: '#fff',
          },
        },
      },
      // link
      MuiLink: {
        styleOverrides: {
          root: {
            //textDecoration: 'none',
            textDecorationColor: 'transparent',
          },
        },
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 540,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
  });
};
