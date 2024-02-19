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
  CoreType,
  BaseResolver,
  PaginatedResponse,
} from './core.model';
import {ObjectId} from 'mongodb';
import type {IContext} from 'nuudel-main';
//import {User} from './user.resolver';

@ObjectType()
export class Comment extends CoreType {
  @Field(type => String)
  @Property({required: true})
  comment: string;

  @Field(type => ObjectId, {nullable: true})
  @Property({required: true})
  postId: ObjectId;

  @Field(type => Author, {nullable: true})
  @Property({required: false})
  author?: object;

  @Field(type => [String], {defaultValue: []})
  @Property({required: false})
  up: string[];

  @Field(type => [String], {defaultValue: []})
  @Property({required: false})
  down: string[];

  @Field(type => [Reply], {defaultValue: []})
  @Property({required: false})
  reply: object[];
}

@InputType()
@ArgsType()
export class CommentInput implements Partial<Comment> {
  @Field(type => ObjectId, {nullable: true})
  postId: ObjectId;

  @Field(type => String)
  comment: string;

  @Field(type => AuthorInput, {nullable: true})
  author?: object;
}

@ObjectType()
export class Reply {
  @Field(type => String, {nullable: true})
  @Property({required: false})
  _id?: string;

  @Field(type => String, {nullable: true})
  @Property({required: true})
  comment?: string;

  @Field(type => Author, {nullable: true})
  @Property({required: false})
  author?: object;

  @Field(type => [String], {defaultValue: []})
  @Property({required: false})
  up: string[];

  @Field(type => [String], {defaultValue: []})
  @Property({required: false})
  down: string[];

  @Field(type => Date, {nullable: true, defaultValue: Date.now})
  @Property({required: false})
  createdAt?: Date;

  @Field(type => Date, {nullable: true, defaultValue: Date.now})
  @Property({required: false})
  updatedAt?: Date;
}

@ArgsType()
@InputType()
export class ReplyInput implements Partial<Reply> {
  @Field(type => String, {nullable: true})
  comment?: string;

  @Field(type => AuthorInput, {nullable: true})
  author?: object;
}

@ObjectType()
export class Author {
  @Field(type => String, {nullable: true})
  @Property({required: false})
  _id?: string;

  @Field(type => String)
  @Property({required: true})
  name: string;
}

@InputType()
@ArgsType()
export class AuthorInput implements Partial<Author> {
  @Field(type => String, {nullable: true})
  _id?: string;

  @Field(type => String)
  name: string;
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
  @Mutation(returns => Comment, {name: `update${Comment.name}`})
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: CommentArg,
    @Ctx() ctx: IContext,
  ): Promise<Comment> {
    if (obj.author['_id'] !== ctx.user?._id) {
      throw new Error("Don't have permission to update this item");
    }
    return this.editItem(_id, obj, ctx);
  }

  @Authorized()
  @Mutation(returns => Comment, {name: `add${Comment.name}`})
  async addItem(
    @Arg(`input${Comment.name}`, {nullable: true}) data: CommentInput,
    @Ctx() ctx: IContext,
  ) {
    data['up'] = data['down'] = data['reply'] = [];
    return this.newItem(data as Comment, ctx);
  }

  @Authorized()
  @Mutation(returns => Boolean, {name: `remove${Reply.name}`})
  async removeItems(
    @Arg('_id', type => ObjectId) _id: string,
    @Arg('replyId', type => String) replyId: string,
    @Ctx() {user}: IContext,
  ): Promise<any> {
    const updated = await this.Model.updateOne(
      {
        _id: new ObjectId(_id),
        'reply.author._id': user?._id,
      },
      {
        $pull: {
          reply: {
            _id: replyId,
          },
        },
      },
      {new: true},
    );
    return updated?.n || !!updated?.modifiedCount;
  }

  //@Authorized()
  @Mutation(returns => Reply, {name: `add${Reply.name}`})
  async addReply(
    @Arg('_id', type => ObjectId) _id: string,
    @Arg(`input${Reply.name}`, {nullable: true}) data: ReplyInput,
    @Ctx() ctx: IContext,
  ) {
    if (!data.author['_id'] && ctx?.user) {
      data.author = {_id: ctx.user._id, name: ctx.user.username};
    }
    data['_id'] = new ObjectId().toString();
    data['createdAt'] = data['updatedAt'] = new Date();
    data['up'] = data['down'] = [];
    await this.Model.findByIdAndUpdate(
      _id,
      {$push: {reply: data}},
      {new: true},
    );
    return data;
  }

  @Authorized()
  @Mutation(returns => Boolean, {name: `update${Reply.name}`})
  async updateReply(
    @Arg('_id', type => ObjectId) _id: string,
    @Arg('replyId', type => String) replyId: string,
    @Arg('comment', type => String) comment: string,
    @Ctx() ctx: IContext,
  ) {
    const updated = await this.Model.updateOne(
      {
        _id: new ObjectId(_id),
        reply: {$elemMatch: {_id: replyId, 'author._id': ctx.user?._id}},
      },
      {$set: {'reply.$.comment': comment, 'reply.$.updatedAt': new Date()}},
      {new: true},
    );
    return updated?.n || !!updated?.modifiedCount;
  }

  @Mutation(returns => Boolean, {name: `like${Comment.name}`})
  async likeComment(
    @Ctx() ctx: IContext,
    @Arg('_id', type => ObjectId) _id: string,
    @Arg('like', type => Boolean) like: boolean,
    @Arg('name', type => String) name?: string,
    @Arg('replyId', type => String, {nullable: true}) replyId?: string,
  ) {
    if (!name && ctx?.user) {
      name = ctx.user?.username;
    }
    if (!name) {
      return false;
    }
    if (!replyId) {
      const edited = await this.Model.findByIdAndUpdate(
        _id,
        {
          $pull: {[like ? 'down' : 'up']: name},
          $addToSet: {[like ? 'up' : 'down']: name},
        },
        {new: true},
      );
      return !!edited;
    }
    const updated = await this.Model.updateOne(
      {
        _id: new ObjectId(_id),
        'reply._id': replyId,
      },
      {
        $pull: {[like ? 'reply.$.down' : 'reply.$.up']: name},
        $addToSet: {[like ? 'reply.$.up' : 'reply.$.down']: name},
      },
      {new: true},
    );
    return updated?.n || !!updated?.modifiedCount;
  }
}
