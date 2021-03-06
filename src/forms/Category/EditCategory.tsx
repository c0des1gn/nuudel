import React, { useState, useRef, useEffect } from 'react';
import { Grid, Theme, createStyles, makeStyles } from '@material-ui/core';
import { Button, TextField } from 'nuudel-core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import { Message, TOGGLE_SNACKBAR_MUTATION } from 'nuudel-core';
import { GET_CATEGORY_QUERY, GET_CATEGORIES } from './CategoryQuery';
import { UPDATE_CATEGORY_MUTATION } from './CategoryMutation';
import { IParentProps } from '../IParentProps';
import { Option } from './AddCategory';
import { t } from '@Translate';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: '450px',
      display: 'block',
      margin: '0 auto',
    },
    textField: {
      '& > *': {
        width: '100%',
      },
    },
    submitButton: {
      marginTop: '24px',
    },
    title: { textAlign: 'center', fontWeight: 400, fontSize: '22px' },
    successMessage: { color: 'green' },
    errorMessage: { color: 'red' },
  }),
);

interface EditCategoryForm {
  name: string;
  slug: string;
  parent_id: string;
}

export const initialValues = {
  name: '',
  slug: '',
  parent_id: '',
};

const categorySchema: Yup.SchemaOf<EditCategoryForm> = Yup.object().shape({
  name: Yup.string().required('Please enter category name'),
  slug: Yup.string(),
  parent_id: Yup.string().nullable(),
});

interface IProps extends IParentProps {
  id: string;
}
const EditCategory: React.FC<IProps> = ({ id }) => {
  const router = useRouter();
  const classes = useStyles();

  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    getValues,
    formState: { isSubmitting, errors, touchedFields },
  } = useForm<EditCategoryForm>({
    resolver: yupResolver(categorySchema),
    defaultValues: initialValues,
  });

  const onSubmit = handleSubmit(values => {
    editTheCategory(values, reset);
    //setDisabled(true);
  });

  const [disabled, setDisabled] = useState(false);
  const [listCat, setListCat] = useState([]);

  const [getCategories] = useLazyQuery<any, any>(GET_CATEGORIES, {
    onCompleted: data => {
      setListCat(data.getCategories.itemSummaries);
    },
  });

  const [getItem] = useLazyQuery<any, any>(GET_CATEGORY_QUERY, {
    onCompleted: data => {
      if (data) {
        reset(data.getCategory);
      }
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
    getItem({
      variables: {
        _id: id,
      },
    });
  }, []);

  const [messageMutation] = useMutation(TOGGLE_SNACKBAR_MUTATION);

  const [updateCategory] = useMutation<any, any>(UPDATE_CATEGORY_MUTATION, {
    onCompleted: data => {
      router.push('/admin/categories');
    },
  });

  const editTheCategory = async (
    data: EditCategoryForm,
    resetForm: Function,
  ) => {
    // API call integration will be here. Handle success / error response accordingly.
    if (data) {
      updateCategory({
        variables: { ...data, id: id },
      })
        .then(data => {
          console.log('then of editCategory');
          messageMutation({
            variables: { msg: 'Category added successfully', type: 'success' },
          });
        })
        .catch(err => {
          console.log('error of editCategory');
          messageMutation({
            variables: { msg: err.message, type: 'error' },
          });
        });
      // resetForm(initialValues)
    }
  };

  return (
    <div className={'mainroot'}>
      <Message />
      <form onSubmit={onSubmit}>
        <Grid container justifyContent="space-around" direction="row">
          <Grid
            item
            style=\{{ paddingTop: 15, paddingBottom: 20 }}
            lg={10}
            md={10}
            sm={10}
            xs={10}
            className={classes.textField}
          >
            <TextField
              {...register('name')}
              value={watch('name')}
              label={t('category.name')}
              placeholder={t('category.name')}
              type="text"
              maxLength={255}
              inputProps=\{{ pattern: '^([0-9a-zA-Z??-????-?????????????? _-]+)?$' }}
              fullWidth
              variant="outlined"
              margin="normal"
              error={!!errors.name}
              helperText={errors?.name?.message}
              onChange={e => setValue('name', e.target.value)}
            />
          </Grid>
          <Grid
            item
            style=\{{ paddingTop: 15, paddingBottom: 20 }}
            lg={10}
            md={10}
            sm={10}
            xs={10}
            className={classes.textField}
          >
            <TextField
              {...register('slug')}
              value={watch('slug')}
              label={t('category.slug')}
              placeholder={t('category.slug')}
              type="text"
              maxLength={255}
              inputProps=\{{ pattern: '^([0-9a-zA-Z??-????-?????????????? _-]+)?$' }}
              fullWidth
              variant="outlined"
              margin="normal"
              error={!!errors.slug}
              helperText={errors?.slug?.message}
              onChange={e => setValue('slug', e.target.value)}
            />
          </Grid>
          <Grid
            item
            style=\{{ paddingTop: 15, paddingBottom: 20 }}
            lg={10}
            md={10}
            sm={10}
            xs={10}
            className={classes.textField}
          >
            <Autocomplete
              //defaultValue={listCat.find((v, i) => i === 0)}
              value={listCat.find(v => v.cid === watch('parent_id'))}
              autoHighlight
              options={listCat}
              getOptionLabel={(option: Option) => option.name}
              //onSelect={}
              onChange={(e, options: Option) =>
                setValue('parent_id', options.cid)
              }
              renderOption={(option: Option) => <>{option.name}</>}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
                  label={t('category.parent_id')}
                  error={Boolean(errors?.parent_id)}
                  //helperText={errors?.zoning?.message}
                />
              )}
            />
          </Grid>
          <Grid
            item
            lg={10}
            md={10}
            sm={10}
            xs={10}
            className={classes.submitButton}
          >
            <Button
              style=\{{}}
              disabled={isSubmitting || disabled}
              color="primary"
              type="submit"
            >
              {isSubmitting ? t('loading') : t('Submit')}
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default EditCategory;
