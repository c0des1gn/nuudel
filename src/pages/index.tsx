import React from 'react';
import { withApollo } from 'nuudel-core';
import { HomePage } from '../forms/Home/HomePage';
import { GetStaticProps, InferGetStaticPropsType, GetStaticPaths } from 'next';

export const getStaticProps = async () => {
  return {
    props: {},
  };
};

function Home(props: InferGetStaticPropsType<typeof getStaticProps>) {
  return <HomePage />;
}

export default withApollo(Home);
