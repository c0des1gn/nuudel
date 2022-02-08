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
import { IContext } from 'nuudel-main';
import { Note } from 'nuudel-main';
import { User } from './user.resolver';

@ObjectType()
export class Comment extends CoreType {
  @Field(type => Note, { defaultValue: '' })
  @Property({ required: true })
  content: string;

  @Field(type => ObjectId, { nullable: true })
  @Property({ required: true })
  postId: ObjectId;

  @Field(type => ObjectId, { nullable: true })
  @Property({ required: true }) //, ref: User
  userId: ObjectId;

  @Field(type => [String], { defaultValue: [] })
  @Property({ required: false })
  up: string[];

  @Field(type => [String], { defaultValue: [] })
  @Property({ required: false })
  down: string[];

  @Field(type => [Reply], { defaultValue: [] })
  @Property({ required: false })
  reply: object[];
}

@InputType()
@ArgsType()
export class CommentInput implements Partial<Comment> {
  @Field(type => ObjectId, { nullable: true })
  postId: ObjectId;

  @Field(type => [ReplyInput], { defaultValue: [] })
  reply: object[];

  @Field(type => Note, { nullable: true, defaultValue: '' })
  content: string;

  @Field(type => ObjectId, { nullable: true })
  userId: ObjectId;

  @Field(type => [String], { defaultValue: [] })
  up: string[];

  @Field(type => [String], { defaultValue: [] })
  down: string[];
}

@ObjectType()
export class Reply {
  @Field(type => Note, { defaultValue: '' })
  @Property({ required: true })
  content: string;

  @Field(type => ObjectId, { nullable: true })
  @Property({ required: true }) //, ref: User
  userId: ObjectId;

  @Field(type => [String], { defaultValue: [] })
  @Property({ required: false })
  up: string[];

  @Field(type => [String], { defaultValue: [] })
  @Property({ required: false })
  down: string[];
}

@ArgsType()
@InputType()
export class ReplyInput implements Partial<Reply> {
  @Field(type => Note, { defaultValue: '' })
  content: string;

  @Field(type => ObjectId, { nullable: true })
  userId: ObjectId;

  @Field(type => [String], { defaultValue: [] })
  up: string[];

  @Field(type => [String], { defaultValue: [] })
  down: string[];
}

@ArgsType()
export class CommentArg extends CommentInput {}

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class CommentResponse extends PaginatedResponse(Comment) {
  // you can add more fields here if you need
}

const CommentBaseResolver = BaseResolver<Comment, CommentResponse>(
  Comment,
  CommentResponse,
);

@Resolver(of => Comment)
export class CommentResolver extends CommentBaseResolver {
  @Authorized()
  @Mutation(returns => Comment, { name: `update${Comment.name}` })
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: CommentArg,
    @Ctx() ctx: IContext,
  ): Promise<Comment> {
    return this.editItem(_id, obj, ctx);
  }

  @Authorized()
  @Mutation(returns => Comment, { name: `add${Comment.name}` })
  async addItem(
    @Arg(`input${Comment.name}`, { nullable: true }) data: CommentInput,
    @Ctx() ctx: IContext,
  ) {
    return this.newItem(data as Comment, ctx);
  }
}
