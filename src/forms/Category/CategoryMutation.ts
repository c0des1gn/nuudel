import gql from 'graphql-tag';

export const CREATE_CATEGORY = gql`
  mutation AddCategory($data: CategoryInput) {
    addCategory(inputCategory: $data) {
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

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation EditCategory(
    $id: String!
    $name: String!
    $parent_id: String = null
    $slug: String!
    $img: ImageInput = null
    $hasChild: Boolean
    $ancestors: [String!]
  ) {
    editCategory(
      id: $id
      img: $img
      name: $name
      slug: $slug
      parent_id: $parent_id
      hasChild: $hasChild
      ancestors: $ancestors
    ) {
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

export const REMOVE_CATEGORY_MUTATION = gql`
  mutation RemoveCategory($id: String!) {
    removeCategory(id: $id) {
      _id
      cid
    }
  }
`;
