import React from 'react';
import { useRouter } from 'next/router';
import EditCategory from '../../../../forms/Category/EditCategory';
import { ControlMode } from 'nuudel-utils';

type Props = {};

export const updateCategory: React.FC<Props> = () => {
  const router = useRouter();
  const { id } = router.query;
  return !id ? (
    <></>
  ) : (
    <EditCategory
      formType={ControlMode.Display}
      id={id instanceof Array ? id[0] : id}
    />
  );
};

export default updateCategory;
