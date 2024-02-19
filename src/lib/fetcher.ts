import axios from 'axios';
import {UI} from 'nuudel-core';
import type {SWRConfiguration} from 'swr';

const pathname: string = 'api/graphql';

export const fetcher = async (
  query: string,
  variables: any = {},
  headers: any = {},
) =>
  axios({
    url: `${process?.env?.NEXT_PUBLIC_WEB || ''}/${pathname}`,
    method: 'post',
    data: {
      query: query,
      variables: variables,
    },
    headers: {...(await UI.headers()), ...headers},
  }).then(res => res.data);

export const swrOptions: SWRConfiguration = {
  //revalidateOnMount: false,
  revalidateOnFocus: false,
  revalidateIfStale: false,
  revalidateOnReconnect: false,
  loadingTimeout: 10000,
  focusThrottleInterval: 0,
  dedupingInterval: 2000,
  errorRetryInterval: 10000,
  errorRetryCount: 1,
  shouldRetryOnError: false,
  //refreshWhenHidden: false,
  //refreshWhenOffline: false,
  //refreshInterval: 0,
};
