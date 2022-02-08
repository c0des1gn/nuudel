import gql from 'graphql-tag';

export const GET_USER_QUERY = gql`
  query GetUser($_id: ObjectId!) {
    getUser(_id: $_id) {
      _id
      _createdby
      _modifiedby
      createdAt
      updatedAt
      firstname
      lastname
      username
      phone
      mobile
      email
      _verifiedEmail
      birthday
      gender
      about
      avatar
      web
      type
      _status
      settings {
        notification
        currency
        locale
      }
      _partner {
        custom
      }
    }
  }
`;

export const GET_COURIER = gql`
  query GetCouriers(
    $skip: Int
    $take: Int
    $filter: String
    $sort: String
    $total: Int
  ) {
    getCouriers(
      skip: $skip
      take: $take
      filter: $filter
      sort: $sort
      total: $total
    ) {
      total
      itemSummaries {
        _id
        username
        firstname
        lastname
        phone
        mobile
        _partner {
          custom
        }
      }
    }
  }
`;

export const LIST_WAREHOUSE_QUERY = gql`
  query getWarehouses(
    $skip: Int
    $take: Int
    $filter: String
    $sort: String
    $total: Int
  ) {
    getWarehouses(
      skip: $skip
      take: $take
      filter: $filter
      sort: $sort
      total: $total
    ) {
      total
      itemSummaries {
        _id
        name
        primary
      }
    }
  }
`;
