import { GetStaticPaths } from 'next';
import { ControlMode, Permission } from 'nuudel-utils';
import { Form } from './index';

export const getStaticProps = async () => {
  return {
    props: { formType: ControlMode.Display, permission: Permission.Read },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export default Form;
