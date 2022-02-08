import gql from 'graphql-tag';

export const GET_CATEGORIES = gql`
  query GetCategories(
    $skip: Int
    $take: Int
    $filter: String
    $sort: String
    $total: Int
  ) {
    getCategories(
      skip: $skip
      take: $take
      filter: $filter
      sort: $sort
      total: $total
    ) {
      itemSummaries {
        _id
        name
        slug
        parent_id
        cid
        ancestors
        createdAt
        hasChild
        img
      }
    }
  }
`;

export const GET_CATEGORY_QUERY = gql`
  query GetCategory($_id: ObjectId!) {
    getCategory(_id: $_id) {
      _id
      name
      slug
      parent_id
      cid
      ancestors
      createdAt
      hasChild
      img
    }
  }
`;
