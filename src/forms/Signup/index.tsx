import React, {FunctionComponent, useState, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {
  Button,
  Text,
  Container,
  Link,
  Grid,
  Checkbox,
  Select,
  Upload,
} from 'nuudel-core';
import {
  IProps,
  initialValues,
  validateSchema,
  ISignUpFormValues,
  userType,
  Gender,
} from './types';
import gql from 'graphql-tag';
import {yupResolver} from '@hookform/resolvers/yup';
import styles from '../SignIn/styles.module.scss';
import {useMutation, useApolloClient, useLazyQuery} from '@apollo/react-hooks';
import {USER_TOKEN} from '../../config';
import {UI} from 'nuudel-core';
import {t} from '@Translate';
import {Message, TOGGLE_SNACKBAR_MUTATION} from 'nuudel-core';
import {onError} from 'nuudel-core';
import {FormControl, InputAdornment, Box} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {dateToString, getHash} from 'nuudel-utils';
import {Copyright} from 'nuudel-core';
import {useRouter} from 'next/navigation';
import TextField from '@mui/material/TextField';

const ADD_USER = gql`
  mutation AddUser($data: UserInput!) {
    addUser(inputUser: $data) {
      _id
      firstname
      lastname
      email
      phone
      mobile
      avatar
      gender
      birthday
      about
      web
    }
  }
`;

export const EMAIL_AVAILABLE = gql`
  query Available($email: String!, $token: String!) {
    available(email: $email, token: $token)
  }
`;

export const USERNAME_AVAILABLE = gql`
  query Possible($username: String!, $token: String!) {
    possible(username: $username, token: $token)
  }
`;

const SignUpForm: FunctionComponent<IProps> = (props: IProps) => {
  const router = useRouter();
  const client = useApolloClient();
  const [disabled, setDisabled] = useState(props.allowSignup);
  const [type, setType] = useState(initialValues.type);
  const [showPass, setShowPass] = useState(false);

  const handleClickShowPassword = () => {
    setShowPass(!showPass);
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    formState: {errors, isSubmitting, touchedFields},
    getValues,
    setError,
    clearErrors,
  } = useForm<ISignUpFormValues>({
    resolver: yupResolver(validateSchema),
    //mode: 'onChange',
    defaultValues: initialValues,
  });

  const [messageMutation] = useMutation(TOGGLE_SNACKBAR_MUTATION);

  let debounce: any = undefined;
  let _debounce: any = undefined;

  const checkUsername = username => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      client
        .query<any, any>({
          query: USERNAME_AVAILABLE,
          variables: {
            username: username.trim().toLowerCase(),
            token: getHash() || (await UI.getItem(USER_TOKEN)),
          },
        })
        .then(r => {
          if (r && !r.data.possible) {
            setError('username', {
              type: 'manual',
              message: t('UsernameNotAvailable'),
            });
          }
        });
    }, 2000);
  };

  const checkEmail = email => {
    clearTimeout(_debounce);
    _debounce = setTimeout(async () => {
      client
        .query<any, any>({
          query: EMAIL_AVAILABLE,
          variables: {
            email: email.trim().toLowerCase(),
            token: getHash() || (await UI.getItem(USER_TOKEN)),
          },
        })
        .then(r => {
          if (r && !r.data.available) {
            setError('email', {
              type: 'manual',
              message: t('EmailAlreadyExists'),
            });
          }
        });
    }, 2000);
  }; // */

  useEffect(() => {
    if (!props.allowSignup) {
    }
    //function cleanup()
    return () => {
      clearTimeout(debounce);
      clearTimeout(_debounce);
    };
  }, []);

  const setChange = (name: any, value: any) => {
    if (!!errors[name]) {
      clearErrors(name);
    }
    setValue(name, value);
  };

  const getUsedFields = (data: any) => {
    const newData = {
      username: data.username.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
      firstname: data.firstname,
      lastname: data.lastname,
      password: data.password,
      phone: data.phone,
      mobile: data.mobile,
      gender: data.gender,
      avatar: data.avatar,
      type: data.type,
      web: data.web,
      about: data.about,
      birthday: data.birthday,
    };
    return newData;
  };

  const submit = handleSubmit(async (formdata: any) => {
    let data = {...formdata};
    delete data.mail;
    delete data.check;
    try {
      const r = await client.mutate<any, any>({
        mutation: ADD_USER,
        variables: {
          data: getUsedFields(data),
        },
      });
      if (r) {
        messageMutation({
          variables: {
            msg: t('AccountCreated'),
            type: 'success',
          },
        });
        setTimeout(() => {
          if (props.allowSignup) {
            router.push('/admin/login');
          } else {
            //clearErrors();
            reset(initialValues);
          }
        }, 1000);
      }
    } catch (e) {
      messageMutation({
        variables: {
          msg: onError(e),
          type: 'error',
        },
      });
    }
  });
  return (
    <>
      <Container maxWidth="md">
        <div className={styles.paperStyle + ' ' + styles.border}>
          <Message />
          <div className={styles.flexRowCenter + ' ' + styles.paddingBottom}>
            <h3 className={styles.title}>{t('LetsGetStarted')}</h3>
          </div>
          <form>
            <Grid
              container
              justifyContent="flex-start"
              direction="row"
              spacing={2}>
              <Grid item sm={6} xs={12}>
                {/* <p className={styles.label}>{t('Firstname')}</p> */}
                <TextField
                  {...register('firstname')}
                  label={t('Firstname')}
                  placeholder={t('Firstname')}
                  defaultValue={initialValues.firstname}
                  type="text"
                  inputProps=\{{maxLength: 60}}
                  fullWidth
                  size="small"
                  margin="normal"
                  required
                  variant="outlined"
                  error={!!errors.firstname}
                  autoCorrect="off"
                  autoCapitalize="on"
                  spellCheck="false"
                  //textContentType="givenName"
                  helperText={errors?.firstname?.message}
                  onChange={e => setChange('firstname', e.target.value)}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                {/* <p className={styles.label}>{t('Lastname')}</p> */}
                <TextField
                  {...register('lastname')}
                  label={t('Lastname')}
                  placeholder={t('Lastname')}
                  defaultValue={initialValues.lastname}
                  type="text"
                  inputProps=\{{maxLength: 60}}
                  fullWidth
                  size="small"
                  margin="normal"
                  variant="outlined"
                  error={!!errors.lastname}
                  autoCorrect="off"
                  autoCapitalize="on"
                  spellCheck="false"
                  //textContentType="familyName"
                  helperText={errors?.lastname?.message}
                  onChange={e => setChange('lastname', e.target.value)}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                {/* <p className={styles.label}>{t('Username')}</p> */}
                <TextField
                  {...register('username')}
                  label={t('Username')}
                  placeholder={t('Username')}
                  defaultValue={initialValues.username}
                  type="text"
                  fullWidth
                  size="small"
                  margin="normal"
                  required
                  variant="outlined"
                  InputProps=\{{
                    inputProps: {
                      maxLength: 35,
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        <i
                          className="icon-user-1"
                          style=\{{fontSize: '16px', lineHeight: 1}}
                        />
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.username}
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  helperText={errors?.username?.message}
                  onChange={e => {
                    setChange('username', e.target.value);
                    if (!!e.target.value && !(errors && errors['username'])) {
                      checkUsername(e.target.value);
                    }
                  }}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                {/* <p className={styles.label}>{t('Password')}</p> */}
                <TextField
                  {...register('password')}
                  label={t('Password')}
                  placeholder={t('Password')}
                  defaultValue={initialValues.password}
                  type={showPass ? 'text' : 'password'}
                  inputProps=\{{maxLength: 30}}
                  fullWidth
                  size="small"
                  margin="normal"
                  required
                  variant="outlined"
                  error={!!errors.password}
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  //textContentType="newPassword"
                  helperText={errors?.password?.message}
                  onChange={e => setChange('password', e.target.value)}
                  InputProps=\{{
                    className: styles.loginInput,
                    inputProps: {
                      maxLength: 30,
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <button
                          type="button"
                          className={styles.visibilityBtn}
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}>
                          {!showPass ? (
                            <i
                              className="icon-eye"
                              style=\{{fontSize: '20px', lineHeight: 1}}
                            />
                          ) : (
                            <i
                              className="icon-closed-eye"
                              style=\{{fontSize: '20px', lineHeight: 1}}
                            />
                          )}
                        </button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                {/* <p className={styles.label}>{t('Email')}</p> */}
                <TextField
                  {...register('email')}
                  required
                  label={t('Email')}
                  placeholder={t('Email')}
                  defaultValue={initialValues.email}
                  type="email"
                  inputProps=\{{maxLength: 100, inputMode: 'email'}}
                  fullWidth
                  size="small"
                  margin="normal"
                  variant="outlined"
                  error={!!errors.email}
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  helperText={errors?.email?.message}
                  onChange={e => {
                    setChange('email', e.target.value);
                    if (!!e.target.value && !(errors && errors['email'])) {
                      checkEmail(e.target.value);
                    }
                  }}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                {/* <p className={styles.label}>{t('ConfirmEmail')}</p> */}
                <TextField
                  {...register('mail')}
                  label={t('ConfirmEmail')}
                  placeholder={t('ConfirmEmail')}
                  defaultValue={initialValues.mail}
                  type="email"
                  inputProps=\{{maxLength: 100, inputMode: 'email'}}
                  fullWidth
                  size="small"
                  margin="normal"
                  variant="outlined"
                  error={!!errors.mail}
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  helperText={errors?.mail?.message}
                  onChange={e => setChange('mail', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <div className={styles.marginTop}>
                  <Grid container spacing={2}>
                    <Grid item sm={6} xs={12}>
                      {/* <p className={styles.label}>{t('user.phone')}</p> */}
                      <TextField
                        {...register('phone')}
                        label={t('user.phone')}
                        placeholder={t('user.phone')}
                        defaultValue={initialValues.phone}
                        type="text"
                        inputProps=\{{maxLength: 13, inputMode: 'tel'}}
                        fullWidth
                        size="small"
                        margin="normal"
                        variant="outlined"
                        error={!!errors.phone}
                        autoCorrect="off"
                        autoCapitalize="on"
                        spellCheck="false"
                        helperText={errors?.phone?.message}
                        onChange={e => setChange('phone', e.target.value)}
                      />
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      {/* <p className={styles.label}>{t('user.mobile')}</p> */}
                      <TextField
                        {...register('mobile')}
                        label={t('user.mobile')}
                        placeholder={t('user.mobile')}
                        defaultValue={initialValues.mobile}
                        type="text"
                        inputProps=\{{maxLength: 13, inputMode: 'tel'}}
                        fullWidth
                        size="small"
                        margin="normal"
                        variant="outlined"
                        error={!!errors.mobile}
                        autoCorrect="off"
                        autoCapitalize="on"
                        spellCheck="false"
                        helperText={errors?.mobile?.message}
                        onChange={e => setChange('mobile', e.target.value)}
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      {/* <p className={styles.label}>{t('user.birthday')}</p> */}
                      <TextField
                        {...register('birthday')}
                        type="date"
                        placeholder={t('user.birthday')}
                        label={t('user.birthday')}
                        defaultValue={dateToString(
                          initialValues.birthday,
                          'YYYY-MM-DD',
                        )}
                        fullWidth
                        size="small"
                        margin="normal"
                        variant="outlined"
                        error={!!errors.birthday}
                        helperText={errors?.birthday?.message}
                        onChange={e =>
                          setChange(
                            'birthday',
                            dateToString(e.target.value, 'YYYY-MM-DD'),
                          )
                        }
                        InputLabelProps=\{{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <FormControl
                        variant="outlined"
                        fullWidth
                        size="small"
                        margin="normal">
                        <InputLabel id="gender-select-label">
                          {t('user.gender')}
                        </InputLabel>
                        <Select
                          {...register('gender')}
                          placeholder={t('user.gender')}
                          label={t('user.gender')}
                          defaultValue={initialValues.gender}
                          error={!!errors.gender}
                          onChange={value => setChange('gender', value)}
                          renderValue={selected =>
                            !selected
                              ? ''
                              : t(selected, {defaultValue: selected})
                          }
                          inputProps=\{{
                            id: 'user-gender',
                          }}
                          options={Gender.map(c => ({
                            value: c,
                            label: t(c),
                          }))}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item md={6} xs={12}>
                      {/* <p className={styles.label}>{t('user.web')}</p> */}
                      <TextField
                        {...register('web')}
                        label={t('user.web')}
                        defaultValue={initialValues.web}
                        placeholder={'https://'}
                        type="url"
                        inputProps=\{{maxLength: 255, inputMode: 'url'}}
                        fullWidth
                        size="small"
                        margin="normal"
                        variant="outlined"
                        error={!!errors.web}
                        autoCorrect="off"
                        autoCapitalize="on"
                        spellCheck="false"
                        helperText={errors?.web?.message}
                        onChange={e => setChange('web', e.target?.value)}
                      />
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      {/* <p className={styles.label}>{t('user.about')}</p> */}
                      <TextField
                        {...register('about')}
                        label={t('user.about')}
                        placeholder={t('user.about')}
                        defaultValue={initialValues.about}
                        type="text"
                        inputProps=\{{maxLength: 1024}}
                        fullWidth
                        size="small"
                        margin="normal"
                        multiline
                        minRows={2}
                        maxRows={8}
                        variant="outlined"
                        error={!!errors.about}
                        autoCorrect="off"
                        autoCapitalize="on"
                        spellCheck="false"
                        helperText={errors?.about?.message}
                        onChange={e => setChange('about', e.target?.value)}
                      />
                    </Grid>
                    <Grid item md={12} xs={12}>
                      <div className={styles.padding}>
                        <Upload
                          uploaded={initialValues.avatar}
                          label={t('user.avatar')}
                          multiple={false}
                          onChange={value => setChange('avatar', value)}
                        />
                      </div>
                    </Grid>
                  </Grid>
                </div>
              </Grid>
              {props.allowSignup && (
                <Box
                  sx={theme => ({
                    padding: theme.spacing(2),
                    display: 'flex',
                    alignItems: 'center',
                  })}>
                  <Checkbox
                    style=\{{marginRight: '5px'}}
                    //defaultChecked={false}
                    color="primary"
                    checked={!disabled}
                    onChange={e => {
                      setDisabled(!e.target.checked);
                    }}
                  />
                  <span className={styles.text}>
                    {t('agree')}
                    <Link
                      target="_blank"
                      href={`${process?.env?.NEXT_PUBLIC_WEB || ''}/term`}>
                      {t('Terms of service') + ' '}
                    </Link>
                    {t('term')}
                  </span>
                </Box>
              )}
              <Grid
                container
                justifyContent="center"
                className={styles.padding}>
                <Button
                  color="primary"
                  disabled={isSubmitting || disabled}
                  onClick={submit}>
                  {isSubmitting ? t('loading') : t('CreateAnAccount')}
                </Button>
              </Grid>
            </Grid>
          </form>
          {props.allowSignup && (
            <div className={styles.termBox + ' ' + styles.text}>
              {
                <>
                  {t('Already have an account?')}{' '}
                  <Link href="/admin/login">{t('Log in')}</Link>.
                </>
              }
            </div>
          )}
        </div>
      </Container>
      <Container maxWidth="lg" sx=\{{paddingBottom: '5px'}}>
        <Copyright />
      </Container>
    </>
  );
};

export default SignUpForm;
