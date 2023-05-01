import config from '../../public/manifest.json';
import { UI } from 'nuudel-core';
import axios from 'axios';

type Config = {
  readonly _id: string;
  readonly active: boolean;
  readonly minVersion: string;
  readonly base_url: string;
  readonly site_title: string;
  readonly site_description: string;
  readonly site_keywords: string[];
  readonly posts_per_page: number;
  readonly logo: any;
  readonly phone: string;
  readonly location: string;
  readonly web: string;
  readonly color?: string;
};

const CONFIG_QUERY = `
  query GetConfigs {
    getConfigs(skip: 0, take: 1, filter: "{}", total: 0) {
      itemSummaries {
        _id
        active
        minVersion
        base_url
        site_title
        site_description
        site_keywords
        posts_per_page
        logo
        phone
        location
        web
        color
      }
    }
  }
`;

const { WEB = '' } = process?.env;
const pathname: string = 'api/graphql';

export async function getConfig(): Promise<Config> {
  try {
    const { data } = await axios({
      url: `${WEB}/${pathname}`,
      method: 'post',
      data: {
        query: CONFIG_QUERY,
        variables: { take: 1 },
      },
      headers: {
        ...(await UI.headers()),
        Accept: 'application/json',
      },
    });
    if (data && (data as any).data) {
      return (data as any).data.getConfigs.itemSummaries[0];
    }
  } catch {}
  return config as Config;
}

export default config as Config;
