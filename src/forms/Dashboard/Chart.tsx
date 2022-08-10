import React from 'react';
import dynamic from 'next/dynamic';
import {Spinner} from 'nuudel-core';
//import Loadable from 'react-loadable';

export const Chart = dynamic<any>(() => import('react-apexcharts'), {
  ssr: false,
  loading: ({isLoading}) => <Spinner />,
});

//export const Chart = Loadable({
//  loader: () => import('react-apexcharts'),
//  loading: Spinner,
//});
