import { GetStaticPaths, GetStaticProps } from 'next';
import {
  Layout,
  BasicMeta,
  OpenGraphMeta,
  TwitterCardMeta,
  TagPostList,
} from 'nuudel-core';
import { CONF } from '../../../config';
import { fetcher } from '../../../lib/fetcher';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { IPostContent, ITagContent } from 'nuudel-core';

interface Props {
  posts: IPostContent[];
  tag: ITagContent;
  page?: string;
  pagination: {
    current: number;
    pages: number;
  };
}
export default function Index({}: Props) {
  const router = useRouter();
  const [slug, page] = [router.query[0], router.query[1]];
  const url = `/posts/tags/${slug}` + (page ? `/${page}` : '');

  const { data, error } = useSWR<any, any>(
    `query GetPosts {
      getPosts(skip: 0, take: ${CONF?.posts_per_page ||
        10}, filter: "{\"tags\": { \"$all\": [\"${slug}\"] }}", total: 0, sort: "{\"createdAt\": -1}") {
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
      getTagBy(slug: "${slug}") {
        name
        slug
      }
    }`,
    fetcher,
  );

  if (!data) {
    return <></>;
  }

  const posts = data.getPosts.itemSummaries || [];
  const tag = { slug, name: slug, ...(!data ? {} : data.getTagBy) };
  const pagination = {
    current: page ? parseInt(page as string) : 1,
    pages: Math.ceil(data.getPosts.total / (CONF?.posts_per_page || 10)),
  };

  const title = !tag ? '' : tag.name;

  return (
    <Layout>
      <BasicMeta url={url} title={title} />
      <OpenGraphMeta url={url} title={title} />
      <TwitterCardMeta url={url} title={title} />
      <TagPostList posts={posts} tag={tag} pagination={pagination} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  //const queries = params.slug as string[];

  return {
    props: {},
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};
