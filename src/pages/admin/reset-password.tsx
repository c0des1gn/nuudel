import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import {
  passwordValidationSchema,
  oldPasswordvalidateSchema,
} from '../../forms/Signup/types';
import {
  requestResetPasswordMutation,
  changePasswordMutation,
} from '../../graphql/mutations';
import { PageProps } from '../_app';
import { Paper, Avatar } from '@material-ui/core';
import {
  Button,
  Text,
  Container,
  Grid,
  TextField,
  Box,
  Link,
} from 'nuudel-core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { t } from '@Translate';
import { Message, TOGGLE_SNACKBAR_MUTATION } from 'nuudel-core';
import styles from '../../forms/SignIn/styles.module.scss';
import IconButton from '@material-ui/core/IconButton';
import { InputAdornment } from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

type ResetPasswordFormSchema = Yup.InferType<typeof passwordValidationSchema>;

const initialResetPasswordFormValues: ResetPasswordFormSchema | any = {
  password: '',
  confirmPassword: '',
  oldPassword: '',
};

const requestPasswordResetFormSchema = Yup.object().shape({
  email: Yup.string()
    .required(t('Email is required'))
    .email(t('Email is invalid')),
});

type RequestPasswordResetFormSchema = Yup.InferType<
  typeof requestPasswordResetFormSchema
>;

const initialRequestPasswordResetFormValues:
  | RequestPasswordResetFormSchema
  | any = {
  email: '',
};

type Props = {} & PageProps;

const ResetPassword: React.FC<Props> = ({ query }) => {
  const router = useRouter();
  //const classes = useStyles();
  const code = query && query.code ? query.code : undefined;
  const shouldDisplayResetPassword = query && query.code !== undefined;
  const {
    control,
    handleSubmit,
    reset,
    register,
    clearErrors,
    setValue,
    formState: { isSubmitting, errors, touchedFields },
  } = useForm<any>({
    resolver: yupResolver(
      shouldDisplayResetPassword
        ? code === 'reset'
          ? passwordValidationSchema.concat(oldPasswordvalidateSchema)
          : passwordValidationSchema
        : requestPasswordResetFormSchema,
    ),
    defaultValues: shouldDisplayResetPassword
      ? initialResetPasswordFormValues
      : initialRequestPasswordResetFormValues,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  const [messageMutation] = useMutation(TOGGLE_SNACKBAR_MUTATION);

  const [requestResetPassword, { loading: loadingRequestResetPassword }] =
    useMutation(requestResetPasswordMutation, {
      onError: error => {
        messageMutation({
          variables: {
            msg: error.graphQLErrors[0]?.message || t('Error'),
            type: 'error',
          },
        });
      },
      onCompleted: () => {
        messageMutation({
          variables: {
            msg: t('You should receive a password reset link in your email'),
            type: 'success',
          },
        });
        router.push('/admin/login');
      },
    });
  const [resetPassword, { loading: loadingResetPassword }] = useMutation(
    changePasswordMutation,
    {
      onError: error => {
        messageMutation({
          variables: {
            msg: error.graphQLErrors[0]?.message || t('Error'),
            type: 'error',
          },
        });
      },
      onCompleted: (data: any) => {
        if (data && data.resetPassword) {
          messageMutation({
            variables: {
              msg: t('Your password has been successfully updated'),
              type: 'success',
            },
          });
          router.push('/admin/login');
        } else {
          messageMutation({
            variables: {
              msg: t('Your password has been unsuccessfully updated'),
              type: 'error',
            },
          });
        }
        reset(initialResetPasswordFormValues);
      },
    },
  );

  const setChange = (name: any, value: any) => {
    if (!!errors[name]) {
      clearErrors(name);
    }
    setValue(name, value);
  };

  const handleResetPassword = handleSubmit(async values => {
    await resetPassword({
      variables: {
        password: values.password,
        confirmPassword: values.confirmPassword,
        token: code,
        oldPassword: values.oldPassword || undefined,
      },
    });
  });

  const handleResetPasswordRequest = handleSubmit(async values => {
    if (values?.email) {
      await requestResetPassword({
        variables: {
          email: values.email,
        },
      });
    }
  });

  return (
    <Container maxWidth="sm">
      <Message />
      {!shouldDisplayResetPassword ? (
        <Paper elevation={3} className={styles.paperStyle}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            className={styles.paddingBottom}
          >
            <Avatar className={styles.avatar + ' ' + styles.inlineBlock}>
              <LockOutlinedIcon />
            </Avatar>
            <Text variant="h5" className={styles.inlineBlock}>
              {t('Forgot password')}
            </Text>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <form
                onSubmit={handleResetPasswordRequest}
                className={styles.container}
              >
                <div id="request-reset-password">
                  <Text color="primary" component="div">
                    {t(
                      'Enter your email in order to receive a link to reset your password',
                    )}
                  </Text>
                  <TextField
                    {...register('email')}
                    onChange={e => setChange('email', e.target.value)}
                    id="email"
                    label={t('Email Address')}
                    name="email"
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    //value={initialRequestPasswordResetFormValues.email}
                    autoComplete="email"
                    autoFocus
                    error={errors.email ? true : false}
                    helperText={
                      errors.email !== undefined && touchedFields.email
                        ? errors.email?.message
                        : ''
                    }
                  />
                  <Box mt={2}>
                    <Button
                      type="submit"
                      fullWidth
                      color="primary"
                      //className={styles.marginTopBig}
                      disabled={loadingRequestResetPassword}
                    >
                      {loadingRequestResetPassword ? (
                        <span>{t('loading')}</span>
                      ) : (
                        <span>{t('Reset password')}</span>
                      )}
                    </Button>
                  </Box>
                </div>
              </form>
            </Grid>
            <Grid item xs={12}>
              <Link href="/admin/login" passHref>
                {'⬅ ' + t('Go back to Login')}
              </Link>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <div className={styles.paperStyle}>
          <Grid container direction="column" spacing={3}>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              className={styles.paddingBottom}
            >
              <Avatar className={styles.avatar + ' ' + styles.inlineBlock}>
                <LockOutlinedIcon />
              </Avatar>
              <Text component="h1" variant="h5">
                {t('Reset password')}
              </Text>
              <Text color="primary" component="h1" variant="body1">
                <p>{t('Set a new password for your account')}</p>
              </Text>
            </Grid>
            <Grid item xs={12}>
              <form onSubmit={handleResetPassword} className={styles.container}>
                <Grid container id={'reset-password'}>
                  {code === 'reset' && (
                    <TextField
                      {...register('oldPassword')}
                      margin="normal"
                      variant="outlined"
                      required
                      onChange={e => setChange('oldPassword', e.target.value)}
                      fullWidth
                      defaultValue={initialResetPasswordFormValues.oldPassword}
                      name="oldPassword"
                      label={t('Old password')}
                      type="password"
                      id="oldPassword"
                      error={!!errors.oldPassword}
                      autoComplete="current-password"
                      helperText={errors.oldPassword?.message}
                    />
                  )}
                  <TextField
                    {...register('password')}
                    margin="normal"
                    variant="outlined"
                    required
                    onChange={e => setChange('password', e.target.value)}
                    fullWidth
                    defaultValue={initialResetPasswordFormValues.password}
                    name="password"
                    label={t('Password')}
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                          >
                            {!showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.password}
                    autoComplete="new-password"
                    helperText={errors.password?.message}
                  />
                  <TextField
                    {...register('confirmPassword')}
                    onChange={e => setChange('confirmPassword', e.target.value)}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    required
                    defaultValue={
                      initialResetPasswordFormValues.confirmPassword
                    }
                    name="confirmPassword"
                    id="confirmPassword"
                    label={t('Confirm password')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickConfirmPassword}
                            onMouseDown={handleMouseDownPassword}
                          >
                            {!showConfirmPassword ? (
                              <Visibility />
                            ) : (
                              <VisibilityOff />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                  <Box mt={2}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || loadingResetPassword}
                    >
                      {loadingRequestResetPassword ? (
                        <span>{t('loading')}</span>
                      ) : (
                        <span>{t('Set new password')}</span>
                      )}
                    </Button>
                  </Box>
                </Grid>
              </form>
            </Grid>
            <Grid item xs={12}>
              <Link href="/admin/login" passHref>
                {'⬅ ' + t('Go back to Login')}
              </Link>
            </Grid>
          </Grid>
        </div>
      )}
    </Container>
  );
};

export default ResetPassword;
