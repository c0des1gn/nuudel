import { prop as Property, getModelForClass } from '@typegoose/typegoose';
//import { Image } from 'nuudel-main';
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
} from 'type-graphql';

@ObjectType()
export class ImageObj {
  @Field()
  @Property({ required: false })
  uri: string;

  @Field(type => Int, { nullable: true })
  @Property({ required: false })
  width?: number;

  @Field(type => Int, { nullable: true })
  @Property({ required: false })
  height?: number;
}

@ArgsType()
@InputType()
export class ImageInput implements Partial<ImageObj> {
  @Field()
  uri: string;

  @Field(type => Int, { nullable: true })
  width?: number;

  @Field(type => Int, { nullable: true })
  height?: number;
}
