const path = require('path');
const fs = require('fs');
const axios = require('axios');

const pathname = 'api/graphql';

const CONFIG_QUERY = `
  query ReadConfig {
    readConfig {
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
`;

const filePath = path.join(__dirname, '../public/manifest.json');

const main = async () => {
  const { data } = await axios({
    url: `${process.env.WEB || 'http://localhost:8082'}/${pathname}`,
    method: 'post',
    data: {
      query: CONFIG_QUERY,
      variables: {},
    },
    headers: {
      Accept: 'application/json',
      //'Content-Type': 'application/json'
    },
  });
  if (
    data?.data?.readConfig?.base_url !== process?.env?.WEB &&
    !data?.data?.readConfig?.base_url?.insludes('localhost')
  ) {
    throw new Error('Wrong domain');
  }
  if (data && data.data) {
    console.log(data);
    fs.writeFileSync(filePath, JSON.stringify(data.data.readConfig, null, 2));
  } else {
    throw new Error('Expired auth token!');
  }
};

main().then(() => console.log('Done.'));
