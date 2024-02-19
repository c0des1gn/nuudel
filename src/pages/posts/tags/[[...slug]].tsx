import {GetStaticPaths, GetStaticProps} from 'next';
import {CONF} from '../../../config';
import {fetcher, swrOptions} from '../../../lib/fetcher';
import {useParams, useSearchParams} from 'next/navigation';
import useSWR from 'swr';
import {IPostContent, ITagContent} from 'nuudel-core';
import {NextSeo} from 'next-seo';
import {Spinner, NoResult} from 'nuudel-core';
import {t} from '@Translate';
import {ICategory, Layout, Navigation, TagPostList} from 'nuudel-core';

interface Props {
  posts: IPostContent[];
  tag: ITagContent;
  page?: string;
  pagination: {
    current: number;
    pages: number;
  };
  category: ICategory[];
}
export default function Index({...props}: Props) {
  const param = useParams(),
    searchParams = useSearchParams();
  let query: any = {...param};
  searchParams.forEach((value: string, key: string) => {
    query[key] = value;
  });
  const {slug, page} = query;
  let _slug: string = slug instanceof Array ? slug.join('/') : slug;
  _slug = !_slug ? _slug : decodeURIComponent(_slug);
  const url = `/posts/tags/${_slug}` + (page ? `?page=${page}` : '');
  const _title = slug instanceof Array ? slug.join(', ') : slug || '';
  const _page = parseInt(typeof page === 'string' ? page : '1') || 1;
  const pagesize = CONF?.posts_per_page || 10;

  const {data, isLoading} = useSWR<any, any>(
    !_title
      ? null
      : [
          `query GetPosts($skip: Int, $take: Int, $filter: String, $sort: String, $total: Int, $limit: Int, $slug: String!) {
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
      getTagBy(slug: $slug) {
        name
        slug
      }
      getCategories(skip: 0, take: $limit, sort: null, filter: "{ \\"parent_id\\": null }", total: 0) {
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
            take: pagesize,
            skip: _page >= 1 ? _page - 1 : 0,
            total: 0,
            filter: `{"tags": { "$all": ["${
              slug instanceof Array ? slug.join('","') : slug
            }"] }}`,
            sort: '{"createdAt": -1}',
            limit: 30,
            slug: _slug,
          },
        ],
    ([query, variables]) => fetcher(query, variables),
    swrOptions,
  );

  if (isLoading) {
    return <Spinner size={36} color="inherit" overflowHide={false} />;
  } else if (!data) {
    return <NoResult title={t('NoResult')} />;
  }
  const {data: r} = data;
  const posts = r?.getPosts?.itemSummaries || [];

  const tag = {slug, name: slug, ...(!r.getTagBy ? {} : r.getTagBy)};
  const category = r?.getCategories?.itemSummaries || [];
  const pagination = {
    current: page ? parseInt(page as string) : 1,
    pages: Math.ceil((r?.getPosts?.total || 0) / pagesize),
  };

  const title = !tag ? '' : tag.name;

  return (
    <Layout>
      <NextSeo
        title={title}
        openGraph=\{{
          url: url,
          title: title,
        }}
      />
      <Navigation category={category} />
      {posts?.length > 0 && (
        <TagPostList posts={posts} tag={tag} pagination={pagination} />
      )}
    </Layout>
  );
}
