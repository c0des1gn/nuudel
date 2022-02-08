import axios from 'axios';
import { UI } from 'nuudel-core';

const { WEB = '' } = process.env;
const pathname: string = 'api/graphql';

export const fetcher = async (query: string, variables: any = {}) =>
  axios({
    url: `${WEB}/${pathname}`,
    method: 'post',
    data: {
      query: query,
      variables: variables,
    },
    headers: { ...(await UI.headers()) },
  }).then(res => res.data);
