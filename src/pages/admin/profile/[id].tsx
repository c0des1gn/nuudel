import React from 'react';
import EditUser from '../../../forms/User/Profile';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import { currentUserQuery } from '../../../graphql/queries';

type Props = {};

const Profile: React.FC<Props> = (): JSX.Element => {
  const router = useRouter();
  const { data, error, loading } = useQuery(currentUserQuery);
  const { id, IsDlg } = router.query;
  let _id: string = id instanceof Array ? id[0] : id;
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
