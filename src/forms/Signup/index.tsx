import React, { FunctionComponent, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  TextField,
  Text,
  Container,
  Link,
  Box,
  Grid,
  Checkbox,
  Select,
  Upload,
  Switch,
} from 'nuudel-core';
import {
  IProps,
  initialValues,
  validateSchema,
  ISignUpFormValues,
  userType,
  Gender,
  Vehicle,
} from './types';
import gql from 'graphql-tag';
import { yupResolver } from '@hookform/resolvers/yup';
import styles from '../SignIn/styles.module.scss';
import {
  useMutation,
  useApolloClient,
  useLazyQuery,
} from '@apollo/react-hooks';
import { USER_TOKEN } from '../../config';
import { UI } from 'nuudel-core';
import { t } from '@Translate';
import { Message, TOGGLE_SNACKBAR_MUTATION } from 'nuudel-core';
import { onError } from 'nuudel-core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import {
  Avatar,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { dateToString } from 'nuudel-utils';
import { Copyright } from 'nuudel-core';
import { useRouter } from 'next/router';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { IWarehouse } from 'nuudel-core';
import { LIST_WAREHOUSE_QUERY } from '../User/UserQuery';

const { WEB } = process.env;

const ADD_USER = gql`
  mutation AddUser($data: UserInput!) {
    addUser(inputUser: $data) {
      _id
      firstname
      lastname
      email
      type
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

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    formState: { errors, isSubmitting, touchedFields },
    getValues,
    setError,
    watch,
    clearErrors,
  } = useForm<ISignUpFormValues>({
    resolver: yupResolver(validateSchema),
    //mode: 'onChange',
    defaultValues: initialValues,
  });

  const [listWarehouse, setListWarehouse] = useState([]);

  const [getWarehouses] = useLazyQuery<any, any>(LIST_WAREHOUSE_QUERY, {
    onCompleted: data => {
      setListWarehouse(data.getWarehouses.itemSummaries);
    },
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
            token: UI.getItem(USER_TOKEN),
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
            token: UI.getItem(USER_TOKEN),
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
      getWarehouses({
        variables: {
          skip: 0,
          take: 200,
          filter: '',
          sort: '',
          total: 0,
        },
      });
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
      _partner: data._partner || null,
    };
    return newData;
  };

  const submit = handleSubmit(async (formdata: any) => {
    let data = { ...formdata };
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
    <Container maxWidth="md">
      <Paper elevation={3} className={styles.paperStyle}>
        <Message />
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          className={styles.paddingBottom}
        >
          <Avatar className={styles.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <h3>{t('LetsGetStarted')}</h3>
        </Grid>
        <form>
          <Grid
            container
            justifyContent="flex-start"
            direction="row"
            spacing={3}
          >
            <Grid item sm={6} xs={12}>
              <TextField
                {...register('firstname')}
                label={t('Fistname')}
                placeholder={t('Fistname')}
                defaultValue={initialValues.firstname}
                type="text"
                //value={watch('firstname')}
                fullWidth
                required
                variant="outlined"
                margin="normal"
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
              <TextField
                {...register('lastname')}
                label={t('Lastname')}
                placeholder={t('Lastname')}
                defaultValue={initialValues.lastname}
                type="text"
                fullWidth
                required
                variant="outlined"
                margin="normal"
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
              <TextField
                {...register('username')}
                label={t('Username')}
                placeholder={t('Username')}
                defaultValue={initialValues.username}
                type="text"
                fullWidth
                required
                variant="outlined"
                margin="normal"
                InputProps=\{{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
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
              <TextField
                {...register('password')}
                label={t('Password')}
                placeholder={t('Password')}
                defaultValue={initialValues.password}
                type="password"
                fullWidth
                required
                variant="outlined"
                margin="normal"
                error={!!errors.password}
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                //textContentType="newPassword"
                helperText={errors?.password?.message}
                onChange={e => setChange('password', e.target.value)}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField
                {...register('email')}
                label={t('Email')}
                required
                placeholder={t('Email')}
                defaultValue={initialValues.email}
                type="email"
                fullWidth
                variant="outlined"
                margin="normal"
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
              <TextField
                {...register('mail')}
                label={t('ConfirmEmail')}
                placeholder={t('ConfirmEmail')}
                defaultValue={initialValues.mail}
                type="email"
                fullWidth
                variant="outlined"
                margin="normal"
                error={!!errors.mail}
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                helperText={errors?.mail?.message}
                onChange={e => setChange('mail', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Text variant="h6" component="h6">
                    {t('additional')}
                  </Text>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item sm={6} xs={12}>
                      <TextField
                        {...register('phone')}
                        label={t('user.phone')}
                        placeholder={t('user.phone')}
                        defaultValue={initialValues.phone}
                        type="text"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={!!errors.phone}
                        autoCorrect="off"
                        autoCapitalize="on"
                        spellCheck="false"
                        helperText={errors?.phone?.message}
                        onChange={e => setChange('phone', e.target.value)}
                      />
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <TextField
                        {...register('mobile')}
                        label={t('user.mobile')}
                        placeholder={t('user.mobile')}
                        defaultValue={initialValues.mobile}
                        type="text"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={!!errors.mobile}
                        autoCorrect="off"
                        autoCapitalize="on"
                        spellCheck="false"
                        //textContentType="givenName"
                        helperText={errors?.mobile?.message}
                        onChange={e => setChange('mobile', e.target.value)}
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <TextField
                        {...register('birthday')}
                        label={t('user.birthday')}
                        type="date"
                        placeholder={t('user.birthday')}
                        defaultValue={dateToString(
                          initialValues.birthday,
                          'YYYY-MM-DD',
                        )}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={!!errors.birthday}
                        helperText={errors?.birthday?.message}
                        onChange={e =>
                          setChange(
                            'birthday',
                            dateToString(e.target.value, 'YYYY-MM-DDTHH:mm:ss'),
                          )
                        }
                      />
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <FormControl variant="outlined" fullWidth margin="normal">
                        <InputLabel htmlFor="user-gender">
                          {t('user.gender')}
                        </InputLabel>
                        <Select
                          {...register('gender')}
                          label={t('user.gender')}
                          placeholder={t('user.gender')}
                          defaultValue={initialValues.gender}
                          error={!!errors.gender}
                          onChange={value => setChange('gender', value)}
                          renderValue={selected =>
                            !selected
                              ? ''
                              : t(selected, { defaultValue: selected })
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
                      <TextField
                        {...register('web')}
                        defaultValue={initialValues.web}
                        label={t('user.web')}
                        placeholder={'https://'}
                        type="url"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        error={!!errors.web}
                        onChange={e => setChange('web', e.target.value)}
                      />
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <TextField
                        {...register('about')}
                        label={t('user.about')}
                        placeholder={t('user.about')}
                        defaultValue={initialValues.about}
                        type="text"
                        fullWidth
                        multiline
                        minRows={2}
                        variant="outlined"
                        margin="normal"
                        error={!!errors.about}
                        autoCorrect="off"
                        autoCapitalize="on"
                        spellCheck="false"
                        helperText={errors?.about?.message}
                        onChange={e => setChange('about', e.target.value)}
                      />
                    </Grid>
                    <Grid item md={12} xs={12}>
                      <Box p={2}>
                        <Upload
                          uploaded={initialValues.avatar}
                          label={t('user.avatar')}
                          multiple={false}
                          onChange={value => setChange('avatar', value)}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
            {props.allowSignup && (
              <Grid
                container
                direction="row"
                alignItems="center"
                justifyContent="flex-end"
                className={styles.padding}
              >
                <Checkbox
                  //defaultChecked={false}
                  checked={!disabled}
                  onChange={e => {
                    setDisabled(!e.target.checked);
                  }}
                />
                <span>
                  {t('agree')}
                  <Link
                    target="_blank"
                    href={`${WEB}/term`}
                    className={styles.link}
                  >
                    {t('privacy policy') + ' '}
                  </Link>
                  {t('term')}
                </span>
              </Grid>
            )}
            <Grid container justifyContent="center" className={styles.padding}>
              <Button
                color="primary"
                disabled={isSubmitting || disabled}
                onClick={submit}
              >
                {isSubmitting ? t('loading') : t('CreateAnAccount')}
              </Button>
            </Grid>
          </Grid>
        </form>
        {props.allowSignup && (
          <Box mt={2} textAlign="right">
            {
              <>
                {t('Already have an account?')}{' '}
                <Link href="/admin/login" passHref>
                  {t('Log in')}
                </Link>
                .
              </>
            }
          </Box>
        )}
        <Box mt={10}>
          <Copyright />
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUpForm;
