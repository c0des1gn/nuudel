// @material-ui/icons
import Dashboard from '@material-ui/icons/Dashboard';
import PeopleOutline from '@material-ui/icons/PeopleOutline';
import Category from '@material-ui/icons/Category';
import AddBox from '@material-ui/icons/AddBox';
import ShoppingBasket from '@material-ui/icons/ShoppingBasket';
import SettingsIcon from '@material-ui/icons/Settings';
import MapIcon from '@material-ui/icons/Map';
import AccountTreeIcon from '@material-ui/icons/AccountTree';

import { t } from '@Translate';

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
