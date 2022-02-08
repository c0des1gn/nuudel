import gql from 'graphql-tag';

export const GET_SETTINGS_QUERY = gql`
  query GetConfig($_id: ObjectId!) {
    getConfig(_id: $_id) {
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

export const UPDATE_SETTINGS_MUTATION = gql`
  mutation UpdateConfig(
    $_id: ObjectId!
    $active: Boolean
    $minVersion: String
    $base_url: Link
    $site_title: String
    $site_description: String
    $site_keywords: [String!]
    $posts_per_page: Int
    $logo: ImageInput = null
    $phone: String
    $location: String
    $web: Link
    $color: String
  ) {
    updateConfig(
      _id: $_id
      active: $active
      minVersion: $minVersion
      base_url: $base_url
      site_title: $site_title
      site_description: $site_description
      site_keywords: $site_keywords
      posts_per_page: $posts_per_page
      logo: $logo
      phone: $phone
      location: $location
      web: $web
      color: $color
    ) {
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
