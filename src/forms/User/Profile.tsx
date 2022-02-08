import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  Button,
  TextField,
  Box,
  Divider,
  Upload,
  Spinner,
  Select,
  Switch,
} from 'nuudel-core';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import { Message, TOGGLE_SNACKBAR_MUTATION } from 'nuudel-core';
import { UPDATE_USER_MUTATION } from './UserMutation';
import { GET_USER_QUERY, LIST_WAREHOUSE_QUERY } from './UserQuery';
import { t } from '@Translate';
import { dateToString, closeDialog } from 'nuudel-utils';
import SaveIcon from '@material-ui/icons/Save';
import styles from '../../theme/styles/styles.module.scss';
import { Gender, userType, Vehicle } from '../Signup/types';
import { IPartner, ICurrentUser, IWarehouse } from 'nuudel-core';
import { IParentProps } from '../IParentProps';

interface EditUserForm {
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
  _partner: IPartner;
}

export const initialValues = {
  firstname: '',
  lastname: '',
  phone: null,
  mobile: null,
  birthday: new Date(),
  about: '',
  web: '',
  avatar: { uri: '' },
  gender: 'Male',
  type: 'User',
  _partner: {
    custom: false,
  },
};

const required: string = 'Заавал';
const min: string = t('min length') || 'Хамгийн багадаа:';
const max: string = t('max length') || 'Хамгийн ихдээ:';

const userSchema: Yup.SchemaOf<EditUserForm> = Yup.object().shape({
  firstname: Yup.string()
    .required(t('required') || required)
    .max(60, max + '60'),
  lastname: Yup.string().max(60),
  phone: Yup.string()
    .matches(
      /^[0-9\s\(\)\-\+\*\#\,]+$/,
      t('allowedCharacters') || 'Утасны дугаар',
    )
    .min(8)
    .max(13),
  mobile: Yup.string()
    .matches(
      /^(?:[0-9\s\(\)\-\+\*\#\,]+)?$/,
      t('allowedCharacters') || 'Утасны дугаар',
    )
    .max(13),
  gender: Yup.string(),
  birthday: Yup.date(), // yup.date().min(yup.ref('start'))
  about: Yup.string().max(250),
  web: Yup.string()
    .trim()
    .matches(
      /^((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))?$/g,
      t('Enter a valid url'),
    ),
  avatar: Yup.object().shape({ uri: Yup.string() }),
  type: Yup.string(),
  _partner: Yup.object().shape({
    custom: Yup.boolean(),
  }),
});

interface IProps {
  user?: ICurrentUser;
  id: string;
  editdata?: EditUserForm;
  IsDlg?: boolean;
}

const EditUser: React.FC<IProps> = ({ ...props }) => {
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
    formState: { isSubmitting, errors, touchedFields },
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
  const [listWarehouse, setListWarehouse] = useState([]);

  const [getWarehouses] = useLazyQuery<any, any>(LIST_WAREHOUSE_QUERY, {
    onCompleted: data => {
      setListWarehouse(data.getWarehouses.itemSummaries);
    },
  });

  const [getItem] = useLazyQuery<any, any>(GET_USER_QUERY, {
    onCompleted: data => {
      if (data) {
        setType(data.getUser.type);
        let newDate: any = getUsedFields(data.getUser);
        reset(newDate);
        setFormValues(newDate);
      }
    },
  });

  const getUsedFields = (data: any) => {
    const newData = {
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
      _partner: data._partner || null,
    };
    return newData;
  };

  useEffect(() => {
    setLoading(false);
    getWarehouses({
      variables: {
        skip: 0,
        take: 200,
        filter: '',
        sort: '',
        total: 0,
      },
    });
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
        variables: { msg: 'Item saved successfully', type: 'success' },
      });
      setTimeout(() => {
        if (props.IsDlg === true) {
          closeDialog(true);
        } else {
          router.push('/admin/profile');
        }
      }, 1000);
    },
  });

  const editTheUser = async (data: EditUserForm, resetForm: Function) => {
    // API call integration will be here. Handle success / error response accordingly.
    if (data) {
      updateUser({
        variables: {
          ...data,
          _id: props.id,
        },
      })
        .then(data => {
          console.log('then of editUser');
          messageMutation({
            variables: { msg: 'User added successfully', type: 'success' },
          });
        })
        .catch(err => {
          console.log('error of editUser');
          messageMutation({
            variables: { msg: err.message, type: 'error' },
          });
        });
      // resetForm(initialValues)
    }
  };

  const setChange = (name: any, value: any, option?: any) => {
    setValue(name, value);
    setFormValues({ ...formValues, [name]: !option ? value : option });
  };

  return (
    <div className={'mainroot'}>
      <Message />
      <form onSubmit={onSubmit}>
        <Card>
          <CardContent>
            <Grid
              container
              justifyContent="space-around"
              direction="row"
              spacing={3}
            >
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('firstname')}
                  value={formValues.firstname}
                  label={t('user.firstname')}
                  placeholder={t('user.firstname')}
                  type="text"
                  fullWidth
                  required
                  variant="outlined"
                  margin="normal"
                  error={!!errors.firstname}
                  helperText={errors?.firstname?.message}
                  onChange={e => setChange('firstname', e.target.value)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('lastname')}
                  value={formValues.lastname}
                  label={t('user.lastname')}
                  placeholder={t('user.lastname')}
                  type="text"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={!!errors.lastname}
                  helperText={errors?.lastname?.message}
                  onChange={e => setChange('lastname', e.target.value)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('phone')}
                  value={formValues.phone}
                  label={t('user.phone')}
                  placeholder={t('user.phone')}
                  type="text"
                  fullWidth
                  required
                  variant="outlined"
                  margin="normal"
                  InputLabelProps=\{{ shrink: true }}
                  error={!!errors.phone}
                  helperText={errors?.phone?.message}
                  onChange={e => setChange('phone', e.target.value)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('mobile')}
                  value={formValues.mobile}
                  label={t('user.mobile')}
                  placeholder={t('user.mobile')}
                  type="text"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputLabelProps=\{{ shrink: true }}
                  error={!!errors.mobile}
                  helperText={errors?.mobile?.message}
                  onChange={e => setChange('mobile', e.target.value)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('birthday')}
                  value={dateToString(formValues.birthday, 'YYYY-MM-DD')}
                  defaultValue={dateToString(editdata.birthday, 'YYYY-MM-DD')}
                  label={t('user.birthday')}
                  type="date"
                  placeholder={t('user.birthday')}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={!!errors.birthday}
                  helperText={errors?.birthday?.message}
                  onChange={e => setChange('birthday', e.target.value)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('web')}
                  value={formValues.web}
                  label={t('user.web')}
                  placeholder={t('user.web')}
                  type="url"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={!!errors.web}
                  onChange={e => setChange('web', e.target.value)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('about')}
                  value={formValues.about}
                  label={t('user.about')}
                  placeholder={t('TextFormFieldPlaceholder')}
                  type="text"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  margin="normal"
                  error={!!errors.about}
                  helperText={errors?.about?.message}
                  onChange={e => setChange('about', e.target.value)}
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
                    value={formValues.gender}
                    error={!!errors.gender}
                    onChange={value => setChange('gender', value)}
                    renderValue={selected =>
                      !selected ? '' : t(selected, { defaultValue: selected })
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
              <Grid item md={12} xs={12}>
                <Box className={styles.paddingNormal}>
                  <Upload
                    uploaded={formValues.avatar || editdata.avatar}
                    label={t('user.avatar')}
                    multiple={false}
                    onChange={value => setChange('avatar', value)}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <Grid item md={12} xs={12}>
            <Box display="flex" justifyContent="flex-end" p={2}>
              <div className={styles.wrapper}>
                <Button
                  startIcon={<SaveIcon />}
                  color="primary"
                  variant="contained"
                  disabled={isSubmitting || disabled}
                  type="submit"
                >
                  {isSubmitting ? t('loading') : t('Submit')}
                </Button>
                {isSubmitting && <Spinner size={24} color="secondary" />}
              </div>
            </Box>
          </Grid>
        </Card>
      </form>
      {loading && <Spinner overflowHide color="inherit" />}
    </div>
  );
};

export default EditUser;
