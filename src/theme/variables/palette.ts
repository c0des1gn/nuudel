const color: any = {
  brand: '#0793fa',
  'brand-light': '#42a5e0',
  'brand-dark': '#2777f7',
  accent: '#D32F2F',
  white: '#ffffff',
  'white-bright': '#fafafa',
  'white-light': '#f7f7f7',
  black: '#161616',
  'black-dark': '#000000',
  'black-light': '#1e1e1e',
  'dark-black': '#2d2d2d',
  dark: '#333333',
  gray: '#777777',
  'gray-light': '#cdcdcd',
  grey: '#656565',
  'grey-light': '#999999',
  'grey-bright': '#e1e1e1',
  'grey-dark': '#5c5c5c',
  red: '#d9534f',
  orange: '#ff8f00',
  green: '#60d517',
  blue: '#0091ea',
  pink: '#d81b60',
  yellow: '#fdd835',
  'red-dark': '#c62828',
  'orange-dark': '#ff6f00',
  'green-dark': '#00875a',
  'blue-dark': '#5e98d8',
  'pink-dark': '#b4004e',
  'yellow-dark': '#ffa000',
  neutral: 'rgba(255, 255, 255, 0.65)',
};

const defaultTheme = {
  TRANSPARENT: 'transparent',
  NEUTRAL: color.neutral,
};

export const DARK = {
  ...defaultTheme,
  facebook: '#4188cd',
  login: '#e3ae3e',
  primary: color.brand,
  secondary: color.accent,
  'primary-light': color['brand-light'],
  'primary-dark': color['brand-dark'],
  info: color['blue-dark'],
  danger: color['red-dark'],
  warning: color['orange-dark'],
  success: color['green-dark'],
  button: color.blue,
  link: color['blue-dark'],
  text: color['gray-light'],
  'text-dark': color['white-light'],
  'text-light': color['white-bright'],
  background: color.black,
  'background-light': color['black-light'],
  'background-dark': color['black-dark'],
  'background-grey': color['dark-black'],
  border: color.dark,
  'border-light': color['dark-black'],
  input: color['gray-light'],
  placeholder: color['grey-light'],
  navbar: color['white-light'],
  block: color.grey,
  icon: color['gray-light'],
  'icon-light': color['gray-light'],
  shadow: color.dark,
  disabled: color['grey-light'],
  'inverse-bg': color['gray-light'],
  'inverse-text': color['white-light'],
  loader: color['white-bright'],
};

export const LIGHT = {
  ...defaultTheme,
  facebook: '#1778f2',
  login: '#ff5253',
  primary: color.brand,
  secondary: color.accent,
  'primary-light': color['brand-light'],
  'primary-dark': color['brand-dark'],
  info: color.blue,
  danger: color.red,
  warning: color.orange,
  success: color.green,
  button: color.blue,
  link: color.blue,
  text: color.gray,
  'text-dark': color.dark,
  'text-light': color.grey,
  background: color.white,
  'background-light': color['white-light'],
  'background-dark': color['gray-light'],
  'background-grey': color['white-light'],
  border: color.grey,
  'border-light': color['grey-bright'],
  input: color.grey,
  placeholder: color['grey-light'],
  navbar: color['white-light'],
  block: color.grey,
  icon: color.dark,
  'icon-light': color['grey-dark'],
  shadow: color.dark,
  disabled: color['grey-light'],
  'inverse-bg': color['black-dark'],
  'inverse-text': color.dark,
  loader: color['grey-bright'],
};

export const setTheme = (mode: boolean = false) => {
  var colors = mode ? DARK : LIGHT;
  COLORS = colors;
  return colors;
};

var COLORS = setTheme();

export {COLORS};

export default COLORS;
