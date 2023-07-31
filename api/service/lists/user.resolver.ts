import {
  prop as Property,
  getModelForClass,
  modelOptions,
  pre,
  ReturnModelType,
  DocumentType,
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
import { ObjectId } from 'mongodb';
import { registerEnumType } from 'type-graphql';
import { Note, Image, Link } from 'nuudel-main';
import { ImageObj, ImageInput } from './image.resolver';
import {
  Settings,
  SettingsInput,
  Partner,
  PartnerInput,
} from './setting.resolver';
import {
  Sex,
  UserType,
  UserStatus,
  Currency,
  Language,
  Permission,
} from '../enums';
import bcrypt from 'bcryptjs';
import { AuthenticationError, ValidationError } from 'apollo-server-fastify';
import type { IContext } from 'nuudel-main';
import { fbProfile } from 'nuudel-main';
import { Message, reset, verify } from '../../mailer/';
import { Send, checkHash } from 'nuudel-main';
import { Min, Max, Length } from 'class-validator';
import { Verify } from './verify.resolver';
import { t } from '../../loc/I18n';
import { converter } from 'nuudel-main';

//const { REFRESH_TOKEN_SECRET } = process?.env;

export const SALT_WORK_FACTOR = 10;
export const GUEST_USER_ID = '1234567890abcd0987654321';

@pre<User>('save', function (next) {
  if (!this.isNew && this.isModified('email')) {
    if (
      !!this.email &&
      this.email !== this._verifiedEmail &&
      this.email.indexOf('@') > 0
    ) {
      Send(
        Message(
          this.email,
          t('Verify your address'),
          verify(this.firstname || this.lastname, this.email),
        ),
      );
    }
  }

  if (!this.isModified('password')) {
    return next();
  }
  const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
  this.password = bcrypt.hashSync(this.password, salt);
  //const salt = crypto.randomBytes(SALT_WORK_FACTOR).toString("hex");
  //this.password = salt + ":" + crypto.scryptSync(this.password, salt, 64).toString('hex');
  next();
})
@ObjectType()
@modelOptions({ schemaOptions: { timestamps: true } })
export class User extends CoreType {
  @Field()
  @Property({ required: true })
  firstname: string;

  @Field()
  @Property({ required: true })
  lastname: string;

  @Max(60)
  @Field()
  @Property({ required: true, unique: true })
  username: string;

  @Property({ required: true })
  password: string;

  @Field()
  @Property({ required: false })
  phone: string;

  @Field()
  @Property({ required: false })
  mobile?: string;

  @Field()
  @Property({ required: false, unique: true, index: true })
  email: string;

  @Field({ defaultValue: '' })
  @Property({ required: false })
  _verifiedEmail: string;

  @Field(type => Date, { defaultValue: new Date('1970-01-01 12:00:00') })
  @Property({ required: false })
  birthday: Date;

  @Field(type => Sex, { nullable: true, defaultValue: null })
  @Property({ required: false })
  gender: Sex;

  @Field(type => String, { nullable: true, defaultValue: '' })
  @Property({ required: false })
  _fbId: string;

  @Field(type => String, { nullable: true, defaultValue: '' })
  @Property({ required: false })
  _appleId: string;

  @Field(type => Note, { nullable: true, defaultValue: '' })
  @Property({ required: false })
  about: string;

  @Field(type => Image, { nullable: true })
  @Property({ required: false })
  avatar: object;

  @Field(type => Link, { nullable: true })
  @Property({ required: false })
  web: string;

  @Authorized()
  @Field(type => UserType, { defaultValue: UserType.User })
  @Property({ required: false })
  type: UserType;

  @Field(type => UserStatus, { defaultValue: UserStatus.Active })
  @Property({ required: false })
  _status: UserStatus;

  @Field(type => Settings, {
    defaultValue: {
      notification: true,
      currency: Currency.MNT,
      locale: Language.Mongolian,
      _devices: [],
    },
  })
  @Property({ required: false })
  settings: object;

  public async comparePassword(password: string): Promise<Boolean> {
    //const [salt, key] = this.password.split(":");
    //return key === crypto.scryptSync(password, salt, 64).toString('hex');
    return await bcrypt.compare(password, this.password);
  }
}

@InputType()
export class UserInput implements Partial<User> {
  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  phone: string;

  @Field()
  mobile?: string;

  @Field()
  email: string;

  @Field(type => Date)
  birthday: Date;

  @Field(type => Sex, { nullable: true, defaultValue: null })
  gender: Sex;

  @Field(type => String, { nullable: true, defaultValue: '' })
  _fbId: string;

  @Field(type => String, { nullable: true, defaultValue: '' })
  _appleId: string;

  @Field(type => Note, { nullable: true, defaultValue: '' })
  about?: string;

  @Field(type => ImageInput, { nullable: true })
  avatar: object;

  @Field(type => Link, { nullable: true })
  web: string;

  @Authorized('Admin')
  @Field(type => UserType, { nullable: true, defaultValue: UserType.User })
  type: UserType;

  @Field(type => UserStatus, { defaultValue: UserStatus.Active })
  _status: UserStatus;

  @Field(type => SettingsInput, {
    defaultValue: {
      notification: true,
      currency: Currency.MNT,
      locale: Language.Mongolian,
      _devices: [],
    },
  })
  settings: object;
}

@ArgsType()
export class UserArg {
  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field()
  phone: string;

  @Field()
  mobile?: string;

  @Field(type => Date)
  birthday: Date;

  @Field(type => Sex, { nullable: true, defaultValue: null })
  gender: Sex;

  @Field(type => String, { nullable: true, defaultValue: '' })
  _fbId: string;

  @Field(type => String, { nullable: true, defaultValue: '' })
  _appleId: string;

  @Field(type => Note, { nullable: true, defaultValue: '' })
  about?: string;

  @Field(type => ImageInput, { nullable: true })
  avatar: object;

  @Field(type => Link, { nullable: true })
  web: string;

  @Authorized('Admin')
  @Field(type => UserType, { nullable: true, defaultValue: UserType.User })
  type: UserType;

  @Field(type => SettingsInput, {
    defaultValue: {
      notification: true,
      currency: Currency.MNT,
      locale: Language.Mongolian,
      _devices: [],
    },
  })
  settings: object;
}

@ObjectType()
export class IPermission {
  @Field()
  @Property()
  listname: string;

  @Field(type => Permission, { defaultValue: Permission.Read })
  @Property()
  permission: Permission;
}

@ObjectType()
export class CurrentUser {
  @Field(type => ObjectId, { nullable: true })
  @Property()
  readonly _id: ObjectId;

  @Field()
  @Property()
  firstname: string;

  @Field()
  @Property()
  lastname: string;

  @Field()
  @Property()
  username: string;

  @Field()
  @Property()
  email: string;

  @Field({ defaultValue: '' })
  @Property()
  _verifiedEmail: string;

  @Field(type => Image, { nullable: true })
  @Property()
  avatar: object;

  @Field(type => UserType, { defaultValue: UserType.User })
  @Property()
  type: UserType;

  @Field(type => [IPermission], { defaultValue: [] })
  @Property()
  permission: object[];

  @Field()
  @Property({ required: false })
  phone: string;

  @Field()
  @Property({ required: false })
  mobile: string;

  @Field(type => Settings, {
    defaultValue: {
      notification: true,
      currency: Currency.MNT,
      locale: Language.Mongolian,
      _devices: [],
    },
    nullable: true,
  })
  @Property({ required: false })
  settings?: object;
}

@ObjectType()
export class Token extends CoreType {
  @Field()
  @Property()
  token: string;

  @Field(type => String, { nullable: true, defaultValue: null })
  @Property()
  refreshToken?: string;

  @Field()
  @Property()
  type: UserType;

  @Field(type => Currency)
  @Property()
  currency: Currency;

  @Field(type => Language)
  @Property()
  locale: Language;

  @Field(type => UserStatus)
  @Property()
  status: UserStatus;
}

@ArgsType()
export class LoginArg {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ArgsType()
export class OauthArg {
  @Field()
  provider: string;

  @Field()
  accessToken: string;
}

@ArgsType()
export class ResetArg {
  @Field()
  oldpass: string;

  @Field()
  password: string;

  @Field()
  newpass: string;
}

@ObjectType()
export class Courier {
  @Field(type => ObjectId, { nullable: true })
  @Property({ required: false })
  _id: ObjectId;

  @Field(type => String, { nullable: true })
  @Property({ required: false })
  username: string;

  @Field()
  @Property({ required: false })
  firstname: string;

  @Field()
  @Property({ required: false })
  lastname: string;

  @Field()
  @Property({ required: false })
  phone: string;

  @Field()
  @Property({ required: false })
  mobile: string;
}

@InputType()
@ArgsType()
export class CourierInput implements Partial<Courier> {
  @Field(type => ObjectId, { nullable: true })
  _id: ObjectId;

  @Field(type => String, { nullable: true })
  username: string;

  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field()
  phone: string;

  @Field()
  mobile: string;
}

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class UserResponse extends PaginatedResponse(User) {
  // you can add more fields here if you need
}
@ObjectType()
export class CourierResponse extends PaginatedResponse(Courier) {}

const UserBaseResolver = BaseResolver<User, UserResponse>(User, UserResponse);

@Resolver(of => User)
export class UserResolver extends UserBaseResolver {
  protected _verify: any;
  constructor() {
    super();
    this._verify = getModelForClass(Verify);
  }

  @Authorized()
  @Mutation(returns => User, { name: `update${User.name}` })
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: UserArg,
    @Ctx() ctx: IContext,
  ): Promise<User> {
    if (
      ctx.user &&
      _id &&
      (_id.toString() === ctx?.user?._id || ctx?.user?.type === 'Admin')
    ) {
      if (ctx.user.type !== 'Admin') {
        delete obj._fbId;
        delete obj._appleId;
        //delete obj.username;
        //delete obj.type;
        //delete obj._status;
        //delete obj._verifiedEmail;
      }
      if (
        obj.hasOwnProperty('type') &&
        obj.type &&
        ctx?.user?.type !== 'Admin'
      ) {
        obj['type'] = UserType.User;
      }
      return this.editItem(_id, obj, ctx, true);
    } else
      throw new AuthenticationError(
        "Don't have permission to update this user",
      );
  }

  @Mutation(returns => User, { name: `add${User.name}` })
  async addItem(
    @Arg(`input${User.name}`, { nullable: true }) data: UserInput,
    @Ctx() ctx: IContext,
  ) {
    if (
      data.hasOwnProperty('type') &&
      data.type &&
      ctx?.user?.type !== 'Admin'
    ) {
      data['type'] = UserType.User;
    }
    if (data.hasOwnProperty('email')) {
      data.email = data.email.toLowerCase();
    }
    if (data.hasOwnProperty('username')) {
      data.username = data.username.toLowerCase();
    }
    const avialable = await this.Model.findOne({
      $or: [
        { email: data.email },
        { _verifiedEmail: data.email },
        { username: data.username },
      ],
    }).select('-password');
    if (!avialable) {
      return this.signUp(data as User, ctx);
    } else throw new AuthenticationError('The user already exist');
  }

  @Authorized()
  @Mutation(returns => User)
  async changePassword(
    @Args() { oldpass, password, newpass }: ResetArg,
    @Ctx() { user }: IContext,
  ): Promise<User> {
    if (!user) {
      throw new AuthenticationError(
        "Don't have permission to update this user",
      );
    }
    const _user = await this.Model.findById(user._id.toString()).select(
      '+password',
    );

    if (newpass.length < 6 || newpass !== password) {
      throw new ValidationError('Password mismatch');
    }
    if (!_user) {
      throw new ValidationError('Wrong user');
    }
    const match = await _user.comparePassword(oldpass);
    if (!match) {
      throw new ValidationError('Password mismatch');
    }
    const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    _user.password = bcrypt.hashSync(newpass, salt);
    return await this.Model.findByIdAndUpdate(
      _user._id,
      {
        $set: {
          password: _user.password,
          _modifiedby: user?.username || 'system',
        },
      },
      { new: true },
    );
  }

  @Authorized()
  @Mutation(returns => Boolean, { name: `updateEmail${User.name}` })
  async updateEmail(
    @Arg('email', type => String) email: string,
    @Arg('pass', type => String) pass: string,
    @Ctx() { user }: IContext,
  ): Promise<boolean> {
    if (typeof user === 'undefined' || user._id.toString() === GUEST_USER_ID) {
      throw new AuthenticationError('Wrong user');
    }
    email = email.toLowerCase();
    const usr = await this.Model.findOne({
      $or: [{ email: email }, { _verifiedEmail: email }],
    }).select('-password');

    if (usr) {
      throw new AuthenticationError('The email already exist');
    }

    const _user = await this.Model.findById(user._id.toString()).select(
      '+password',
    );
    const match = await _user.comparePassword(pass);
    if (!match) {
      throw new AuthenticationError('Password mismatch');
    }
    this.sendmail({
      ..._user,
      email,
      _id: user._id.toString(),
      username: user.username,
    });
    return true;
  }

  @Mutation(returns => Boolean)
  async requestPassword(
    @Arg('email', type => String) email: string,
    @Ctx() { app }: IContext,
  ): Promise<boolean> {
    email = email.toLowerCase();
    const _user = await this.Model.findOne({
      $or: [{ email: email }, { _verifiedEmail: email }],
    }).select('-password');

    if (!_user) {
      throw new ValidationError('Email address does not exist');
    }

    if (typeof email !== 'undefined' && !!email && email.indexOf('@') > 0) {
      Send(
        Message(
          email,
          t('Password reset request'),
          reset(_user.firstname || _user.lastname, email, _user._id),
        ),
      );
      return true;
    }
    return false;
  }

  @Mutation(returns => Boolean)
  async resetPassword(
    @Ctx() ctx: IContext,
    @Arg('token', type => String, { nullable: false }) token: string,
    @Arg('password', type => String) password: string,
    @Arg('confirmPassword', type => String, { nullable: true })
    confirmPassword?: string,
    @Arg('oldPassword', type => String, { nullable: true })
    oldPassword?: string,
  ): Promise<boolean> {
    let r: any = undefined;
    if (password === confirmPassword) {
      if (token === 'reset' && !!oldPassword) {
        const _user = await this.changePassword(
          { oldpass: oldPassword, password, newpass: confirmPassword },
          ctx,
        );
        return !!_user;
      }
      const veri = this._verify.findOne({ code: token });
      if (veri && !!veri.mail) {
        let _user = await this.Model.findOne({
          $or: [
            { email: veri.mail, _id: new ObjectId(veri.userId) },
            { _verifiedEmail: veri.mail, _id: new ObjectId(veri.userId) },
          ],
        }).select('-password');

        if (!_user) {
          throw new ValidationError('Email address does not exist');
        }
        const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
        let newPass = bcrypt.hashSync(password, salt);
        r = await this.Model.findByIdAndUpdate(
          _user._id,
          {
            $set: {
              password: newPass,
              _modifiedby: ctx?.user?.username || 'system',
            },
          },
          { new: true },
        );
      } else {
        return false;
      }
    } else {
      return false;
    }

    return !!r;
  }

  @Authorized('Admin')
  @Mutation(returns => Boolean)
  async passwordResetByAdmin(
    @Ctx() { user }: IContext,
    @Arg('password', type => String) password: string,
    @Arg('id', type => ObjectId, { nullable: true })
    id?: string,
    @Arg('email', type => String, { nullable: true }) email?: string,
  ): Promise<boolean> {
    if (user?.type !== 'Admin') {
      return false;
    }

    if (!id) {
      if (!email) {
        return false;
      }
      const _user = await this.Model.findOne({
        $or: [{ email: email }, { _verifiedEmail: email }],
      }).select('-password');
      id = _user._id;
    }

    const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    let newPass = bcrypt.hashSync(password, salt);
    let r = await this.Model.findByIdAndUpdate(
      id,
      {
        $set: {
          password: newPass,
          _modifiedby: user?.username || 'system',
        },
      },
      { new: true },
    );
    return !!r;
  }

  @Mutation(returns => Boolean)
  async resend(
    @Arg('email', type => String) email: string,
    @Arg('token', type => String, { nullable: false }) token: string,
    @Ctx() { app }: IContext,
  ): Promise<boolean> {
    const decoded: any = app.jwt.verify(token);
    if (decoded) {
      const _user = await this.Model.findOne({
        $or: [{ email: email.toLowerCase() }, { _id: email }],
      }).select('-password');
      if (
        decoded._id === _user._id.toString() &&
        _user.email !== _user._verifiedEmail
      ) {
        this.sendmail(_user);
        return true;
      }
    }
    return false;
  }

  @Query(returns => Boolean)
  async available(
    @Arg('email', type => String) email: string,
    @Arg('token', type => String, { nullable: false }) token: string,
    @Ctx() { app }: IContext,
  ): Promise<boolean> {
    if (!email || !token) {
      return false;
    }

    if (checkHash(token)) {
      email = email.trim().toLowerCase();
      const _user = await this.Model.findOne({
        $or: [{ email: email }, { _verifiedEmail: email }],
      }).select('-password');
      return !_user;
    }
    return false;
  }

  @Query(returns => Boolean)
  async possible(
    @Arg('username', type => String) username: string,
    @Arg('token', type => String, { nullable: false }) token: string,
    @Ctx() { app }: IContext,
  ): Promise<boolean> {
    if (!username || !token) {
      return false;
    }

    if (checkHash(token)) {
      const _user = await this.Model.findOne({
        username: username.trim().toLowerCase(),
      }).select('-password');
      return !_user;
    }
    return false;
  }

  @Mutation(returns => Boolean)
  async logout(@Ctx() { app }: IContext) {
    return true;
  }

  @Query(returns => Boolean)
  async signout(
    @Arg('token', { nullable: false }) token: string,
    @Ctx() ctx: IContext,
  ) {
    ctx.app.jwt.decode(token);
    return true;
  }

  @Authorized()
  @Query(returns => Token)
  async refresh(
    @Arg('refresh_token', { nullable: false }) refresh_token: string,
    @Ctx() ctx: IContext,
  ) {
    let decoded: any = ctx.app.jwt.verify(refresh_token);
    if (decoded && decoded._id === ctx.user?._id) {
      delete decoded.iat;
      delete decoded.exp;
      const { user } = ctx;
      return {
        _id: new ObjectId(user._id),
        currency: Currency.MNT,
        locale: Language.Mongolian,
        token: await ctx.app.jwt.sign(decoded, { expiresIn: '60d' }),
        type: user.type,
        status: user.status,
        username: user.username,
        email: user.email,
        roles: user.roles,
      };
    } else {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  @Query(returns => Token)
  async auth(@Args() { password, email }: LoginArg, @Ctx() ctx: IContext) {
    email = email.toLowerCase();
    const user = await this.Model.findOne({
      $or: [{ email }, { username: email }],
    }).select('+password');
    if (!user) {
      throw new AuthenticationError('Email and Password mismatch');
    }
    const match = await user.comparePassword(password);
    if (!match) {
      throw new AuthenticationError('Email and Password mismatch');
    }

    if (user._status === UserStatus.Blocked) {
      throw new AuthenticationError(
        'The user status is ' + UserStatus[user._status],
      );
    }

    const payLoad = {
      _id: user._id,
      username: user.username,
      email: user.email,
      type: user.type,
      roles: [user.type ? UserType[user.type] : 'Guest'],
      status: user._status,
    };
    return {
      _id: user._id,
      currency: user.settings.currency,
      locale: user.settings.locale,
      token: await ctx.app.jwt.sign(payLoad, {
        expiresIn: '60d', // expires in 60 days
      }),
      //refreshToken: await ctx.app.jwt.sign(payLoad, { expiresIn: '60d'}), // REFRESH_TOKEN_SECRET
      type: user.type,
      status: user._status,
    };
  }

  @Query(returns => Token)
  async oauth(
    @Args() { provider, accessToken }: OauthArg,
    @Ctx() ctx: IContext,
  ) {
    let column = '',
      apple: any = {};
    switch (provider) {
      case 'facebook':
        column = '_fbId';
        break;
      case 'guest':
        if (!!accessToken && accessToken !== ctx.deviceId) {
          throw new ValidationError('Not allowed guest user');
        }
        break;
      default:
        throw new ValidationError('Wrong provider');
        break;
    }
    let user: any = {};
    if (provider === 'guest') {
      user = {
        _id: new ObjectId(GUEST_USER_ID),
        username: '',
        email: '',
        type: UserType.Guest,
        settings: {
          currency: Currency.MNT,
          locale: Language.Mongolian,
        },
        _status: UserStatus.Active,
      };
    } else {
      let social_user: any = {};
      if (provider === 'facebook') {
        try {
          const graph_user = await fbProfile.Get(accessToken);
          social_user = fbProfile.data(graph_user)._json;
        } catch (e) {
          throw new ValidationError(fbProfile.error(e));
        }
      } else {
        throw new ValidationError('Wrong provider');
      }

      user = await this.Model.findOne({ [column]: social_user[column] }).select(
        '-password',
      );

      // if user already register by email
      if (
        !user &&
        social_user._verifiedEmail &&
        social_user.email === social_user._verifiedEmail
      ) {
        user = await this.Model.findOne({
          email: social_user.email,
          _verifiedEmail: social_user._verifiedEmail,
          [column]: '',
        }).select('-password');
        if (user) {
          await this.Model.findByIdAndUpdate(
            user._id,
            {
              $set: {
                [column]: social_user[column],
                _modifiedby: ctx?.user?.username || 'system',
              },
            },
            { new: true },
          );
        }
      }

      if (!user) {
        social_user['username'] = await this.generateUsername([
          social_user.username,
          social_user.email?.split('@')[0],
          social_user.firstname,
          social_user.lastname,
          provider.substring(0, 1) + social_user[column],
        ]);
        social_user['firstname'] =
          social_user.firstname || social_user.username;

        const defaultValue = {
          password: Math.random().toString(36).substring(2),
          firstname: '',
          lastname: '',
          phone: '',
          mobile: '',
          email: '',
          birthday: new Date('1970-01-01 12:00:00'),
          gender: Sex.Male,
          web: '',
          _status: UserStatus.Active,
          type: UserType.User,
          settings: {
            notification: true,
            currency: Currency.MNT,
            locale: Language.Mongolian,
            _devices: [ctx.deviceId],
          },
        };
        user = await this.signUp({ ...defaultValue, ...social_user }, ctx);
      }
    }
    const payLoad = {
      _id: user._id,
      username: user.username,
      email: user.email,
      type: user.type,
      roles: [user.type ? UserType[user.type] : 'Guest'],
      status: user._status,
    };
    return {
      _id: user._id,
      currency: user.settings.currency,
      locale: user.settings.locale,
      token: await ctx.app.jwt.sign(payLoad, {
        expiresIn: '7d', // expires in 7 days
      }),
      type: user.type,
      status: user._status,
    };
  }

  @Authorized()
  @Mutation(returns => Language, { name: `changeLanguage`, nullable: true })
  async changeLanguage(
    @Ctx() { user }: IContext,
    @Arg('locale', type => Language, { nullable: false }) locale?: string,
  ): Promise<Language> {
    let r: any = undefined;
    if (!!user?._id && user?._id !== GUEST_USER_ID && locale) {
      r = await this.Model.findByIdAndUpdate(
        user._id,
        {
          $set: {
            'settings.locale': locale,
          },
        },
        { new: true },
      );
    }
    return r?.settings?.locale;
  }

  @Query(returns => CurrentUser, { name: `currentUser` })
  async currentUser(@Ctx() ctx: IContext): Promise<CurrentUser> {
    if (!!ctx?.user?._id && ctx.user._id !== GUEST_USER_ID) {
      let r: any = await this.Model.findById(ctx.user._id).select('-password');
      if (r) {
        return {
          _id: r._id,
          email: r.email,
          username: r.username,
          firstname: r.firstname,
          lastname: r.lastname,
          type: r.type,
          _verifiedEmail: r._verifiedEmail,
          avatar: r.avatar,
          permission: this.getPermission(ctx.user.type),
          phone: r.phone,
          mobile: r.mobile,
          settings: r.settings,
        };
      }
    }
    throw new AuthenticationError('access denied');
  }

  private randomString(n, r = '') {
    let l: number;
    while (n--)
      r += String.fromCharCode(((l = (Math.random() * 26) | 0), (l += 97)));
    return r;
  }

  protected async generateUsername(names: string[]) {
    let username: string = '',
      user: string = '',
      n: number = 0;
    for (let i = 0; i < names.length; i++) {
      user = converter(names[i])
        ?.match(/[0-9a-zA-Z\-\.\_]+/g)
        ?.join('');
      if (user?.length >= 6) {
        break;
      }
    }
    if (!user || user?.length < 6) {
      user = this.randomString(8);
    } else if (user.length > 60) {
      user = user.substring(0, 59);
    }
    user = user?.toLowerCase();
    while (!username && n < 1000) {
      let name: string = user + (n > 0 ? n.toString() : '');
      const _user = await this.Model.findOne({
        username: name,
      }).select('-password');
      if (!_user) {
        username = name;
      }
      n++;
    }
    return username;
  }

  protected sendmail(obj: any) {
    if (
      typeof obj.email !== 'undefined' &&
      !!obj.email &&
      obj.email.indexOf('@') > 0
    ) {
      Send(
        Message(
          obj.email,
          t('Verify your address'),
          verify(obj.firstname || obj.username, obj.email, obj._id),
        ),
      );
    }
  }

  protected async signUp(obj: any, ctx: IContext): Promise<any> {
    this.sendmail(obj);
    return this.newItem(obj, ctx);
  }
}
