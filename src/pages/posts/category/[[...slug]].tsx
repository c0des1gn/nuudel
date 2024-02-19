import {GetStaticPaths, GetStaticProps} from 'next';
import {CONF} from '../../../config';
import {fetcher, swrOptions} from '../../../lib/fetcher';
import {useRouter, useParams} from 'next/navigation';
import useSWR from 'swr';
import {IPostContent, ITagContent} from 'nuudel-core';
import {NextSeo} from 'next-seo';
import {Spinner, NoResult} from 'nuudel-core';
import {t} from '@Translate';
import {ICategory, Layout, Navigation, PostList} from 'nuudel-core';

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
  const query = useParams();
  const {slug, page} = query || {};
  let _slug: string = slug instanceof Array ? slug.join('/') : slug;
  _slug = !_slug ? _slug : decodeURIComponent(_slug);
  const url = `/posts/category/${_slug}` + (page ? `?page=${page}` : '');
  const _title = slug instanceof Array ? slug.join(', ') : slug || '';
  const _page = parseInt(typeof page === 'string' ? page : '1') || 1;
  const pagesize = CONF?.posts_per_page || 10;

  const {data, isLoading} = useSWR<any, any>(
    !_title
      ? null
      : [
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
            filter: `{"categories": { "$all": ["${
              slug instanceof Array ? slug.join('","') : slug
            }"] }}`,
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
    return <NoResult title={t('NoResult')} />;
  }
  const {data: r} = data;

  const posts = r?.getPosts?.itemSummaries || [];
  const category = r?.getCategories?.itemSummaries || [];
  const pagination = {
    current: _page,
    pages: Math.ceil((r?.getPosts?.total || 0) / pagesize),
  };

  return (
    <Layout>
      <NextSeo
        title={_title}
        openGraph=\{{
          url: url,
          title: _title,
        }}
      />
      <Navigation category={category} />
      {posts?.length > 0 && <PostList posts={posts} pagination={pagination} />}
    </Layout>
  );
}
