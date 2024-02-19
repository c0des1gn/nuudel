// @mui/icons-material
import Dashboard from '@mui/icons-material/Dashboard';
import PeopleOutline from '@mui/icons-material/PeopleOutline';
import Category from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddBox from '@mui/icons-material/AddBox';
import ShoppingBasket from '@mui/icons-material/ShoppingBasket';
import MapIcon from '@mui/icons-material/Map';

import {t} from '@Translate';

const basepath = '/admin';
const dashboardRoutes = [
  {
    path: basepath,
    name: t('Dashboard'),
    icon: Dashboard,
  },
  {
    icon: ShoppingBasket,
    name: t('Category'),
    path: `${basepath}/categories`,
    perm: ['Manager'],
    child: [
      {
        icon: AddBox,
        name: t('Add category'),
        path: `${basepath}/category`,
      },
      {
        icon: AccountTreeIcon,
        name: t('Categories'),
        path: `${basepath}/categories`,
      },
    ],
  },
  {
    icon: Category,
    name: t('Other'),
    perm: ['Manager'],
    child: [
      {
        icon: MapIcon,
        name: t('Test'),
        path: `/lists/test`,
      },
    ],
  },
  {
    icon: PeopleOutline,
    name: t('Users'),
    path: `${basepath}/users`,
    perm: ['Admin'],
  },
  {
    icon: SettingsIcon,
    name: t('Settings'),
    path: `${basepath}/settings`,
    perm: ['Admin'],
  },
];

export default dashboardRoutes;
