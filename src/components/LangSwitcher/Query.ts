import gql from 'graphql-tag';

export const changeLanguageMutation = gql`
  mutation ChangeLanguage($locale: Language!) {
    changeLanguage(locale: $locale)
  }
`;
