import gql from 'graphql-tag';

export const deleteAccountMutation = gql`
  mutation DeleteUser($id: ObjectId!) {
    deleteUser(_id: $id) {
      _id
    }
  }
`;

export const logoutMutation = gql`
  mutation LogoutMutation {
    logout
  }
`;

export const requestResetPasswordMutation = gql`
  mutation RequestPassword($email: String!) {
    requestPassword(email: $email)
  }
`;

export const changePasswordMutation = gql`
  mutation ResetPassword(
    $password: String!
    $token: String!
    $confirmPassword: String!
    $oldPassword: String
  ) {
    resetPassword(
      password: $password
      token: $token
      confirmPassword: $confirmPassword
      oldPassword: $oldPassword
    )
  }
`;
