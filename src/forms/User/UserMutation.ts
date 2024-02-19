import gql from 'graphql-tag';

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser(
    $_id: ObjectId!
    $firstname: String!
    $lastname: String!
    $phone: String!
    $mobile: String!
    $birthday: DateTimeISO!
    $gender: Sex = null
    $about: Note = ""
    $avatar: ImageInput
    $web: Link
    $type: UserType = User
  ) {
    updateUser(
      _id: $_id
      firstname: $firstname
      lastname: $lastname
      phone: $phone
      mobile: $mobile
      birthday: $birthday
      gender: $gender
      about: $about
      avatar: $avatar
      web: $web
      type: $type
    ) {
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
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ObjectId!) {
    deleteUser(_id: $id) {
      _id
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation PasswordResetByAdmin($id: ObjectId!, $password: String!) {
    passwordResetByAdmin(id: $id, password: $password)
  }
`;
