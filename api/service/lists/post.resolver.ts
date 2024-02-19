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
import {Image, converter, sanitize_slug} from 'nuudel-main';
import {ImageObj, ImageInput} from './image.resolver';
import {ObjectId} from 'mongodb';
import type {IContext} from 'nuudel-main';

@pre<Post>('save', function (next) {
  if (this.isNew || this.isModified('slug')) {
    let str: string = this.slug ? this.slug : this.title;
    str = str.trim().replace(/\s+/g, '_');
    this.slug = sanitize_slug(converter(str));
  }
  next();
})
@ObjectType()
export class Post extends CoreType {
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

  @Field(type => [String], {defaultValue: []})
  @Property({required: false})
  tags: string[];

  @Field(type => [String], {defaultValue: []})
  @Property({required: false})
  categories: string[];

  @Field(type => String, {nullable: true})
  @Property({required: false})
  author?: string;

  @Field(type => String, {defaultValue: ''})
  @Property({required: false})
  excerpt?: string;
}

@InputType()
@ArgsType()
export class PostInput implements Partial<Post> {
  @Field(type => String, {defaultValue: ''})
  title: string;

  @Field(type => Date, {nullable: true, defaultValue: new Date()})
  publishdate?: Date;

  @Field(type => String, {nullable: false})
  slug: string;

  @Field(type => String, {defaultValue: ''})
  content?: string;

  @Field(type => Boolean, {defaultValue: true})
  visibility?: boolean;

  @Field(type => Boolean, {defaultValue: true})
  allowcomment?: boolean;

  @Field(type => ImageInput, {nullable: true})
  image?: object;

  @Field(type => [String], {defaultValue: []})
  tags: string[];

  @Field(type => [String], {defaultValue: []})
  categories: string[];

  @Field(type => String, {nullable: true})
  author?: string;

  @Field(type => String, {defaultValue: ''})
  excerpt?: string;
}

@ArgsType()
export class PostArg extends PostInput {}

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class PostResponse extends PaginatedResponse(Post) {
  // you can add more fields here if you need
}

const PostBaseResolver = BaseResolver<Post, PostResponse>(Post, PostResponse);

@Resolver(of => Post)
export class PostResolver extends PostBaseResolver {
  @Authorized()
  @Mutation(returns => Post, {name: `update${Post.name}`})
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: PostArg,
    @Ctx() ctx: IContext,
  ): Promise<Post> {
    obj.slug = sanitize_slug(converter(obj.slug));
    return this.editItem(_id, obj, ctx);
  }

  @Authorized()
  @Mutation(returns => Post, {name: `add${Post.name}`})
  async addItem(
    @Arg(`input${Post.name}`, {nullable: true}) data: PostInput,
    @Ctx() ctx: IContext,
  ) {
    data['_author'] =
      ctx.user && ctx.user.username
        ? ctx.user.username
        : data['_author'] || 'system';
    if (!data.hasOwnProperty('date') || !data['date']) {
      data['date'] = new Date();
    }
    return this.newItem(data as Post, ctx);
  }

  @Query(returns => Post, {name: `get${Post.name}By`})
  async getItemBy(@Arg('slug', type => String) slug: string): Promise<Post> {
    return await this.Model.findOne({slug: slug});
  }

  @Query(returns => PostResponse, {name: `get${Post.name}s`})
  async readItems(@Args() pr: CoreArgs, @Ctx() {user}: IContext) {
    return await this.getItems(pr, {user});
  }
}
