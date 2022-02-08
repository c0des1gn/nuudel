import React, { useState, useRef, useEffect } from 'react';
import {
  Theme,
  createStyles,
  makeStyles,
  Card,
  CardContent,
  Divider,
  Box,
} from '@material-ui/core';
import { Button, TextField, Grid } from 'nuudel-core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import { Message, TOGGLE_SNACKBAR_MUTATION } from 'nuudel-core';
import { GET_CATEGORIES } from './CategoryQuery';
import { CREATE_CATEGORY } from './CategoryMutation';
import { t } from '@Translate';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainRoot: {
      maxWidth: '600px',
      display: 'block',
      margin: '0 auto',
    },
    title: { textAlign: 'center', fontWeight: 400, fontSize: '22px' },
    successMessage: { color: 'green' },
    errorMessage: { color: 'red' },
  }),
);

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
  const classes = useStyles();

  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    formState: { isSubmitting, errors, touchedFields },
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
      setListCat(data.getCategories.itemSummaries);
    },
  });

  useEffect(() => {
    // code to run on component mount
    getCategories({
      variables: {
        skip: 0,
        take: 200,
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
        variables: { data },
      })
        .then(data => {
          console.log('then of createCategory');
          messageMutation({
            variables: { msg: 'Category added successfully', type: 'success' },
          });
        })
        .catch(err => {
          console.log('error of createCategory');
          messageMutation({
            variables: { msg: err.message, type: 'error' },
          });
        });
      // resetForm({})
    }
  };

  return (
    <div className={classes.mainRoot}>
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
              <Grid item xs={12}>
                <TextField
                  {...register('name')}
                  label={t('category.name')}
                  required
                  placeholder={t('category.name')}
                  defaultValue={initialValues.name}
                  type="text"
                  maxLength={255}
                  inputProps=\{{ pattern: '^([0-9a-zA-Zа-яА-ЯөӨүҮёЁ _-]+)?$' }}
                  fullWidth
                  variant="outlined"
                  margin="normal"
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
                  maxLength={255}
                  inputProps=\{{ pattern: '^([0-9a-zA-Zа-яА-ЯөӨүҮёЁ _-]+)?$' }}
                  fullWidth
                  variant="outlined"
                  margin="normal"
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
                  getOptionLabel={(option: Option) => option.name}
                  //onSelect={}
                  onChange={(e, options: Option) =>
                    setValue(
                      'parent_id',
                      options && options.cid ? options.cid : null,
                    )
                  }
                  renderOption={(option: Option) => <>{option.name}</>}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t('category.parent_id')}
                      variant="outlined"
                      margin="normal"
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
              type="submit"
            >
              {isSubmitting ? t('loading') : t('Submit')}
            </Button>
          </Box>
        </Card>
      </form>
    </div>
  );
};

export default AddCategory;
