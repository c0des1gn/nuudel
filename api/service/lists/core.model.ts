import {
  InputType,
  ArgsType,
  Field,
  ObjectType,
  Int,
  ClassType,
  InterfaceType,
  Authorized,
  Mutation,
  Resolver,
  Query,
  Arg,
  Args,
  Ctx,
} from 'type-graphql';
import type {IContext} from 'nuudel-main';
import {
  prop as Property,
  getModelForClass,
  modelOptions,
  pre,
  ReturnModelType,
  DocumentType,
} from '@typegoose/typegoose';
import {ObjectId} from 'mongodb';
import {Schema} from 'mongoose';
import {AuthenticationError, ValidationError} from './errors';
import {FirebaseMessaging, sendAPN} from 'nuudel-main';
import {Permission} from '../enums';
import {_permissions} from '../../permissions';
//import { Min, Max, Length } from 'class-validator';

type IPermission = 'Read' | 'List' | 'Add' | 'Edit' | 'Delete' | 'All';

//@InterfaceType()
@ArgsType()
export class CoreArgs implements BaseArgs {
  @Field(type => Int, {nullable: true, defaultValue: 0})
  skip: number = 0;

  @Field(type => Int, {nullable: true})
  take: number = 200;

  @Field(type => String, {nullable: true, defaultValue: ''}) //Schema.Types.Mixed
  filter?: string;

  @Field(type => String, {nullable: true, defaultValue: ''})
  sort?: string;

  //@Min(0)
  @Field(type => Int, {nullable: true, defaultValue: 0})
  total?: number = 0;
}

@ArgsType()
export class ListArgs {
  @Field(type => Int, {nullable: true, defaultValue: 0})
  limit?: number;

  @Field(type => String, {nullable: true, defaultValue: ''})
  filter?: string;

  @Field(type => String, {nullable: true, defaultValue: ''})
  sort?: string;
}

export interface BaseArgs {
  skip: number;
  take: number;
  sort?: string;
  filter?: string;
  total?: number;
}

export interface ICore {
  _id: ObjectId;
  _createdby: string;
  _modifiedby: string;
}

@pre<CoreType>('save', function (next) {
  if (this.isNew && typeof this._createdby === 'undefined') {
    this._createdby = 'system';
    this._modifiedby = 'system';
  }
  next();
})
@ObjectType()
@modelOptions({schemaOptions: {timestamps: true}})
export abstract class CoreType implements ICore {
  @Field()
  readonly _id: ObjectId;

  //@Authorized()
  @Field({nullable: true})
  @Property({required: false})
  _createdby: string;

  //@Authorized()
  @Field({nullable: true})
  @Property({required: false})
  _modifiedby: string;

  @Field(type => Date, {nullable: true, defaultValue: Date.now})
  @Property({required: false})
  createdAt?: Date;

  @Field(type => Date, {nullable: true, defaultValue: Date.now})
  @Property({required: false})
  updatedAt?: Date;
}

@ObjectType()
export class LookupItem {
  @Field(type => String) //ObjectId
  @Property({required: true})
  _id: string;

  @Field(type => String, {nullable: true})
  @Property({required: false})
  name?: string;
}

@InputType()
@ArgsType()
export class LookupItemInput implements Partial<LookupItem> {
  @Field(type => String)
  _id: string;

  @Field(type => String, {nullable: true})
  name?: string;
}

export function PaginatedResponse<T extends CoreType>(
  TItemClass: ClassType<T>,
): any {
  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ObjectType()
  abstract class PaginatedResponseClass {
    // here we use the runtime argument
    @Field(type => [TItemClass])
    // and here the generic type
    itemSummaries: T[];

    @Field(type => Int, {defaultValue: 0})
    total: number;

    @Field(type => Int, {defaultValue: 200})
    limit: number;

    @Field(type => Int, {defaultValue: 0})
    offset: number;

    @Field(type => Boolean, {defaultValue: false})
    next: boolean;
  }
  return PaginatedResponseClass;
}

export function BaseResolver<T extends CoreType, P extends Object>(
  objType: ClassType<T>,
  pageType: ClassType<P>,
): any {
  @Resolver()
  abstract class BaseResolver {
    public Model: any;
    constructor() {
      this.Model = getModelForClass(objType);
    }

    protected getOid(obj: any) {
      if (typeof obj === 'undefined') {
        return null;
      }
      let userId: ObjectId =
        typeof obj === 'string' && obj.length === 24 ? new ObjectId(obj) : obj;
      return userId;
    }

    protected filterByUserId(filter: string, user: any) {
      let _filter: any = !filter ? {} : this.JSONparse(filter);
      // check is prop exist in Model
      if (
        !this.permissionCheck(user, objType.name, 'All') &&
        'undefined' !== typeof this.Model.schema.path('_userId')
      ) {
        let userId: ObjectId | null = this.getOid(user?._id);
        let keys: string[] = !_filter ? [] : Object.keys(_filter);
        let criteria: any = {_userId: userId};
        if (
          _filter._userId === null ||
          filter?.replace(/\s/g, '')?.includes('{"_userId":null}')
        ) {
          criteria = {$or: [{_userId: null}, {_userId: userId}]};
        }
        if (keys.length === 0) {
          _filter = criteria;
        } else if (keys.includes('_userId')) {
          _filter = {..._filter, ...criteria};
        } else {
          _filter = {
            $and: [_filter, criteria],
          };
        }
      }
      return _filter;
    }

    filterReviver(key: string, value: any) {
      if (typeof value === 'string' && key.indexOf('$') === 0) {
        if (
          value.match(/^(\d{4})-(\d{2})-(\d{2})(T|\s)(\d{2})\:(\d{2})\:(\d{2})/)
        ) {
          try {
            return new Date(value);
          } catch {}
        }
      } else if (typeof value === 'string' && key.indexOf('_id') >= 0) {
        if (value.match(/^new ObjectId\([0-9a-fA-F]{24}\)$/)) {
          try {
            return new ObjectId(value.substring(13, 37)); // 24 length
          } catch {}
        }
      }
      return value;
    }

    JSONparse(data) {
      let dat = {};
      try {
        dat = JSON.parse(data, this.filterReviver);
      } catch (e) {
        console.warn(e);
      }
      return dat;
    }

    protected sortParse(sort: any): any {
      let _sort = {};
      if (sort) {
        try {
          _sort = JSON.parse(sort);
        } catch {}
      }
      return _sort;
    }

    @Authorized()
    @Query(returns => [objType], {name: `getAll${objType.name}`})
    async getAll(@Args() pr: ListArgs, @Ctx() {user}: IContext): Promise<T[]> {
      let {filter, sort, limit} = pr;
      if (!this.permissionCheck(user, objType.name, 'List')) {
        throw new ValidationError("Don't have permission to read an items");
      }
      const _filter = this.filterByUserId(filter, user);
      sort = this.sortParse(sort);

      const result = await this.Model.find(_filter)
        .sort(sort)
        .limit(!limit ? 200 : limit);
      return result;
    }

    @Authorized()
    @Query(returns => pageType, {
      name: `get${
        objType.name.endsWith('s') ||
        objType.name.endsWith('sh') ||
        objType.name.endsWith('ch') ||
        objType.name.endsWith('x') ||
        objType.name.endsWith('z')
          ? objType.name + 'e'
          : objType.name.endsWith('y')
          ? objType.name.substring(0, objType.name.length - 1) + 'ie'
          : objType.name.endsWith('f') || objType.name.endsWith('fe')
          ? objType.name.substring(
              0,
              objType.name.length - (objType.name.endsWith('fe') ? 2 : 1),
            ) + 've'
          : objType.name
      }s`,
    })
    async getItems(@Args() pr: CoreArgs, @Ctx() {user}: IContext) {
      if (!this.permissionCheck(user, objType.name, 'List')) {
        throw new ValidationError("Don't have permission to read an items");
      }
      const filter = this.filterByUserId(pr?.filter, user);
      const sort = this.sortParse(pr.sort);
      const total: number =
        pr.total === 0 || pr.skip == 0
          ? await this.Model.find(filter).countDocuments()
          : pr.total;
      const data: any = await this.Model.find(filter)
        .sort(sort)
        .skip(pr.skip)
        .limit(pr.take);

      return {
        itemSummaries: data,
        next: total - pr.skip > pr.take,
        limit: pr.take,
        offset: pr.skip,
        total: total,
      };
    }

    @Authorized()
    @Query(returns => Int, {name: `count${objType.name}`})
    async count(): Promise<number> {
      return await this.Model.estimatedDocumentCount();
    }

    @Authorized()
    @Query(returns => objType, {name: `getOne${objType.name}`})
    async getOne(
      @Arg('column', type => String) col: string,
      @Arg('value', type => String) val: string,
      @Ctx() {user}: IContext,
    ): Promise<T> {
      if (this.permissionCheck(user, objType.name, 'Read')) {
        return await this.Model.findOne({
          [col === 'password' ? 'username' : col]: val,
        } as T | any).select(`+${col}`);
      } else throw new ValidationError("Don't have permission to read an item");
    }

    @Authorized()
    @Query(returns => objType, {name: `get${objType.name}`})
    async getItem(
      @Arg('_id', type => ObjectId) _id: string,
      @Ctx() {user}: IContext,
    ): Promise<T> {
      let obj = null;
      if ('undefined' !== typeof this.Model.schema.path('_userId')) {
        obj = await this.Model.findById(_id).exec();
      }

      if (
        this.permissionCheck(
          user,
          objType.name,
          'Read',
          obj?._userId
            ? obj._userId.toString()
            : objType.name === 'User'
            ? _id.toString()
            : undefined,
        )
      ) {
        if ('undefined' === typeof this.Model.schema.path('_userId')) {
          obj = await this.Model.findById(_id).exec();
        }
        return obj;
      } else throw new ValidationError("Don't have permission to read an item");
    }

    protected permissionCheck(
      user: any,
      listname: string,
      permission: IPermission = 'Read',
      userId?: string,
    ): boolean {
      const {type: userType = 'Guest'} = user || {};
      if (
        (userType === 'Admin' && 'All' !== permission) ||
        (!!userId &&
          userId === user?._id &&
          ['Edit', 'Read', 'List'].includes(permission))
      ) {
        return true;
      }

      let disallow: boolean =
        permission === 'Delete' &&
        !!userId &&
        userId !== user?._id &&
        !['Manager', 'Admin'].includes(userType);
      let defaultIndex: number = _permissions.findIndex(
          p => p.listname === 'Default',
        ),
        index: number = _permissions.findIndex(p => p.listname === listname);
      if (index < 0) {
        index = defaultIndex;
      }

      if (index >= 0 && !!_permissions[index]) {
        if (_permissions[index][userType]) {
          return (
            !disallow && true === _permissions[index][userType][permission]
          );
        } else if (userType === 'Admin') {
          return true;
        } else if (
          index !== defaultIndex &&
          _permissions[defaultIndex][userType]
        ) {
          return (
            !disallow &&
            true === _permissions[defaultIndex][userType][permission]
          );
        }
      }

      return false;
    }

    protected getPermission(usertype: string = 'Guest') {
      if (usertype === 'Admin') {
        return [
          {
            listname: 'Default',
            permission: Permission.Remove,
          },
        ];
      }

      switch (usertype) {
        case 'Manager':
        case 'User':
        case 'Viewer':
        case 'Guest':
          break;
        default:
          return [
            {
              listname: 'Default',
              permission: Permission.Read,
            },
          ];
      }

      return _permissions
        .map(p => ({
          listname: p.listname,
          permission: !p[usertype]
            ? undefined
            : p[usertype].Delete
            ? Permission.Remove
            : p[usertype].Edit
            ? Permission.Edit
            : p[usertype].Add
            ? Permission.Add
            : p[usertype].Read
            ? Permission.Read
            : undefined,
        }))
        .filter(p => !!p.permission);
    }

    //public abstract removeAfter?(_id: string): Promise<void>;

    @Authorized()
    @Mutation(returns => objType, {name: `delete${objType.name}`})
    async deleteItem(
      @Arg('_id', type => ObjectId) _id: string,
      @Ctx() {user}: IContext,
    ): Promise<T> {
      let obj = null;
      if ('undefined' !== typeof this.Model.schema.path('_userId')) {
        obj = await this.Model.findById(_id);
      }

      if (
        this.permissionCheck(
          user,
          objType.name,
          'Delete',
          !obj?._userId ? undefined : obj._userId.toString(),
        )
      ) {
        const deleted = await this.Model.findByIdAndDelete(_id);
        //if (deleted && deleted._id && this.removeAfter) {
        //  await this.removeAfter(_id);
        //}
        return deleted;
      } else throw new ValidationError("Don't have permission to delete item");
    }

    protected async newItem(
      obj: any,
      ctx: IContext,
      model?: any,
      listname?: string,
    ): Promise<any> {
      obj['_createdby'] = obj['_modifiedby'] = ctx?.user?.username || 'system';

      if (
        'undefined' !== typeof this.Model.schema.path('_userId') &&
        !obj._userId &&
        ctx.user
      ) {
        obj['_userId'] = ctx.user._id;
      }
      if (
        this.permissionCheck(
          ctx?.user,
          listname || objType.name,
          'Add',
          !obj?._userId ? undefined : obj._userId.toString(),
        )
      ) {
        const Form = !model ? new this.Model(obj) : new model(obj);
        const saved = Form.save();
        return saved;
      } else
        throw new ValidationError("Don't have permission to create an item");
    }

    protected async editItem(
      _id: number | string,
      obj: any,
      ctx: IContext,
      isSet: boolean = false,
    ): Promise<any> {
      if (ctx?.user?.username) {
        obj['_modifiedby'] = ctx.user.username;
      }
      if (
        this.permissionCheck(
          ctx.user,
          objType.name,
          'Edit',
          obj?._userId
            ? obj._userId.toString()
            : objType.name === 'User'
            ? _id.toString()
            : undefined,
        )
      ) {
        return await this.Model.findByIdAndUpdate(
          _id,
          !isSet ? obj : {$set: {...obj}},
          {new: true},
        );
      } else {
        throw new ValidationError("Don't have permission to update this item");
      }
    }

    protected async getDevices(_userId: string, model: any) {
      return await model
        .find(
          {
            _userId: _userId,
          },
          {registerToken: 1, details: 1, _id: 0},
        )
        .sort({subscribedOn: -1})
        .limit(20);
    }

    protected async addNotification(obj: any, ctx: IContext, model?: any) {
      obj = {
        _userId: this.getOid(ctx.user._id),
        title: '',
        message: '',
        icon: null,
        expired: new Date(new Date().getTime() + 86400000 * 3),
        data: {screen: '', itemId: '', market: null},
        viewed: false,
        ...obj,
      };
      return await this.newItem(obj, ctx, model, 'Notification');
    }

    public async sendNotification(data: any, keys: any[], badge: number = 1) {
      if (!keys || keys.length === 0) {
        return;
      }
      const tokens = keys
        .filter(item => item.details.os !== 'ios')
        .map(item => item.registerToken);
      if (tokens.length > 0) {
        try {
          FirebaseMessaging(
            tokens,
            data._userId?.toString(),
            data.title,
            data.message,
            data.icon,
            data._id,
            data.data,
            badge,
          );
        } catch {
          ex => {
            console.warn(ex);
          };
        }
      }
      const deviceTokens = keys
        .filter(item => item.details.os === 'ios')
        .map(item => item.registerToken);
      if (deviceTokens.length > 0) {
        try {
          sendAPN(
            deviceTokens,
            data._userId?.toString(),
            data.title,
            data.message,
            data.icon,
            data._id,
            data.data,
            badge,
          );
        } catch {
          ex => {
            console.warn(ex);
          };
        }
      }
    }

    protected formatPrice = (value: any, fixed: number = 0) => {
      if (!isNaN(value)) {
        value = Number(value);
        const multi: number = fixed === 1 ? 10 : 1;
        value =
          fixed > 1 ? value.toFixed(fixed) : Math.round(value * multi) / multi;
        value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      return value;
    };

    protected getNextSequenceValue = async (
      listname: string,
      countModel: any,
    ): Promise<number> => {
      const auto_increment = await countModel.findOneAndUpdate(
        {listname: listname},
        {$inc: {sequence: 1}},
        {new: true},
      );
      return auto_increment.sequence;
    };
  }

  return BaseResolver;
}
