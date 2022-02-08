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
import { Note } from 'nuudel-main';
import { ObjectId } from 'mongodb';
import { IContext } from 'nuudel-main';

@ObjectType()
export class Post extends CoreType {
  @Field(type => String, { defaultValue: '' })
  @Property({ required: false })
  title: string;

  @Field(type => Date, { nullable: true, defaultValue: new Date() })
  @Property({ required: false })
  date?: Date;

  @Field(type => String, { nullable: false })
  @Property({ required: true, unique: true })
  slug: string;

  @Field(type => [String], { defaultValue: [] })
  @Property({ required: false })
  tags: string[];

  @Field(type => String, { nullable: true })
  @Property({ required: false })
  _author?: string;

  @Field(type => String, { defaultValue: '' })
  @Property({ required: false })
  description: string;

  @Field(type => Note, { defaultValue: '' })
  @Property({ required: true })
  content: string;
}

@InputType()
@ArgsType()
export class PostInput implements Partial<Post> {
  @Field(type => String, { defaultValue: '' })
  title: string;

  @Field(type => Date, { nullable: true, defaultValue: new Date() })
  date?: Date;

  @Field(type => String, { nullable: false })
  slug: string;

  @Field(type => [String], { defaultValue: [] })
  tags: string[];

  @Field(type => String, { defaultValue: '' })
  description: string;

  @Field(type => Note, { defaultValue: '' })
  content: string;
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
  @Mutation(returns => Post, { name: `update${Post.name}` })
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: PostArg,
    @Ctx() ctx: IContext,
  ): Promise<Post> {
    return this.editItem(_id, obj, ctx);
  }

  @Authorized()
  @Mutation(returns => Post, { name: `add${Post.name}` })
  async addItem(
    @Arg(`input${Post.name}`, { nullable: true }) data: PostInput,
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

  @Authorized()
  @Query(returns => Post, { name: `get${Post.name}By` })
  async getItemBy(@Arg('slug', type => String) slug: string): Promise<Post> {
    return await this.Model.findOne({ slug: slug });
  }
}
