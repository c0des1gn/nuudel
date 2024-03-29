import React, {useState, useEffect} from 'react';
import {Card, CardContent, Divider, Box} from '@mui/material';
import {Button, TextField, Grid} from 'nuudel-core';
import Autocomplete from '@mui/material/Autocomplete';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {useRouter} from 'next/navigation';
import {useMutation, useLazyQuery} from '@apollo/react-hooks';
import {Message, TOGGLE_SNACKBAR_MUTATION} from 'nuudel-core';
import {GET_CATEGORIES} from './CategoryQuery';
import {CREATE_CATEGORY} from './CategoryMutation';
import {t} from '@Translate';
import styles from './styles.module.scss';

interface NewCategoryForm {
  name: string;
  slug: string;
  parent_id: string;
}

export type Option = {
  _id: string;
  cid: string;
  name: string;
  slug: string;
  parent_id: string;
};

export type IItemGroup = {
  _id: string;
  article: string;
  attributeValues: any[];
};

export const initialValues = {
  name: '',
  slug: '',
  parent_id: '',
};

const categorySchema: Yup.SchemaOf<NewCategoryForm> = Yup.object().shape({
  name: Yup.string().required('Please enter category name'),
  slug: Yup.string(),
  parent_id: Yup.string(),
});

const AddCategory: React.FunctionComponent = () => {
  const router = useRouter();

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    formState: {isSubmitting, errors, touchedFields},
  } = useForm<NewCategoryForm>({
    resolver: yupResolver(categorySchema),
    defaultValues: initialValues,
  });

  const onSubmit = handleSubmit(values => {
    createNewCategory(values, reset);
    //setDisabled(true);
  });

  const [disabled, setDisabled] = useState(false);
  const [listCat, setListCat] = useState([]);

  const [getCategories] = useLazyQuery<any, any>(GET_CATEGORIES, {
    onCompleted: data => {
      setListCat(data?.getCategories?.itemSummaries || []);
    },
  });

  useEffect(() => {
    // code to run on component mount
    getCategories({
      variables: {
        skip: 0,
        take: 300,
        filter: '',
        sort: '',
        total: 0,
      },
    });
  }, []);

  const [messageMutation] = useMutation(TOGGLE_SNACKBAR_MUTATION);

  const [createCategory] = useMutation<any, any>(CREATE_CATEGORY, {
    onCompleted: data => {
      router.push('/admin/categories');
    },
  });

  const createNewCategory = async (
    data: NewCategoryForm,
    resetForm: Function,
  ) => {
    // API call integration will be here. Handle success / error response accordingly.
    if (data) {
      createCategory({
        variables: {data},
      })
        .then(data => {
          messageMutation({
            variables: {msg: 'Category added successfully', type: 'success'},
          });
        })
        .catch(err => {
          messageMutation({
            variables: {msg: err.message, type: 'error'},
          });
        });
    }
  };

  return (
    <div className={styles.mainroot}>
      <Message />
      <form onSubmit={onSubmit}>
        <Card>
          <CardContent>
            <Grid
              container
              justifyContent="space-around"
              direction="row"
              spacing={2}>
              <Grid item xs={12}>
                <TextField
                  {...register('name')}
                  label={t('category.name')}
                  required
                  placeholder={t('category.name')}
                  defaultValue={initialValues.name}
                  type="text"
                  maxLength={255}
                  inputProps=\{{
                    pattern: `^([0-9a-zA-Zа-яА-ЯөӨүҮёЁ _,.\\-+&'\\/]+)?$`,
                  }}
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  size="small"
                  error={!!errors.name}
                  helperText={errors?.name?.message}
                  onChange={e => setValue('name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('slug')}
                  label={t('category.slug')}
                  placeholder={t('category.slug')}
                  defaultValue={initialValues.slug}
                  type="text"
                  maxLength={250}
                  inputProps=\{{pattern: `^([0-9a-zA-Z _\\-]+)?$`}}
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  size="small"
                  error={!!errors.slug}
                  helperText={errors?.slug?.message}
                  onChange={e => setValue('slug', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  defaultValue={listCat.find((v, i) => i === 0)}
                  autoHighlight
                  fullWidth
                  options={listCat}
                  getOptionLabel={(option: Option) => option?.name || ''}
                  //onSelect={}
                  onChange={(e, options: Option) =>
                    setValue('parent_id', options?.cid ? options.cid : null)
                  }
                  renderOption={(prop: any, option: Option) => (
                    <li {...prop}>{option?.name}</li>
                  )}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t('category.parent_id')}
                      variant="outlined"
                      margin="dense"
                      size="small"
                      error={Boolean(errors?.parent_id)}
                      //helperText={errors?.zoning?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <Box display="flex" justifyContent="flex-end" p={3}>
            <Button
              style=\{{}}
              disabled={isSubmitting || disabled}
              color="primary"
              type="submit">
              {isSubmitting ? t('loading') : t('Submit')}
            </Button>
          </Box>
        </Card>
      </form>
    </div>
  );
};

export default AddCategory;
