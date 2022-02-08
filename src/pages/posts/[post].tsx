import { GetStaticProps, GetStaticPaths } from 'next';
import { fetcher } from '../../lib/fetcher';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import moment from 'moment';
import { ITagContent, PostLayout } from 'nuudel-core';

export type Props = {
  title: string;
  date: string;
  slug: string;
  tags: ITagContent[];
  _author: string;
  description?: string;
  content: string;
};

export default function Post({}: Props) {
  const router = useRouter();
  const { post } = router.query;
  // params contains the post `id`.
  const { data, error } = useSWR<any, any>(
    `query GetPostBy {
        getPostBy(slug: "${post}") {
            title
            date
            slug
            tags
            _author
            description
            content
        }
    }`,
    fetcher,
  );

  if (!data) {
    return <></>;
  }

  return (
    <PostLayout
      title={data.getPostBy.title}
      date={moment(data.getPostBy.date).toDate()}
      slug={data.getPostBy.slug}
      tags={
        data.getPostBy.tags // [{ name: 'test', slug: 'sls' }]
          ? data.getPostBy.tags.map(slug => ({
              name: data.getPostBy.slug,
              slug: data.getPostBy.slug,
            }))
          : []
      }
      author={data.getPostBy._author}
      description={data.getPostBy.description}
    >
      {data.getPostBy.content}
    </PostLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params.post as string;

  return {
    props: {},
  };
};
