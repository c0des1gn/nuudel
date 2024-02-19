import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import * as Yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {useMutation} from '@apollo/react-hooks';
import {useRouter} from 'next/navigation';
import {
  passwordValidationSchema,
  oldPasswordvalidateSchema,
  requestPasswordResetFormSchema,
} from '../../forms/Signup/types';
import {
  requestResetPasswordMutation,
  changePasswordMutation,
} from '../../graphql/mutations';
import {PageProps} from '../_app';
import {Text, Container, Grid, TextField, Button} from 'nuudel-core';
import {t} from '@Translate';
import {Message, TOGGLE_SNACKBAR_MUTATION} from 'nuudel-core';
import styles from '../../forms/SignIn/styles.module.scss';
import {IconButton} from '@mui/material';
import {InputAdornment} from '@mui/material';

type ResetPasswordFormSchema = Yup.InferType<typeof passwordValidationSchema>;

const initialResetPasswordFormValues: ResetPasswordFormSchema | any = {
  password: '',
  confirmPassword: '',
  oldPassword: '',
};

type RequestPasswordResetFormSchema = Yup.InferType<
  typeof requestPasswordResetFormSchema
>;

const initialRequestPasswordResetFormValues:
  | RequestPasswordResetFormSchema
  | any = {
  email: '',
};

type Props = {} & PageProps;

const ResetPassword: React.FC<Props> = ({query}) => {
  const router = useRouter();
  const code = query && query.code ? query.code : undefined;
  const shouldDisplayResetPassword = query && query.code !== undefined;
  const {
    control,
    handleSubmit,
    reset,
    register,
    clearErrors,
    setValue,
    formState: {isSubmitting, errors, touchedFields},
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

  const [requestResetPassword, {loading: loadingRequestResetPassword}] =
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
  const [resetPassword, {loading: loadingResetPassword}] = useMutation(
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
    if (values?.email?.includes('@')) {
      const r = await requestResetPassword({
        variables: {
          email: values.email,
        },
      });
    }
  });

  return (
    <Container maxWidth="xs">
      <Message />
      {!shouldDisplayResetPassword ? (
        <div className={styles.paperStyle + ' ' + styles.border}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <div className={styles.flexRowCenter}>
                {/* <Avatar className={styles.marginRight}>
                <LockOutlinedIcon />
              </Avatar> */}
                <Text
                  sx={theme => ({
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                  })}
                  variant="h5">
                  {t('Forgot password')}
                </Text>
              </div>
            </Grid>
            <Grid item xs={12}>
              <form
                onSubmit={handleResetPasswordRequest}
                className={styles.container}>
                <div id="request-reset-password">
                  <Text variant="subtitle2">
                    {t(
                      'Enter your email in order to receive a link to reset your password',
                    )}
                  </Text>
                  <TextField
                    {...register('email')}
                    onChange={e => setChange('email', e.target.value)}
                    id="email"
                    placeholder={t('Email Address')}
                    name="email"
                    variant="outlined"
                    size="small"
                    required
                    fullWidth
                    margin="dense"
                    inputProps=\{{
                      maxLength: 128,
                    }}
                    //value={initialRequestPasswordResetFormValues.email}
                    autoComplete="email"
                    autoFocus
                    error={errors.email ? true : false}
                    helperText={
                      errors.email !== undefined && touchedFields?.email
                        ? (errors.email?.message as string)
                        : ''
                    }
                  />
                  <div className={styles.marginTop}>
                    <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                      fullWidth
                      disableElevation
                      style=\{{borderRadius: '20px'}}
                      //className={styles.marginTopBig}
                      disabled={isSubmitting || loadingRequestResetPassword}>
                      {loadingRequestResetPassword ? (
                        <Text variant="subtitle2">{t('loading')}</Text>
                      ) : (
                        <Text variant="subtitle2">{t('Reset password')}</Text>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Grid>
            <Grid item xs={12}>
              <Button
                disableElevation
                variant="outlined"
                color="primary"
                fullWidth
                style=\{{borderRadius: '20px'}}
                onClick={() => router.push('/admin/login')}>
                <Text variant="subtitle2">{t('Go back to Login')}</Text>
              </Button>
            </Grid>
          </Grid>
        </div>
      ) : (
        <div className={styles.paperStyle + ' ' + styles.border}>
          <Grid container direction="column" spacing={3}>
            <Grid item xs={12}>
              <div className={styles.flexRowCenter}>
                {/* <Avatar className={styles.marginRight}>
                <LockOutlinedIcon />
              </Avatar> */}
                <Text variant="h5" style=\{{fontWeight: 500}}>
                  {t('Reset password')}
                </Text>
              </div>
            </Grid>
            <Grid item xs={12}>
              <Text color="primary" variant="subtitle2" align="center">
                {t('Set a new password for your account')}
              </Text>
            </Grid>
            <Grid item xs={12}>
              <form onSubmit={handleResetPassword} className={styles.container}>
                <div id={'reset-password'}>
                  {code === 'reset' && (
                    <>
                      <p className={styles.label}>{t('Old password')}</p>
                      <TextField
                        {...register('oldPassword')}
                        variant="outlined"
                        size="small"
                        margin="dense"
                        required
                        onChange={e => setChange('oldPassword', e.target.value)}
                        fullWidth
                        defaultValue={
                          initialResetPasswordFormValues.oldPassword
                        }
                        name="oldPassword"
                        inputProps=\{{
                          maxLength: 40,
                        }}
                        placeholder={t('Old password')}
                        type="password"
                        id="oldPassword"
                        error={!!errors.oldPassword}
                        autoComplete="current-password"
                        helperText={errors.oldPassword?.message as string}
                      />
                    </>
                  )}
                  <p className={styles.label + ' ' + styles.paddingTop}>
                    {t('Password')}
                  </p>
                  <TextField
                    {...register('password')}
                    variant="outlined"
                    size="small"
                    margin="dense"
                    required
                    onChange={e => setChange('password', e.target.value)}
                    fullWidth
                    defaultValue={initialResetPasswordFormValues.password}
                    name="password"
                    placeholder={t('Password')}
                    type={!showPassword ? 'password' : 'text'}
                    id="password"
                    InputProps=\{{
                      inputProps: {
                        maxLength: 30,
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}>
                            {!showPassword ? (
                              <i className="icon-eye" />
                            ) : (
                              <i className="icon-closed-eye" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.password}
                    autoComplete="new-password"
                    helperText={errors.password?.message as string}
                  />
                  <p className={styles.label + ' ' + styles.paddingTop}>
                    {t('Confirm password')}
                  </p>
                  <TextField
                    {...register('confirmPassword')}
                    onChange={e => setChange('confirmPassword', e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    margin="dense"
                    required
                    defaultValue={
                      initialResetPasswordFormValues.confirmPassword
                    }
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder={t('Confirm password')}
                    type={!showConfirmPassword ? 'password' : 'text'}
                    InputProps=\{{
                      inputProps: {
                        maxLength: 30,
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickConfirmPassword}
                            onMouseDown={handleMouseDownPassword}>
                            {!showConfirmPassword ? (
                              <i className="icon-eye" />
                            ) : (
                              <i className="icon-closed-eye" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message as string}
                  />
                  <div className={styles.marginTop}>
                    <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                      fullWidth
                      disableElevation
                      style=\{{borderRadius: '20px', height: 40}}
                      disabled={isSubmitting || loadingResetPassword}>
                      {loadingRequestResetPassword ? (
                        <Text variant="subtitle2">{t('loading')}</Text>
                      ) : (
                        <Text variant="subtitle2">{t('Set new password')}</Text>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" onClick={() => router.back()}>
                {t('Go back to Login')}
              </Button>
            </Grid>
          </Grid>
        </div>
      )}
    </Container>
  );
};

export default ResetPassword;
