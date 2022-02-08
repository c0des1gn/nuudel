import { prop as Property, pre, getModelForClass } from '@typegoose/typegoose';
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
import { Country, Currency } from '../enums';
import { IContext } from 'nuudel-main';
import { Counter, CounterInput } from './counter.resolver';
import { AuthenticationError, ValidationError } from 'apollo-server-fastify';
import { converter } from 'nuudel-main';

@pre<Category>('save', function(next) {
  if (this.isNew || this.isModified('slug')) {
    let str: string = this.slug ? this.slug : this.name;
    str = str.trim().replace(/\s+/g, '_');
    this.slug = converter(str);
  }
  next();
})
@ObjectType()
export class Category extends CoreType {
  @Field({ description: 'name of category' })
  @Property({ required: true })
  name: string;

  @Field()
  @Property({ required: false, unique: true })
  slug?: string;

  @Field(type => [String], { nullable: true, defaultValue: [] })
  @Property({ required: false })
  ancestors?: string[];

  @Field(type => String)
  @Property({ required: false, unique: true })
  cid: string;

  @Field(type => String, { nullable: true, defaultValue: null })
  @Property({ required: false })
  parent_id?: string;

  @Field(type => Image, { nullable: true })
  @Property({ required: false })
  img: object;

  @Field(type => Boolean, { nullable: true, defaultValue: false })
  @Property({ required: false })
  hasChild?: boolean;
}

@InputType()
@ArgsType()
export class CategoryInput implements Partial<Category> {
  @Field()
  name: string;

  @Field()
  slug?: string;

  @Field(type => [String], { nullable: true, defaultValue: [] })
  ancestors?: string[];

  @Field(type => String, { nullable: true })
  cid?: string;

  @Field(type => String, { nullable: true, defaultValue: null })
  parent_id?: string;

  @Field(type => ImageInput, { nullable: true })
  img?: object;

  @Field(type => Boolean, { nullable: true, defaultValue: false })
  hasChild?: boolean;
}

@ArgsType()
export class CategoryArg extends CategoryInput {}

// we need to create a temporary class for the abstract, generic class "instance"
@ObjectType()
export class CategoryResponse extends PaginatedResponse(Category) {
  // you can add more fields here if you need
}

const CategoryBaseResolver = BaseResolver<Category, CategoryResponse>(
  Category,
  CategoryResponse,
);

@Resolver(of => Category)
export class CategoryResolver extends CategoryBaseResolver {
  protected Counter: any;
  constructor() {
    super();
    this.Counter = getModelForClass(Counter);
  }
  protected async getAncestors(id: string) {
    let parent: string[] = [];
    let cat = await this.Model.findOne({ cid: id });
    if (cat) {
      parent.push(cat.name);
      if (cat.parent_id !== null) {
        parent.push(...(await this.getAncestors(cat.parent_id)));
      }
    }
    return parent;
  }

  protected async setAncestors(id: string, name: string, ancestors: string[]) {
    let filter = { parent_id: id };
    if (!!name) {
      ancestors.push(name);
    }
    let update: any = await this.Model.updateMany(
      filter,
      {
        $set: {
          ancestors: ancestors,
        },
      },
      { new: true },
    );
    if (update.nModified > 0) {
      let cats = await this.Model.find(filter);
      for (let i: number = 0; i < cats.length; i++) {
        this.setAncestors(cats[i].cid, cats[i].name, ancestors);
      }
    }
  }

  @Authorized()
  @Query(returns => [Category], { name: `getChild${Category.name}` })
  async getChild(
    @Arg('id', type => String, { nullable: true }) id: string | null,
    @Arg('depth', type => Int, { defaultValue: 1 }) depth: number,
  ) {
    let chilren = [];
    const filter =
      depth === 1 ? { $or: [{ cid: id }, { parent_id: id }] } : { cid: id };
    const cat = await this.Model.find(filter);
    if (cat && cat.length > 0) {
      if (depth > 1) {
        chilren = await this.getChilren([id], depth);
        chilren.unshift(...cat);
      } else {
        chilren = cat;
      }
    }
    return chilren;
  }

  protected async getChilren(ids: string[], depth: number) {
    let chilren: Category[] = [];
    let item = await this.Model.find(
      { parent_id: { $in: ids } },
      { cid: 1, name: 1, slug: 1, parent_id: 1, img: 1 },
    );

    if (item) {
      chilren.push(...item);
      if (depth > 0) {
        let cids: string[] = [];
        for (let i: number = 0; i < item.length; i++) {
          cids.push(item[i].cid);
        }
        if (cids.length > 0) {
          --depth;
          chilren.push(...(await this.getChilren(cids, depth)));
        }
      }
    }
    return chilren;
  }

  @Authorized('Admin', 'Manager')
  @Mutation(returns => Category, { name: `edit${Category.name}` })
  async modifyItem(
    @Arg('id', type => String) id: string,
    @Args() obj: CategoryArg,
    @Ctx() ctx: IContext,
  ): Promise<Category> {
    let cat =
      id.length === 24
        ? await this.Model.findById(id)
        : await this.Model.findOne({ cid: id });

    if (!cat) {
      throw new ValidationError('Category is not exist');
    }
    if (!this.permissionCheck(ctx.user, Category.name, 'Edit')) {
      throw new AuthenticationError("Don't have permission to edit category");
    }

    if (obj.parent_id === null) {
      obj.ancestors = [];
    } else if (cat.parent_id !== obj.parent_id) {
      obj.ancestors = (await this.getAncestors(cat.cid)).reverse();
    }
    obj.slug = converter(obj.slug.trim().replace(/\s+/g, '_'));
    const update = await this.editItem(cat._id.toString(), obj, ctx);
    if (
      update &&
      (cat.parent_id !== update.parent_id || cat.name !== update.name)
    ) {
      if (cat.parent_id !== update.parent_id) {
        if (update.parent_id) {
          await this.Model.updateOne(
            { cid: update.parent_id },
            {
              $set: {
                hasChild: true,
              },
            },
          );
        } else {
          const total: number = await this.Model.find({
            parent_id: cat.parent_id,
          }).countDocuments();
          if (total === 0) {
            await this.Model.updateOne(
              { cid: cat.parent_id },
              {
                $set: {
                  hasChild: false,
                },
              },
            );
          }
        }
      }
      // need a timeout
      setTimeout(() => {
        this.setAncestors(cat.cid, update.name, update.ancestors);
      }, 1);
    }
    return update;
  }

  @Authorized('Admin', 'Manager')
  @Mutation(returns => Category, { name: `update${Category.name}` })
  async updateItem(
    @Arg('_id', type => ObjectId) _id: string,
    @Args() obj: CategoryArg,
    @Ctx() ctx: IContext,
  ): Promise<Category> {
    obj.slug = converter(obj.slug.trim().replace(/\s+/g, '_'));
    return this.editItem(_id, obj, ctx);
  }

  @Authorized('Admin', 'Manager')
  @Mutation(returns => Category, { name: `add${Category.name}` })
  async addItem(
    @Arg(`input${Category.name}`, { nullable: true }) data: CategoryInput,
    @Ctx() ctx: IContext,
  ) {
    if (!!data.parent_id) {
      data.ancestors = (await this.getAncestors(data.parent_id)).reverse();
      await this.Model.updateOne(
        { cid: data.parent_id },
        {
          $set: {
            hasChild: true,
          },
        },
      );
    } else {
      data.parent_id = null;
    }
    data.cid = (
      await this.getNextSequenceValue(Category.name, this.Counter)
    ).toString();

    return this.newItem(data as Category, ctx);
  }
  //*
  @Authorized('Admin')
  @Mutation(returns => Category, { name: `remove${Category.name}` })
  async removeItem(
    @Arg('id', type => String) id: string, // Category ID
    @Ctx() { user }: IContext,
  ) {
    if (!this.permissionCheck(user, Category.name, 'Delete')) {
      throw new AuthenticationError("Don't have permission to remove category");
    }
    const cat = await this.Model.findOneAndDelete({ cid: id });
    if (cat) {
      const update = await this.Model.updateMany(
        { parent_id: id },
        {
          $set: {
            parent_id: cat.parent_id,
          },
        },
      );
      if (update.nModified > 0) {
        setTimeout(() => {
          this.setAncestors(cat.parent_id, null, cat.ancestors);
        }, 1);
      } else if (!cat.parent_id) {
        const total: number = await this.Model.find({
          parent_id: cat.parent_id,
        }).countDocuments();
        if (total === 0) {
          await this.Model.updateOne(
            { cid: cat.parent_id },
            {
              $set: {
                hasChild: false,
              },
            },
          );
        }
      }
    }
    return cat;
  }
  // */
}
