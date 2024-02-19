import React, {useState, useEffect} from 'react';
import {Grid} from '@mui/material';
import {Spinner, Container, Text} from 'nuudel-core';
import {ICurrentUser} from 'nuudel-core';
import {closeDialog} from 'nuudel-utils';
import {useQuery} from '@apollo/react-hooks';
import styles from './styles.module.scss';
import {userInfoQuery} from '../../graphql/queries';

export const initialValues = {
  firstname: '',
  lastname: '',
  username: '',
  phone: null,
  mobile: null,
  avatar: {uri: ''},
  type: 'User',
  email: '',
};

interface IProps {
  id: string;
  IsDlg?: boolean;
}

const Persona: React.FC<IProps> = ({...props}) => {
  const {
    data = {userInfo: initialValues},
    error,
    loading,
  } = useQuery(userInfoQuery, {
    variables: {_id: props.id},
    skip: !props.id,
  });

  const {userInfo} = data;

  return (
    <Container maxWidth="lg">
      <Grid container spacing={1}>
        {/* Persona */}
        <Grid item xs={12} sm={12} md={12}>
          <div
            className={
              styles.flexRow +
              ' ' +
              styles.alignCenter +
              ' ' +
              styles.marginBtm3
            }>
            <div className={styles.paddingRight}>
              {!userInfo?.avatar?.uri ? (
                <i className={`icon-user`} style=\{{fontSize: 32}} />
              ) : (
                <img
                  src={userInfo.avatar?.uri}
                  width={'50px'}
                  height={'50px'}
                />
              )}
            </div>
            <div>
              {
                <Text>
                  <span style=\{{fontWeight: 500}} title={userInfo.username}>
                    {[userInfo.lastname, userInfo.firstname]
                      .filter(Boolean)
                      .join(' ')}
                  </span>
                  {' - ' + userInfo.type}
                </Text>
              }
              <Text className={styles.subtitle}>
                {[userInfo.phone, userInfo.mobile, userInfo.email]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </div>
          </div>
        </Grid>
      </Grid>
      {loading && <Spinner overflowHide color="inherit" />}
    </Container>
  );
};

export default Persona;
