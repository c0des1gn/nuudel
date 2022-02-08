import { registerEnumType } from 'type-graphql';
import {
  Country,
  Currency,
  Sex,
  UserType,
  ScreenType,
  UserStatus,
  Language,
  Permission,
} from '../enums';

export const Enums = new Map();
Enums.set('Country', Country);
Enums.set('Currency', Currency);
Enums.set('Sex', Sex);
Enums.set('UserType', UserType);
Enums.set('ScreenType', ScreenType);
Enums.set('UserStatus', UserStatus);
Enums.set('Language', Language);
Enums.set('Permission', Permission);

// Register Enum types
Enums.forEach((Enum, key) =>
  registerEnumType(Enum, {
    name: key, // this one is mandatory
    description: key, // this one is optional
  }),
);
