import React from 'react';
import EditUser from '../../../forms/User/Profile';
import {useQuery} from '@apollo/react-hooks';
import {useSearchParams} from 'next/navigation';
import {currentUserQuery} from '../../../graphql/queries';

type Props = {};

const Profile: React.FC<Props> = (): JSX.Element => {
  const searchParams = useSearchParams();
  const {data} = useQuery(currentUserQuery);
  let _id: string = data && data.currentUser ? data.currentUser?._id : '';
  return !_id ? (
    <></>
  ) : (
    <EditUser
      id={_id}
      user={data?.currentUser?._id !== _id ? data?.currentUser : undefined}
      IsDlg={searchParams.get('IsDlg') === '1'}></EditUser>
  );
};

export default Profile;
