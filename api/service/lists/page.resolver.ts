import {prop as Property, pre, getModelForClass} from '@typegoose/typegoose';
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
import {ObjectId} from 'mongodb';
import {registerEnumType} from 'type-graphql';
import {Note, Image, Link, converter, sanitize_slug} from 'nuudel-main';
import {ImageObj, ImageInput} from './image.resolver';
import {ScreenType, Permission} from '../enums';
import type {IContext} from 'nuudel-main';

@pre<Page>('save', function (next) {
  if (this.isNew || this.isModified('slug')) {
    let str: string = this.slug ? this.slug : this.title;
    this.slug = sanitize_slug(converter(str));
  }
  next();
})
@ObjectType()
export class Page extends CoreType {
  @Field(type => String, {defaultValue: ''})
  @Property({required: false})
  title: string;

  @Field(type => Date, {nullable: true, defaultValue: new Date()})
  @Property({required: false})
  publishdate?: Date;

  @Field(type => String, {nullable: false})
  @Property({required: true, unique: true})
  slug: string;

  @Field(type => String, {defaultValue: ''})
  @Property({required: false})
  content?: string;

  @Field(type => Boolean, {defaultValue: true})
  @Property({required: false})
  visibility?: boolean;

  @Field(type => Boolean, {defaultValue: true})
  @Property({required: false})
  allowcomment?: boolean;

  @Field(type => Image, {nullable: true})
  @Property({required: false})
  image?: object;

  @Field(type => ObjectId, {nullable: true})
  @Property({required: false})
  _parentId?: ObjectId;
}

@InputType()
@ArgsType()
export class PageInput implements Partial<Page> {
  @Field(type => String, {defaultValue: ''})
  title: string;

  @Field(type => Date, {nullable: true, defaultValue: new Date()})
  publishdate?: Date;

  @Field(type => String, {nullable: false})
  @Property({required: true, unique: true})
  slug: string;

  @Field(type => String, {defaultValue: ''})
  content?: string;

  @Field(type => Boolean, {defaultValue: true})
  visibility?: boolean;

  @Field(type => Boolean, {defaultValue: true})
  allowcomment?: boolean;

  @Field(type => ImageInput, {nullable: true})
  image?: object;

  @Field(type => ObjectId, {nullable: true})
  _parentId?: ObjectId;
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
  @Authorized('Admin', 'Manager')
  @Mutation(returns => Page, {name: `update${Page.name}`})
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: PageArg,
    @Ctx() ctx: IContext,
  ): Promise<Page> {
    obj.slug = sanitize_slug(converter(obj.slug));
    return this.editItem(_id, obj, ctx);
  }

  @Authorized('Admin', 'Manager')
  @Mutation(returns => Page, {name: `add${Page.name}`})
  async addItem(
    @Arg(`input${Page.name}`, {nullable: true}) data: PageInput,
    @Ctx() ctx: IContext,
  ) {
    return this.newItem(data as Page, ctx);
  }

  @Query(returns => Page, {name: `get${Page.name}By`})
  async getItemBy(@Arg('slug', type => String) slug: string): Promise<Page> {
    return await this.Model.findOne({slug: slug});
  }

  @Query(returns => PageResponse, {name: `get${Page.name}s`})
  async readItems(@Args() pr: CoreArgs, @Ctx() {user}: IContext) {
    return await this.getItems(pr, {user});
  }
}
