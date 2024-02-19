import {
  prop as Property,
  getModelForClass,
  modelOptions,
  Severity,
} from '@typegoose/typegoose';
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
import {
  registerEnumType,
  PubSub,
  Subscription,
  Publisher,
  ResolverFilterData,
  Root,
} from 'type-graphql';
import {PubSubEngine} from 'graphql-subscriptions';
import {Note, Image, Link} from 'nuudel-main';
import {ImageInput} from './image.resolver';
import type {IContext} from 'nuudel-main';
import {
  Pushnotification,
  PushnotificationInput,
} from './pushnotification.resolver';
import {AuthenticationError} from './errors';
import {CacheControl} from '../../controller/cache-control';

@modelOptions({options: {allowMixed: Severity.ALLOW}})
@ObjectType()
export class Notification extends CoreType {
  @Field(type => ObjectId, {nullable: true, defaultValue: null})
  @Property({required: true, index: true}) //, ref: User
  _userId: ObjectId;

  @Field({nullable: false})
  @Property({required: true})
  title: string;

  @Field({nullable: false})
  @Property({required: true})
  message: string;

  @Field({nullable: true, defaultValue: null})
  @Property({required: false})
  icon?: string;

  @Field(type => Date)
  @Property({required: false})
  expired: Date;

  @Field(type => Data, {defaultValue: {screen: '', itemId: ''}})
  @Property({required: false})
  data: object;

  @Field(type => Boolean, {defaultValue: false})
  @Property({required: false})
  viewed?: boolean;
}

@InputType()
@ArgsType()
export class NotificationInput implements Partial<Notification> {
  @Field(type => ObjectId, {nullable: true, defaultValue: null})
  _userId?: ObjectId;

  @Field({nullable: false})
  @Property({required: true})
  title: string;

  @Field({nullable: false})
  message: string;

  @Field({nullable: true, defaultValue: null})
  icon?: string;

  @Field(type => Date)
  expired: Date;

  @Field(type => DataInput, {defaultValue: {screen: '', itemId: ''}})
  data: object;

  @Field(type => Boolean, {defaultValue: false})
  viewed?: boolean;
}

@ObjectType()
export class Data {
  @Field(type => String)
  @Property({required: false})
  screen: string;

  @Field(type => String)
  @Property({required: false})
  itemId: string;

  @Field(type => String, {nullable: true, defaultValue: ''})
  @Property({required: false})
  market?: string;
}

@ArgsType()
@InputType()
export class DataInput implements Partial<Data> {
  @Field(type => String)
  screen: string;

  @Field(type => String)
  itemId: string;

  @Field(type => String, {nullable: true, defaultValue: ''})
  market?: string;
}

export interface NotificationPayload {
  _userId?: string;
  title: string;
  message: string;
  icon?: string;
  expired: Date;
  data?: object;
  viewed?: boolean;
}

@ArgsType()
export class NotificationArg extends NotificationInput {}

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class NotificationResponse extends PaginatedResponse(Notification) {
  // you can add more fields here if you need
}

const NotificationBaseResolver = BaseResolver<
  Notification,
  NotificationResponse
>(Notification, NotificationResponse);

@Resolver(of => Notification)
export class NotificationResolver extends NotificationBaseResolver {
  protected _pushNotiModel: any;
  constructor() {
    super();
    this._pushNotiModel = getModelForClass(Pushnotification);
  }

  @Query(returns => Date)
  currentDate() {
    return new Date();
  }

  @Authorized()
  @Mutation(returns => Boolean, {name: `pub${Notification.name}`})
  async publishSub(
    @PubSub() pubSub: PubSubEngine,
    @Ctx() {user}: IContext,
    @Arg('title', {nullable: false}) title: string,
    @Arg('message', {nullable: false}) message: string,
    @Arg('category', {nullable: true, defaultValue: 'NOTIFICATIONS'})
    category?: string,
    @Arg('userId', {nullable: true, defaultValue: null}) userId?: string,
    @Arg('expired', {
      nullable: true,
    })
    expired?: Date,
    @Arg('icon', {nullable: true, defaultValue: ''}) icon?: string,
  ): Promise<boolean> {
    const payload: NotificationPayload = {
      _userId: !userId ? user._id : userId,
      title,
      message,
      icon,
      expired: expired ? expired : new Date(new Date().getTime() + 86400000),
    };
    await pubSub.publish(category, payload);
    return true;
  }

  // dynamic and filtered topic
  @Authorized()
  @Subscription(returns => Notification, {
    topics: ({args}) => args.category,
    filter: ({payload, args}: ResolverFilterData<NotificationPayload>) =>
      (payload._userId === null || payload._userId === args.userId) &&
      payload.expired > new Date(),
    name: `sub${Notification.name}`,
  })
  subscription(
    @Ctx() {user}: IContext,
    @Arg('userId', {nullable: false}) userId: string = user._id,
    @Arg('category', {nullable: true, defaultValue: 'NOTIFICATIONS'})
    category: string = 'NOTIFICATIONS',
    @Root()
    {
      _id,
      _userId,
      title,
      message,
      expired,
      icon,
      data,
      viewed,
      _createdby,
      _modifiedby,
    }: NotificationPayload & CoreType,
  ): Notification {
    return {
      _id,
      _userId: new ObjectId(_userId),
      title,
      message,
      expired,
      icon,
      data,
      viewed,
      _createdby,
      _modifiedby,
    };
  }

  @Authorized('Admin')
  @Mutation(returns => Notification, {name: `update${Notification.name}`})
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: NotificationArg,
    @Ctx() ctx: IContext,
  ): Promise<Notification> {
    return this.editItem(_id, obj, ctx);
  }

  @Authorized('Admin')
  @Mutation(returns => Notification, {name: `add${Notification.name}`})
  async addItem(
    @Arg(`input${Notification.name}`, {nullable: true})
    data: NotificationInput,
    @Ctx() ctx: IContext,
  ) {
    const keys = await this.getDevices(
      data._userId.toString(),
      this._pushNotiModel,
    );
    let sendNotif: boolean = data.viewed !== true;
    data.viewed = false;
    let saved = await this.newItem(data as Notification, ctx);
    if (sendNotif) {
      let badge: number = await this.Model.find(
        {
          _userId: data._userId,
          viewed: false,
        },
        {_id: 1},
      )
        .limit(99)
        .countDocuments({}, {limit: 99});
      this.sendNotification(saved, keys, badge);
    }
    return saved;
  }

  @Authorized()
  @Mutation(returns => [String], {name: `updateViewed${Notification.name}`})
  async updateViewed(
    @Ctx() ctx: IContext,
    @Arg('Ids', type => [String], {nullable: true}) Ids?: string[],
  ): Promise<string[]> {
    if (!ctx?.user) {
      throw new AuthenticationError(
        "Don't have permission to update notification",
      );
    }

    if (ctx.user._id) {
      let filter = {
        viewed: {$ne: true},
        _userId: this.getOid(ctx.user._id),
      };
      if (!!Ids && Ids.length > 0) {
        filter['_id'] = {$in: Ids};
      }
      const result = await this.Model.updateMany(filter, {
        $set: {viewed: true},
      });
    }
    return Ids || [];
  }

  @Authorized()
  @CacheControl({maxAge: 60})
  @Query(returns => Number, {
    name: `getCount${Notification.name}`,
  })
  async getCount(
    @Ctx() {user}: IContext,
    @Arg('filter', type => String, {nullable: true, defaultValue: ''})
    filter?: string,
  ) {
    if (!this.permissionCheck(user, Notification.name, 'List')) {
      throw new Error("Don't have permission to read an items");
    }
    const _filter = this.filterByUserId(filter, user);
    const total: number = await this.Model.find(_filter).countDocuments();
    return total;
  }
}
