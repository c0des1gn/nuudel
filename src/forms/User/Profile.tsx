import React, {useState, useEffect} from 'react';
import {Grid, FormControl, InputLabel} from '@mui/material';
import {
  TextField,
  Upload,
  Spinner,
  Select,
  Container,
  Text,
  Button,
  Box,
} from 'nuudel-core';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {useRouter} from 'next/navigation';
import {useMutation, useLazyQuery} from '@apollo/react-hooks';
import {Message, TOGGLE_SNACKBAR_MUTATION} from 'nuudel-core';
import {UPDATE_USER_MUTATION} from './UserMutation';
import {userType} from '../Signup/types';
import {GET_USER_QUERY} from './UserQuery';
import {t} from '@Translate';
import {dateToString, closeDialog, dateToISOString} from 'nuudel-utils';
import styles from '../../theme/styles/styles.module.scss';
import {Gender} from '../Signup/types';
import {ICurrentUser} from 'nuudel-core';
import {COLORS} from '../../theme/variables/palette';

interface EditUserForm {
  username?: string;
  firstname: string;
  lastname: string;
  phone: string;
  mobile: string;
  birthday: Date | string;
  about: string;
  avatar: any;
  web: string;
  gender: string;
  type: string;
  email: string;
}

export const initialValues = {
  firstname: '',
  lastname: '',
  phone: null,
  mobile: null,
  birthday: new Date(),
  about: '',
  web: '',
  avatar: {uri: ''},
  gender: 'Male',
  type: 'User',
  email: '',
};

const required: string = 'Заавал';
const min: string = t('min length') || 'Хамгийн багадаа:';
const max: string = t('max length') || 'Хамгийн ихдээ:';

const userSchema: Yup.SchemaOf<EditUserForm> = Yup.object().shape({
  username: Yup.string().notRequired(),
  firstname: Yup.string()
    .required(t('required') || required)
    .max(60, max + '60'),
  lastname: Yup.string().max(60),
  phone: Yup.string()
    .matches(/^[0-9\s\(\)\-\+\*\#\,]+$/, t('number only') || 'Утасны дугаар')
    .min(8, min + '8')
    .max(13),
  mobile: Yup.string()
    .matches(
      /^(?:[0-9\s\(\)\-\+\*\#\,]+)?$/,
      t('number only') || 'Утасны дугаар',
    )
    .max(13),
  gender: Yup.string(),
  birthday: Yup.date(), // yup.date().min(yup.ref('start'))
  about: Yup.string().max(250),
  web: Yup.string()
    .nullable()
    .trim()
    .notRequired()
    .matches(
      /^((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))?$/g,
      t('Enter a valid url'),
    ),
  avatar: Yup.object().shape({uri: Yup.string()}),
  type: Yup.string(),
  email: Yup.string().matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/),
});

interface IProps {
  user?: ICurrentUser;
  id: string;
  editdata?: EditUserForm;
  IsDlg?: boolean;
}

const EditUser: React.FC<IProps> = ({...props}) => {
  const router = useRouter();
  const {
    editdata = initialValues,
    //formType = ControlMode.Edit,
    //permission = Permission.Edit,
  } = props;
  const [loading, setLoading] = useState(true);

  if (!props.id) {
    router.push('/admin/signin');
  }

  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    getValues,
    formState: {isSubmitting, errors, touchedFields},
  } = useForm<EditUserForm>({
    resolver: yupResolver(userSchema),
    defaultValues: editdata,
  });
  const [formValues, setFormValues] = useState(editdata as EditUserForm);
  const [type, setType] = useState(editdata?.type || '');

  const onSubmit = handleSubmit(values => {
    editTheUser(values, reset);
    //setDisabled(true);
  });

  const [disabled, setDisabled] = useState(false);

  const [getItem] = useLazyQuery<any, any>(GET_USER_QUERY, {
    onCompleted: data => {
      if (data) {
        setType(data.getUser.type);
        let newDate: EditUserForm = getUsedFields(data.getUser);
        reset({
          ...newDate,
          birthday: dateToString(newDate.birthday, 'YYYY-MM-DD'),
        });
        setFormValues(newDate);
      }
    },
  });

  const getUsedFields = (data: any) => {
    const newData = {
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
      mobile: data.mobile || '',
      birthday: data.birthday,
      about: data.about,
      avatar: data.avatar,
      web: data.web,
      gender: data.gender,
      type: data.type,
      email: data.email,
    };
    return newData;
  };

  useEffect(() => {
    setLoading(false);
    getItem({
      variables: {
        _id: props.id,
      },
    });
  }, []);

  const [messageMutation] = useMutation(TOGGLE_SNACKBAR_MUTATION);

  const [updateUser] = useMutation<any, any>(UPDATE_USER_MUTATION, {
    onCompleted: data => {
      messageMutation({
        variables: {msg: t('ItemSavedSuccessfully'), type: 'success'},
      });
      setTimeout(() => {
        if (props.IsDlg === true) {
          closeDialog(true);
        } else {
          //router.push('/admin/profile');
        }
      }, 1000);
    },
    onError: err => {
      messageMutation({
        variables: {msg: err.message, type: 'error'},
      });
    },
  });

  const editTheUser = async (data: EditUserForm, resetForm: Function) => {
    // API call integration will be here. Handle success / error response accordingly.
    if (data) {
      await updateUser({
        variables: {
          ...data,
          //birthday: !data.birthday ? data.birthday : dateToISOString(data.birthday),
          _id: props.id,
        },
      });
      // resetForm(initialValues)
    }
  };

  const setChange = (name: any, value: any, option?: any) => {
    setValue(name, value);
    setFormValues({...formValues, [name]: !option ? value : option});
  };

  return (
    <Container maxWidth="lg" className="page-padding">
      <Message />
      <Grid container direction="row-reverse">
        {/* Profile forms */}
        <Grid item xs={12} sm={12} md={12}>
          <h2 className="page-title">{t('Profile')}</h2>
          <form onSubmit={onSubmit}>
            <Grid container direction="row" spacing={2}>
              <Grid item md={6} sm={6} xs={12}>
                <Text variant="subtitle2">{t('Firstname') + '*'}</Text>
                <TextField
                  {...register('firstname')}
                  value={formValues.firstname}
                  placeholder={t('user.firstname')}
                  type="text"
                  fullWidth
                  required
                  maxLength={60}
                  variant="outlined"
                  size="small"
                  margin="normal"
                  error={!!errors.firstname}
                  helperText={errors?.firstname?.message}
                  onChange={e => setChange('firstname', e.target.value)}
                />
              </Grid>
              <Grid item md={6} sm={6} xs={12}>
                <Text variant="subtitle2">{t('user.lastname')}</Text>
                <TextField
                  {...register('lastname')}
                  value={formValues.lastname}
                  placeholder={t('user.lastname')}
                  type="text"
                  fullWidth
                  variant="outlined"
                  maxLength={60}
                  size="small"
                  margin="normal"
                  error={!!errors.lastname}
                  helperText={errors?.lastname?.message}
                  onChange={e => setChange('lastname', e.target.value)}
                />
              </Grid>
              <Grid item md={6} sm={6} xs={12}>
                <Text variant="subtitle2">{t('Username')}</Text>
                <TextField
                  {...register('username')}
                  value={formValues.username}
                  placeholder={t('user.username')}
                  type="text"
                  fullWidth
                  required
                  maxLength={35}
                  variant="outlined"
                  size="small"
                  margin="normal"
                  disabled
                  aria-readonly
                  error={!!errors.username}
                  helperText={errors?.username?.message}
                  onChange={e => setChange('username', e.target.value)}
                />
              </Grid>
              <Grid item md={6} sm={6} xs={12}>
                <Text variant="subtitle2">{t('user.email')}</Text>
                <TextField
                  {...register('email')}
                  value={formValues.email}
                  placeholder={t('user.email')}
                  type="text"
                  fullWidth
                  maxLength={100}
                  variant="outlined"
                  size="small"
                  margin="normal"
                  error={!!errors.email}
                  onChange={e => setChange('email', e.target.value)}
                  disabled
                  sx=\{{
                    '& .MuiInputBase-root.Mui-disabled': {
                      color: COLORS.disabled,
                    },
                  }}
                />
              </Grid>
              <Grid item md={6} sm={6} xs={12}>
                <Text variant="subtitle2">{t('user.phone') + '*'}</Text>
                <TextField
                  {...register('phone')}
                  value={formValues.phone}
                  placeholder={t('user.phone')}
                  type="text"
                  fullWidth
                  required
                  inputProps=\{{
                    pattern: `^[0-9 \\(\\)\\-+*#,]{8,}$`,
                    inputMode: 'tel',
                  }}
                  maxLength={13}
                  variant="outlined"
                  size="small"
                  margin="normal"
                  InputLabelProps=\{{shrink: true}}
                  error={!!errors.phone}
                  helperText={errors?.phone?.message}
                  onChange={e => setChange('phone', e.target.value)}
                />
              </Grid>
              <Grid item md={6} sm={6} xs={12}>
                <Text variant="subtitle2">{t('user.mobile')}</Text>
                <TextField
                  {...register('mobile')}
                  value={formValues.mobile}
                  placeholder={t('user.mobile')}
                  type="text"
                  fullWidth
                  variant="outlined"
                  inputProps=\{{
                    pattern: `^(?:[0-9 \\(\\)\\-+*#,]{8,})?$`,
                    inputMode: 'tel',
                  }}
                  maxLength={13}
                  margin="normal"
                  size="small"
                  InputLabelProps=\{{shrink: true}}
                  error={!!errors.mobile}
                  helperText={errors?.mobile?.message}
                  onChange={e => setChange('mobile', e.target.value)}
                />
              </Grid>
              <Grid item md={6} sm={6} xs={12}>
                <Text variant="subtitle2">{t('user.about')}</Text>
                <TextField
                  {...register('about')}
                  value={formValues.about}
                  placeholder={t('TextFormFieldPlaceholder')}
                  type="text"
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={5}
                  maxLength={2048}
                  variant="outlined"
                  margin="normal"
                  size="small"
                  error={!!errors.about}
                  helperText={errors?.about?.message}
                  onChange={e => setChange('about', e.target.value)}
                />
              </Grid>
              <Grid item md={6} sm={6} xs={12}>
                <Text variant="subtitle2">{t('user.web')}</Text>
                <TextField
                  {...register('web')}
                  value={formValues.web}
                  required={false}
                  placeholder={t('user.web')}
                  maxLength={255}
                  //type="url"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  size="small"
                  error={!!errors.web}
                  onChange={e => setChange('web', e.target.value)}
                />
              </Grid>
              <Grid item md={3} sm={6} xs={12}>
                <Text variant="subtitle2">{t('user.birthday')}</Text>
                <TextField
                  {...register('birthday')}
                  value={dateToString(formValues.birthday, 'YYYY-MM-DD')}
                  defaultValue={dateToString(editdata.birthday, 'YYYY-MM-DD')}
                  type="date"
                  placeholder={t('user.birthday')}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  size="small"
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
              <Grid item md={3} sm={6} xs={12}>
                <Text variant="subtitle2">{t('user.gender')}</Text>
                <FormControl
                  variant="outlined"
                  margin="normal"
                  size="small"
                  fullWidth>
                  <Select
                    {...register('gender')}
                    placeholder={t('user.gender')}
                    value={formValues.gender}
                    error={!!errors.gender}
                    onChange={value => setChange('gender', value)}
                    renderValue={selected =>
                      !selected ? '' : t(selected, {defaultValue: selected})
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
              {props.user?.type === 'Admin' && (
                <Grid item md={6} sm={6} xs={12}>
                  <Text variant="subtitle2">{t('user.type')}</Text>
                  <Box display={'flex'} alignItems={'left'}>
                    <FormControl
                      variant="outlined"
                      margin="normal"
                      size="small"
                      style=\{{flex: 1}}>
                      <Select
                        {...register('type')}
                        placeholder={t('userType')}
                        value={formValues.type}
                        error={!!errors.type}
                        onChange={value => {
                          setChange('type', value);
                          setType(value);
                        }}
                        renderValue={selected =>
                          t(selected, {defaultValue: selected})
                        }
                        inputProps=\{{
                          id: 'user-type',
                        }}
                        options={userType.map(c => ({
                          value: c,
                          label: t(c),
                        }))}
                      />
                    </FormControl>
                  </Box>
                </Grid>
              )}
              <Grid
                item
                md={12}
                xs={12}
                sx={theme => ({
                  marginVertical: {
                    marginBottom: theme.spacing(2),
                    marginTop: theme.spacing(2),
                  },
                })}>
                <Upload
                  uploaded={formValues.avatar || editdata.avatar}
                  label={t('user.avatar')}
                  multiple={false}
                  onChange={value => setChange('avatar', value)}
                />
              </Grid>
              <Grid item xs={12} justifyContent="flex-end">
                <Box
                  className={styles.marginTopBig}
                  display="flex"
                  justifyContent="flex-end">
                  <Button
                    disabled={isSubmitting || disabled}
                    disableElevation
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large">
                    <Text variant="subtitle2">
                      {isSubmitting ? t('loading') : t('Submit')}
                    </Text>
                  </Button>
                  {isSubmitting && <Spinner size={24} color="secondary" />}
                </Box>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
      {loading && <Spinner overflowHide color="inherit" />}
    </Container>
  );
};

export default EditUser;
