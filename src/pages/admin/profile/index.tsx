import React from 'react';
import EditUser from '../../../forms/User/Profile';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { currentUserQuery } from '../../../graphql/queries';

type Props = {};

const Profile: React.FC<Props> = (): JSX.Element => {
  const router = useRouter();
  const { data, error, loading } = useQuery(currentUserQuery);
  let _id: string = data && data.currentUser ? data.currentUser._id : '';
  const { IsDlg } = router.query;
  let isDlg: string = IsDlg instanceof Array ? IsDlg[0] : IsDlg;
  return !_id ? (
    <></>
  ) : (
    <EditUser
      id={_id}
      user={data?.currentUser?._id !== _id ? data?.currentUser : undefined}
      IsDlg={isDlg === '1'}
    ></EditUser>
  );
};

export default Profile;
