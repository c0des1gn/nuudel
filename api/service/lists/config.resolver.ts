import {prop as Property, getModelForClass} from '@typegoose/typegoose';
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
import {
  CoreArgs,
  BaseArgs,
  ListArgs,
  CoreType,
  BaseResolver,
  PaginatedResponse,
} from './core.model';
import {ObjectId} from 'mongodb';
import {Image, Link} from 'nuudel-main';
import {ImageObj, ImageInput} from './image.resolver';
import {AuthenticationError} from './errors';
import type {IContext} from 'nuudel-main';
import fs from 'fs';
import path from 'path';

@ObjectType()
export class Config extends CoreType {
  @Field(type => Boolean, {defaultValue: true})
  @Property({required: false, index: true})
  active: boolean;

  @Field(type => String, {nullable: true, defaultValue: '1.0.0'})
  @Property({required: false})
  minVersion: string;

  @Field(type => Link, {nullable: true, defaultValue: ''})
  @Property({required: false})
  base_url: string;

  @Field(type => String, {nullable: true, defaultValue: ''})
  @Property({required: false})
  site_title: string;

  @Field(type => String, {nullable: true, defaultValue: ''})
  @Property({required: false})
  site_description: string;

  @Field(type => [String], {defaultValue: []})
  @Property({required: false})
  site_keywords: string[];

  @Field(type => Int, {defaultValue: 10})
  @Property({required: false})
  posts_per_page: number;

  @Field(type => Image, {nullable: true, defaultValue: {uri: ''}})
  @Property({required: false})
  logo: object;

  @Field(type => String, {nullable: true, defaultValue: ''})
  @Property({required: false})
  phone: string;

  @Field(type => Link, {nullable: true, defaultValue: ''})
  @Property({required: false})
  web?: string;

  @Field(type => String, {nullable: true, defaultValue: ''})
  @Property({required: false})
  location?: string;

  @Field(type => String, {nullable: true, defaultValue: '#f58c22'})
  @Property({required: false})
  color?: string;
}

@ArgsType()
@InputType()
export class ConfigInput implements Partial<Config> {
  @Field(type => Boolean, {defaultValue: true})
  active: boolean;

  @Field(type => String, {nullable: true, defaultValue: '1.0.0'})
  minVersion: string;

  @Field(type => Link, {nullable: true, defaultValue: ''})
  base_url: string;

  @Field(type => String, {nullable: true, defaultValue: ''})
  site_title: string;

  @Field(type => String, {nullable: true, defaultValue: ''})
  site_description: string;

  @Field(type => [String], {defaultValue: []})
  site_keywords: string[];

  @Field(type => Int, {defaultValue: 10})
  posts_per_page: number;

  @Field(type => ImageInput, {nullable: true, defaultValue: {uri: ''}})
  logo: object;

  @Field(type => String, {nullable: true, defaultValue: ''})
  phone: string;

  @Field(type => Link, {nullable: true, defaultValue: ''})
  web?: string;

  @Field(type => String, {nullable: true, defaultValue: ''})
  location?: string;

  @Field(type => String, {nullable: true, defaultValue: '#f58c22'})
  color?: string;
}

@ArgsType()
export class ConfigArg extends ConfigInput {}

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class ConfigResponse extends PaginatedResponse(Config) {
  // you can add more fields here if you need
}

const ConfigBaseResolver = BaseResolver<Config, ConfigResponse>(
  Config,
  ConfigResponse,
);

@Resolver(of => Config)
export class ConfigResolver extends ConfigBaseResolver {
  @Authorized('Admin')
  @Mutation(returns => Config, {name: `update${Config.name}`})
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: ConfigArg,
    @Ctx() ctx: IContext,
  ): Promise<Config> {
    if (ctx?.user?.type !== 'Admin') {
      throw new AuthenticationError(
        "Don't have permission to update this item",
      );
    }
    // re-create general config json file
    try {
      fs.writeFileSync(
        path.join(__dirname, '../../../public/manifest.json'),
        JSON.stringify({...obj, _id: _id}, null, 2),
      );
    } catch {}
    return this.editItem(_id, obj, ctx);
  }

  @Authorized('Admin')
  @Mutation(returns => Config, {name: `add${Config.name}`})
  async addItem(
    @Arg(`input${Config.name}`, {nullable: true}) data: ConfigInput,
    @Ctx() ctx: IContext,
  ) {
    if (ctx?.user?.type !== 'Admin') {
      throw new AuthenticationError("Don't have permission to add this item");
    }
    return this.newItem(data as Config, ctx);
  }

  @Query(returns => Config, {name: `read${Config.name}`})
  async readConfig() {
    const data = await this.Model.find({}).sort({active: 1}).skip(0).limit(1);
    return data[0];
  }

  @Query(returns => [Config], {name: `getAll${Config.name}`})
  async allItems(@Args() pr: ListArgs, @Ctx() ctx: IContext) {
    return await this.getAll(pr, ctx);
  }
}
