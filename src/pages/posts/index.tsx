import {CONF} from '../../config';
import {fetcher, swrOptions} from '../../lib/fetcher';
import useSWR from 'swr';
import {ITagContent, IPostContent} from 'nuudel-core';
import {NextSeo} from 'next-seo';
import {useSearchParams} from 'next/navigation';
import {Spinner, NoResult} from 'nuudel-core';
import {t} from '@Translate';
import {ICategory, Layout, Navigation, PostList} from 'nuudel-core';

type Props = {
  posts: IPostContent[];
  tags: ITagContent[];
  pagination: {
    current: number;
    pages: number;
  };
  category: ICategory[];
};
export default function Posts({...props}: Props) {
  const url = '/posts';
  const title = t('All posts');
  const searchParams = useSearchParams();
  const _page = parseInt(searchParams.get('page') || '1') || 1;
  const pagesize = CONF?.posts_per_page || 10;

  const {data, isLoading} = useSWR<any, any>(
    [
      `query GetPosts($skip: Int, $take: Int, $filter: String, $sort: String, $total: Int, $limit: Int) {
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
        getTags(skip: 0, take: $limit, sort: null, filter: null, total: 0) {
            itemSummaries {
              _id
              name
              slug
            }
            total
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
        filter: '{}',
        sort: '{"createdAt": -1}',
        limit: 30,
      },
    ],
    ([query, variables]) => fetcher(query, variables),
    swrOptions,
  );

  if (isLoading) {
    return <Spinner size={36} color="inherit" overflowHide={false} />;
  } else if (!data) {
    return <NoResult title={t('NoResultPost')} />;
  }
  const {data: r} = data;
  const tags = r?.getTags?.itemSummaries || [];
  const category = r?.getCategories?.itemSummaries || [];

  const pagination = {
    current: _page,
    pages: Math.ceil((r?.getPosts?.total || 0) / pagesize),
  };
  const posts = r?.getPosts?.itemSummaries || [];
  return (
    <Layout>
      <NextSeo
        title={title}
        openGraph=\{{
          url: url,
          title: title,
        }}
      />
      <Navigation category={category} tags={tags} />
      <PostList posts={posts} pagination={pagination} />
    </Layout>
  );
}
