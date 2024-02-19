import React from 'react';
import EditUser from '../../../forms/User/Profile';
import {useQuery} from '@apollo/react-hooks';
import {useParams, useSearchParams} from 'next/navigation';
import {currentUserQuery} from '../../../graphql/queries';

type Props = {};

const Profile: React.FC<Props> = (): JSX.Element => {
  const param = useParams(),
    searchParams = useSearchParams();
  let query: any = {...param};
  searchParams.forEach((value: string, key: string) => {
    query[key] = value;
  });
  const {data} = useQuery(currentUserQuery);
  const {id, IsDlg} = query;
  let _id: string = id instanceof Array ? id[0] : id;

  return !_id ? (
    <></>
  ) : (
    <EditUser
      id={_id}
      user={data?.currentUser?._id !== _id ? data?.currentUser : undefined}
      IsDlg={IsDlg === '1'}></EditUser>
  );
};

export default Profile;
