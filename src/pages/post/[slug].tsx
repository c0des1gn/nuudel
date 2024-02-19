import {GetStaticProps, GetStaticPaths} from 'next';
import {fetcher, swrOptions} from '../../lib/fetcher';
import useSWR from 'swr';
import {useParams} from 'next/navigation';
import moment from 'moment';
import {ITagContent, IPostContent} from 'nuudel-core';
//import {dateToString} from 'nuudel-utils';
import {Spinner, NoResult} from 'nuudel-core';
import {withApollo} from 'nuudel-core';
import {t} from '@Translate';
import {Layout, Navigation, PostLayout, ICategory} from 'nuudel-core';

interface IProps {
  data: IPostContent;
}

const GET_POST_BY = `query GetPostBy ($slug: String!){
  getPostBy(slug: $slug) {
    _id
    title
    publishdate
    slug
    content
    visibility
    allowcomment
    image
    _createdby
    _modifiedby
    createdAt
    updatedAt
    tags
    author
    categories
    excerpt
  }
}`;

const GET_POSTS = `query GetPosts($skip: Int, $take: Int, $filter: String, $sort: String, $total: Int) {
  getPosts(skip: $skip, take: $take, filter: $filter, sort: $sort, total: $total) {
    itemSummaries
      {
        _id
        title
        publishdate
        slug
        content
        allowcomment
        author
        categories
        excerpt
        image
        tags
        visibility
        _createdby
        _modifiedby
        updatedAt
        createdAt
      }
    limit
    next
    offset
    total
  }
}`;

const Post: React.FC<IProps> = (props: IProps) => {
  const query = useParams();
  const {slug} = query || {};
  let _slug: string = slug instanceof Array ? slug.join('/') : slug;
  _slug = !_slug ? _slug : decodeURIComponent(_slug);
  //const url = `/post/${_slug}`;
  // params contains the post `id`.
  const {data, isLoading} = useSWR<any, any>(
    !slug
      ? null
      : [
          `query GetPostBy ($slug: String!, $skip: Int, $take: Int, $sort: String, $filter: String, $total: Int){
        getPostBy(slug: $slug) {
          _id
          title
          publishdate
          slug
          content
          visibility
          allowcomment
          image
          _createdby
          _modifiedby
          createdAt
          updatedAt
          tags
          author
          categories
          excerpt
        }
        getCategories(skip: $skip, take: $take, sort: $sort, filter: $filter, total: $total) {
          itemSummaries {
            name
            slug
            parent_id
            hasChild
            cid
          }
          total
        }
    }`,
          {
            slug: _slug,
            take: 30,
            filter: '{ "parent_id": null }',
            sort: '',
            total: 0,
            skip: 0,
          },
        ],
    ([query, variables]) => fetcher(query, variables),
    swrOptions,
  );

  if (isLoading) {
    return <Spinner size={36} color="inherit" overflowHide={false} />;
  } else if (!data && !props.data) {
    return <NoResult title={t('NoResultPost')} />;
  }

  const {data: r} = data || props;
  const blog: IPostContent = r?.getPostBy ? r.getPostBy : r._id ? r : {};
  const category: ICategory[] = r?.getCategories?.itemSummaries || [];

  return (
    <Layout>
      <Navigation category={category} />
      <PostLayout
        title={blog.title || ''}
        date={moment(blog.publishdate).toDate()}
        slug={blog.slug}
        tags={
          !blog.tags
            ? []
            : blog.tags.map(tag => ({
                name: tag,
                slug: tag,
              }))
        }
        author={blog.author}
        description={blog.excerpt}
        image={blog.image?.uri}>
        {!!blog?.content && (
          <div dangerouslySetInnerHTML=\{{__html: blog.content}} />
        )}
      </PostLayout>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({params}) => {
  const slug =
    typeof params?.slug === 'string' ? params.slug : params.slug?.join('/');
  if (!slug) {
    return {
      props: {},
    };
  }
  let r: any = undefined;
  try {
    r = await fetcher(
      GET_POST_BY,
      {
        slug: slug,
      },
      {
        Accept: 'application/json',
      },
    );
  } catch {
    return {notFound: true};
  }
  if (r && r.data?.getPostBy) {
    return {
      props: {
        data: r.data.getPostBy,
      },
      revalidate: 900, // In seconds
    };
  }
  return {notFound: true};
};

export const getStaticPaths: GetStaticPaths = async () => {
  let r: any = undefined;
  try {
    r = await fetcher(
      GET_POSTS,
      {
        skip: 0,
        take: 200,
        filter: '{"visibility": true}',
        sort: '{"createdAt": -1}',
        total: 0,
      },
      {
        Accept: 'application/json',
      },
    );
  } catch {}
  let paths = [];
  if (r && r.data?.getPosts?.itemSummaries) {
    paths = r.data.getPosts.itemSummaries.map(p => ({
      params: {
        slug: p.slug,
      },
    }));
  }
  return {paths: paths, fallback: 'blocking'}; // can also be true | false | 'blocking'
};

export default withApollo(Post);
