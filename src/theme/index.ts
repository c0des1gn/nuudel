import { createTheme } from '@material-ui/core';

import { setTheme, LIGHT, DARK } from './variables/palette';

// Create a theme instance.

export const thememode = (prefersDarkMode: boolean = false) => {
  const palette = setTheme(prefersDarkMode);
  return createTheme({
    palette: {
      type: prefersDarkMode ? 'dark' : 'light', // For Dark Theme
      primary: {
        light: LIGHT.primary,
        main: palette.primary,
        dark: DARK.primary,
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
        default: palette['background-light'],
        paper: palette.background,
      },
    },
    typography: {
      // In Chinese and Japanese the characters are usually larger,
      // so a smaller fontsize may be appropriate.
      fontSize: 14,
      fontFamily: [
        'Montserrat',
        'Segoe UI WestEuropean',
        'Segoe UI',
        '-apple-system',
        'BlinkMacSystemFont',
        'Helvetica Neue',
        'sans-serif',
        'Arial',
      ].join(','),
    },
  });
};
