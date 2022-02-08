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
import {
  CoreArgs,
  BaseArgs,
  CoreType,
  BaseResolver,
  PaginatedResponse,
} from './core.model';
import { ObjectId } from 'mongodb';
import { registerEnumType } from 'type-graphql';
import { Note, Image, Link } from 'nuudel-main';
import { ImageObj, ImageInput } from './image.resolver';
import { ScreenType, Permission } from '../enums';
import { IContext } from 'nuudel-main';

@ObjectType()
export class Page extends CoreType {
  @Field()
  @Property({ required: true })
  title: string;

  @Field(type => [String], { nullable: true })
  @Property({ required: false })
  columns?: string[];

  @Field({ defaultValue: '', nullable: true })
  @Property({ required: false })
  listname?: string;

  @Field({ defaultValue: '', nullable: true })
  @Property({ required: false })
  filter?: string;

  @Field(type => ScreenType, { defaultValue: ScreenType.Text })
  @Property({ required: true })
  type: ScreenType;

  @Field(type => Boolean, { defaultValue: false })
  @Property({ required: true })
  header: boolean;

  @Field()
  @Property({ required: false })
  icon?: string;

  @Field(type => Note, { nullable: true })
  @Property({ required: false })
  content?: string;

  @Field(type => Permission, { defaultValue: Permission.Read })
  @Property({ required: false })
  permission?: Permission;
}

@InputType()
@ArgsType()
export class PageInput implements Partial<Page> {
  @Field()
  title: string;

  @Field(type => [String], { nullable: true })
  columns?: string[];

  @Field({ defaultValue: '', nullable: true })
  listname?: string;

  @Field({ defaultValue: '', nullable: true })
  filter?: string;

  @Field(type => ScreenType, { defaultValue: ScreenType.Text })
  type: ScreenType;

  @Field(type => Boolean, { defaultValue: false })
  header: boolean;

  @Field({ nullable: true })
  icon?: string;

  @Field(type => Note, { nullable: true })
  content?: string;

  @Field(type => Permission, { defaultValue: Permission.Read })
  permission?: Permission;
}

@ArgsType()
export class PageArg extends PageInput {}

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class PageResponse extends PaginatedResponse(Page) {
  // you can add more fields here if you need
}

const PageBaseResolver = BaseResolver<Page, PageResponse>(Page, PageResponse);

@Resolver(of => Page)
export class PageResolver extends PageBaseResolver {
  @Authorized()
  @Mutation(returns => Page, { name: `update${Page.name}` })
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: PageArg,
    @Ctx() ctx: IContext,
  ): Promise<Page> {
    return this.editItem(_id, obj, ctx);
  }

  @Authorized()
  @Mutation(returns => Page, { name: `add${Page.name}` })
  async addItem(
    @Arg(`input${Page.name}`, { nullable: true }) data: PageInput,
    @Ctx() ctx: IContext,
  ) {
    return this.newItem(data as Page, ctx);
  }
}
