import React from 'react';
import dynamic from 'next/dynamic';
import {Spinner} from 'nuudel-core';

const DynamicCategory: any = dynamic(
  () => import('../../forms/Category/Category'),
  {
    ssr: false,
    loading: () => <Spinner />,
  },
);

type Props = {};

const Categories: React.FC<Props> = () => {
  return <DynamicCategory />;
};

export default Categories;
