import { prop as Property, getModelForClass } from '@typegoose/typegoose';
import {
  Field,
  ObjectType,
  InputType,
  ArgsType,
  Int,
  Float,
  Resolver,
  Query,
  Mutation,
  Arg,
  Args,
  Authorized,
  Ctx,
} from 'type-graphql';
import { ObjectId } from 'mongodb';
import { registerEnumType } from 'type-graphql';
import { Note, Image, Link } from 'nuudel-main';
import { ImageObj, ImageInput } from './image.resolver';
import { Language, Currency } from '../enums';
import type { IContext } from 'nuudel-main';

@ObjectType() //extends CoreType
export class Settings {
  @Field()
  @Property()
  notification: boolean;

  @Field(type => Currency, { defaultValue: Currency.MNT })
  @Property({ required: false })
  currency: Currency;

  @Field(type => Language, { defaultValue: Language.Mongolian })
  @Property({ required: true })
  locale: Language;

  @Field(type => [String], { defaultValue: [], nullable: true })
  @Property({ required: false })
  _devices?: string[];
}

@InputType()
@ArgsType()
export class SettingsInput implements Partial<Settings> {
  @Field({ defaultValue: true })
  notification: boolean;

  @Field(type => Currency, { defaultValue: Currency.MNT })
  currency: Currency;

  @Field(type => Language, { defaultValue: Language.Mongolian })
  locale: Language;

  @Field(type => [String], { defaultValue: [], nullable: true })
  _devices?: string[];
}

@ObjectType()
export class Partner {
  @Field(type => Boolean, { defaultValue: false })
  @Property()
  custom: boolean;
}

@InputType()
@ArgsType()
export class PartnerInput implements Partial<Partner> {
  @Field(type => Boolean, { defaultValue: false })
  custom: boolean;
}
