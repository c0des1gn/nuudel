import React from 'react';
import dynamic from 'next/dynamic';
import {Spinner} from 'nuudel-core';

export const Chart = dynamic<any>(() => import('react-apexcharts'), {
  ssr: false,
  loading: ({isLoading}) => <Spinner />,
});
