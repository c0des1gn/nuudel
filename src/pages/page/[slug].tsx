import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { withApollo } from 'nuudel-core';
import { fetcher } from '../../lib/fetcher';
import useSWR from 'swr';
import { IPageContent } from 'nuudel-core';
import { InferGetStaticPropsType } from 'next';

type Props = {
  page: IPageContent;
  slug: string;
};

const Page = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const { slug } = router.query;

  const url = `/page/${slug}`;
  const { data, error } = useSWR<any, any>(
    `query GetPageBy {
      getPageBy(slug: "${slug}") {
        title
        columns
        listname
        filter
        type
        header
        icon
        content
        permission
      }
  }`,
    fetcher,
  );

  if (!data) {
    //return {  notFound: true, };
  }

  const page = { title: '', content: '', ...(!data ? {} : data.getPageBy) };

  return (
    <div>
      <span>{!page ? '' : page.title}</span>
      {!page ? '' : page.content}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params.slug as string;
  return {
    props: {
      slug,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export default withApollo(Page);
