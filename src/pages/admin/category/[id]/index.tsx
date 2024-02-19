import React from 'react';
import {useParams} from 'next/navigation';
import EditCategory from '../../../../forms/Category/EditCategory';
import {ControlMode} from 'nuudel-utils';

type Props = {};

export const UpdateCategory: React.FC<Props> = () => {
  const query = useParams();
  const {id} = query || {};
  return !id ? (
    <></>
  ) : (
    <EditCategory
      formType={ControlMode.Edit}
      id={id instanceof Array ? id[0] : id}
    />
  );
};

export default UpdateCategory;
