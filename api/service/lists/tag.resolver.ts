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

@ObjectType()
export class Tag extends CoreType {
  @Field(type => String, {nullable: true})
  @Property({required: true, unique: true, index: true})
  slug: string;

  @Field(type => String, {nullable: true, defaultValue: ''})
  @Property({required: false})
  name: string;
}

@InputType()
@ArgsType()
export class TagInput implements Partial<Tag> {
  @Field(type => String, {nullable: true})
  slug: string;

  @Field(type => String, {nullable: true, defaultValue: ''})
  name: string;
}

@ArgsType()
export class TagArg extends TagInput {}

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class TagResponse extends PaginatedResponse(Tag) {
  // you can add more fields here if you need
}

const TagBaseResolver = BaseResolver<Tag, TagResponse>(Tag, TagResponse);

@Resolver(of => Tag)
export class TagResolver extends TagBaseResolver {
  @Authorized()
  @Mutation(returns => Tag, {name: `update${Tag.name}`})
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: TagArg,
    @Ctx() ctx: IContext,
  ): Promise<Tag> {
    return this.editItem(_id, obj, ctx);
  }

  @Authorized('Admin', 'Manager')
  @Mutation(returns => Tag, {name: `add${Tag.name}`})
  async addItem(
    @Arg(`input${Tag.name}`, {nullable: true}) data: TagInput,
    @Ctx() ctx: IContext,
  ) {
    return this.newItem(data as Tag, ctx);
  }

  @Query(returns => Tag, {name: `get${Tag.name}By`, nullable: true})
  async getItemBy(@Arg('slug', type => String) slug: string): Promise<Tag> {
    return await this.Model.findOne({slug: slug});
  }

  @Query(returns => TagResponse, {name: `get${Tag.name}s`})
  async readItems(@Args() pr: CoreArgs, @Ctx() {user}: IContext) {
    return await this.getItems(pr, {user});
  }
}
