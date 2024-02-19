import React, {useState, useEffect} from 'react';
import {Card, CardContent} from '@mui/material';
import {
  Button,
  TextField,
  Box,
  Divider,
  Switch,
  Upload,
  Grid,
  TagsInput,
} from 'nuudel-core';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {useRouter} from 'next/navigation';
import {useMutation, useLazyQuery} from '@apollo/react-hooks';
import {Message, TOGGLE_SNACKBAR_MUTATION} from 'nuudel-core';
import {UPDATE_SETTINGS_MUTATION, GET_SETTINGS_QUERY} from './Query';
import {t} from '@Translate';

interface EditSettingsForm {
  active: boolean;
  minVersion: string;
  base_url: string;
  site_title: string;
  site_description: string;
  site_keywords: string[];
  posts_per_page: number;
  logo: any;
  phone: string;
  location: string;
  web: string;
  color?: string;
}

export const initialValues = {
  active: true,
  minVersion: '',
  base_url: '',
  site_title: '',
  site_description: '',
  site_keywords: [],
  posts_per_page: 10,
  logo: {uri: ''},
  phone: '',
  location: '',
  web: '',
  color: '',
};

const settingsSchema: Yup.SchemaOf<EditSettingsForm> = Yup.object().shape({
  active: Yup.boolean(),
  minVersion: Yup.string()
    .required('Please enter version')
    .matches(/^\d{1,2}\.\d{1,3}\.\d{1,4}$/g, t('Must be version')),
  base_url: Yup.string()
    .required('Please enter website')
    .matches(
      /^((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&=]*))?$/,
      'Enter a valid url',
    ),
  site_title: Yup.string().required('Please enter web title'),
  site_description: Yup.string(),
  site_keywords: Yup.array(), //Yup.string().matches( /^[0-9a-zA-Z\s\,]+$/, t('OnlyLatinCharacters')),
  posts_per_page: Yup.number().min(1).max(200),
  logo: Yup.object().shape({uri: Yup.string()}),
  phone: Yup.string(),
  location: Yup.string(),
  web: Yup.string().nullable().notRequired(),
  color: Yup.string().nullable(),
});

interface IProps {
  id: string;
}
const EditSettings: React.FC<IProps> = ({id}) => {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    getValues,
    formState: {isSubmitting, errors, touchedFields},
  } = useForm<EditSettingsForm>({
    resolver: yupResolver(settingsSchema),
    defaultValues: initialValues,
  });

  const onSubmit = handleSubmit(values => {
    editTheSettings(values, reset);
    //setDisabled(true);
  });

  const [disabled, setDisabled] = useState(false);

  const [getItem] = useLazyQuery<any, any>(GET_SETTINGS_QUERY, {
    onCompleted: data => {
      if (data) {
        if (data.getConfig?.site_keywords instanceof Array) {
          //data.getConfig.site_keywords = data.getConfig.site_keywords.join(', ');
        }
        reset(data.getConfig);
      }
    },
  });

  useEffect(() => {
    getItem({
      variables: {
        _id: id,
      },
    });
  }, []);

  const [messageMutation] = useMutation(TOGGLE_SNACKBAR_MUTATION);

  const [updateSettings] = useMutation<any, any>(UPDATE_SETTINGS_MUTATION, {
    onCompleted: data => {
      router.push('/admin/settings');
      //console.log('Data ' + JSON.stringify(data));
    },
  });

  const editTheSettings = async (
    data: EditSettingsForm,
    resetForm: Function,
  ) => {
    // API call integration will be here. Handle success / error response accordingly.
    if (data) {
      updateSettings({
        variables: {
          ...data,
          _id: id,
          //site_keywords: typeof data.site_keywords === 'string' ? data.site_keywords.replace(/[\s,]+/g, ',').split(',') : [],
        },
      })
        .then(data => {
          messageMutation({
            variables: {msg: 'Settings added successfully', type: 'success'},
          });
        })
        .catch(err => {
          messageMutation({
            variables: {msg: err.message, type: 'error'},
          });
        });
      // resetForm(initialValues)
    }
  };

  return (
    <div>
      <Message />
      <form onSubmit={onSubmit}>
        <Card>
          <CardContent>
            <Grid
              container
              justifyContent="space-around"
              direction="row"
              spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('minVersion')}
                  value={watch('minVersion')}
                  label={t('setting.minVersion')}
                  placeholder={t('TextFormFieldPlaceholder')}
                  type="text"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={!!errors.minVersion}
                  helperText={errors?.minVersion?.message}
                  onChange={e => setValue('minVersion', e.target.value)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('site_title')}
                  value={watch('site_title')}
                  label={t('setting.site_title')}
                  placeholder={t('TextFormFieldPlaceholder')}
                  type="text"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={!!errors.site_title}
                  helperText={errors?.site_title?.message}
                  onChange={e => setValue('site_title', e.target.value)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TagsInput
                  {...register('site_keywords')}
                  value={watch('site_keywords')}
                  label={t('setting.site_keywords')}
                  placeholder={t('TextFormFieldPlaceholder')}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={errors.site_keywords?.message}
                  onChange={(e, chips) => {
                    if (chips && chips instanceof Array) {
                      setValue('site_keywords', chips);
                    }
                  }}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('site_description')}
                  value={watch('site_description')}
                  label={t('setting.site_description')}
                  placeholder={t('TextFormFieldPlaceholder')}
                  type="text"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  margin="normal"
                  error={!!errors.site_description}
                  helperText={errors?.site_description?.message}
                  onChange={e => setValue('site_description', e.target.value)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('posts_per_page')}
                  value={watch('posts_per_page')}
                  label={t('setting.posts_per_page')}
                  placeholder={t('TextFormFieldPlaceholder')}
                  inputProps=\{{
                    pattern: `[1-9]{1}[0-9]{0,}`,
                    inputMode: 'numeric',
                    min: 1,
                  }}
                  type="number"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={!!errors.posts_per_page}
                  helperText={errors?.posts_per_page?.message}
                  onChange={e =>
                    setValue('posts_per_page', parseInt(e.target.value))
                  }
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  {...register('base_url')}
                  value={watch('base_url')}
                  label={t('setting.base_url')}
                  placeholder={t('TextFormFieldPlaceholder')}
                  type="text"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={!!errors.base_url}
                  helperText={errors?.base_url?.message}
                  onChange={e => setValue('base_url', e.target.value)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('web')}
                  required={false}
                  value={watch('web')}
                  label={t('setting.web')}
                  placeholder={t('TextFormFieldPlaceholder')}
                  type="text"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={!!errors.web}
                  helperText={errors?.web?.message}
                  onChange={e => setValue('web', e.target.value)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('location')}
                  value={watch('location')}
                  label={t('setting.location')}
                  placeholder={t('TextFormFieldPlaceholder')}
                  type="text"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  margin="normal"
                  error={!!errors.location}
                  helperText={errors?.location?.message}
                  onChange={e => setValue('location', e.target.value)}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  {...register('phone')}
                  value={watch('phone')}
                  label={t('setting.phone')}
                  placeholder={t('TextFormFieldPlaceholder')}
                  inputProps=\{{
                    pattern: `[0-9\\-+, ]*`,
                    inputMode: 'tel',
                    maxLength: 12,
                  }}
                  type="tel"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={!!errors.phone}
                  helperText={errors?.phone?.message}
                  onChange={e => {
                    if (
                      /^(?:(?:\+)?([0-9\-\s\,]{0,})+)?$/.test(e.target?.value)
                    ) {
                      setValue('phone', e.target?.value);
                    }
                  }}
                />
              </Grid>
              <Grid
                item
                md={6}
                xs={12}
                style=\{{
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}>
                <Switch
                  {...register('active')}
                  checked={watch('active') === true}
                  label={t('setting.active')}
                  //defaultChecked={initialValues.active}
                  onChange={e => setValue('active', e.target.checked)}
                />
              </Grid>
              <Grid item xs={12}>
                <Upload
                  uploaded={watch('logo') || initialValues.logo}
                  label={t('logo')}
                  multiple={false}
                  onChange={value => setValue('logo', value)}
                />
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <Grid
            item
            md={12}
            xs={12}
            sx={theme => ({
              marginTop: theme.spacing(2),
            })}>
            <Box display="flex" justifyContent="flex-end" p={2}>
              <Button
                color="primary"
                variant="contained"
                disabled={isSubmitting || disabled}
                type="submit">
                {isSubmitting ? t('loading') : t('Submit')}
              </Button>
            </Box>
          </Grid>
        </Card>
      </form>
    </div>
  );
};

export default EditSettings;
