import gql from 'graphql-tag';

export const currentUserQuery = gql`
  query CurrentUser {
    currentUser {
      _id
      email
      username
      firstname
      lastname
      type
      _verifiedEmail
      avatar
      permission {
        listname
        permission
      }
      phone
      mobile
      _partner {
        custom
      }
    }
  }
`;

export const SNACKBAR_STATE_QUERY = gql`
  query snackbar {
    snackBarOpen @client
    snackMsg @client
    snackType @client
    isLeftDrawerOpen @client
    leftDrawerWidth @client
    isConnected @client
  }
`;

export const IS_LEFT_DRAWER_OPEN = gql`
  query isLeftDrawerOpen {
    isLeftDrawerOpen @client
  }
`;
