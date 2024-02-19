import React from 'react';
import {GetStaticPaths, GetStaticProps} from 'next';
import {useParams} from 'next/navigation';
import {withApollo} from 'nuudel-core';
import {fetcher, swrOptions} from '../../lib/fetcher';
import useSWR from 'swr';
import {IPageContent, Spinner, NoResult} from 'nuudel-core';
import {NextSeo} from 'next-seo';
import {t} from '@Translate';

interface IProps {
  data: IPageContent;
  slug: string;
}

const GET_PAGE_BY = `query GetPageBy ($slug: String!){
  getPageBy(slug: $slug) {
    _id
    _parentId
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
  }
}`;

const GET_PAGES = `query GetPages($skip: Int, $take: Int, $filter: String, $sort: String, $total: Int) {
  getPages(skip: $skip, take: $take, filter: $filter, sort: $sort, total: $total) {
    itemSummaries
      {
        _id
        _parentId
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
      }
    limit
    next
    offset
    total
  }
}`;

const Page: React.FC<IProps> = (props: IProps) => {
  const query = useParams();
  const {slug} = query || {};
  let _slug: string = slug instanceof Array ? slug.join('/') : slug;
  _slug = !_slug ? _slug : decodeURIComponent(_slug);

  const url = `/page/${_slug}`;
  const {data, isLoading} = useSWR<any, any>(
    !slug ? null : [GET_PAGE_BY, {slug: _slug}],
    ([query, variables]) => fetcher(query, variables),
    swrOptions,
  );

  if (isLoading) {
    return <Spinner size={36} color="inherit" overflowHide={false} />;
  } else if (!data && !props.data) {
    return <NoResult title={t('NoResult')} />;
  }

  const {data: r} = data || props;
  const page: IPageContent = r?.getPageBy ? r.getPageBy : r._id ? r : {};

  return (
    <div className="page-layout">
      <NextSeo
        title={page.title}
        openGraph=\{{
          url: url,
          title: page.title,
        }}
      />
      <h1 className="page-title">{page?.title || ''}</h1>
      {!!page?.content && (
        <div dangerouslySetInnerHTML=\{{__html: page.content}} />
      )}
    </div>
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
      GET_PAGE_BY,
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

  if (r && r.data?.getPageBy) {
    return {
      props: {
        data: r.data.getPageBy,
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
      GET_PAGES,
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
  if (r && r.data?.getPages?.itemSummaries) {
    paths = r.data.getPages.itemSummaries.map(p => ({
      params: {
        slug: p.slug,
      },
    }));
  }
  return {paths: paths, fallback: 'blocking'}; // can also be true | false | 'blocking'
};

export default withApollo(Page);
