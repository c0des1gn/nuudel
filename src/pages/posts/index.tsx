import { GetStaticProps } from 'next';
import {
  Layout,
  BasicMeta,
  OpenGraphMeta,
  TwitterCardMeta,
  PostList,
} from 'nuudel-core';
import { CONF } from '../../config';
import { fetcher } from '../../lib/fetcher';
import useSWR from 'swr';
import { ITagContent, IPostContent } from 'nuudel-core';

type Props = {
  posts: IPostContent[];
  tags: ITagContent[];
  pagination: {
    current: number;
    pages: number;
  };
};
export default function Index() {
  const url = '/posts';
  const title = 'All posts';

  const { data, error } = useSWR<any, any>(
    `query GetPosts {
        getPosts(skip: 0, take: ${CONF?.posts_per_page ||
          10}, filter: "{}", total: 0, sort: "{\"createdAt\": -1}") {
          itemSummaries
            {
              title
              date
              slug
              tags
              _author
              description
              content
            }
          total
          offset
          next
        }
        getAllTag(limit: 200, filter: "{}",sort: "{}") {
          slug
          name
        }
      }`,
    fetcher,
  );
  const tags = !data ? [] : data.getAllTag;
  const pagination = {
    current: 1,
    pages: Math.ceil(
      !data ? 1 : data.getPosts.total / (CONF?.posts_per_page || 10),
    ),
  };
  const posts = !data ? [] : data.getPosts.itemSummaries;
  return (
    <Layout>
      <BasicMeta url={url} title={title} />
      <OpenGraphMeta url={url} title={title} />
      <TwitterCardMeta url={url} title={title} />
      <PostList posts={posts} tags={tags} pagination={pagination} />
    </Layout>
  );
}
