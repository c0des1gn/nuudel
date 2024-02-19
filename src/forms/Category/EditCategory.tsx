import React, {useState, useEffect} from 'react';
import {Card, CardContent, Divider, Box} from '@mui/material';
import {Button, IImage, TextField, Grid} from 'nuudel-core';
import Autocomplete from '@mui/material/Autocomplete';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {useRouter} from 'next/navigation';
import {useMutation, useLazyQuery} from '@apollo/react-hooks';
import {Message, TOGGLE_SNACKBAR_MUTATION} from 'nuudel-core';
import {GET_CATEGORY_QUERY, GET_CATEGORIES} from './CategoryQuery';
import {UPDATE_CATEGORY_MUTATION} from './CategoryMutation';
import {IParentProps} from '../IParentProps';
import {Option} from './AddCategory';
import {t} from '@Translate';
import styles from './styles.module.scss';

interface EditCategoryForm {
  name: string;
  slug: string;
  parent_id: string;
  img?: IImage;
  hasChild?: boolean;
}

export const initialValues = {
  name: '',
  slug: '',
  parent_id: null,
};

const categorySchema: Yup.SchemaOf<EditCategoryForm> = Yup.object().shape({
  name: Yup.string().required('Please enter category name'),
  slug: Yup.string(),
  parent_id: Yup.string().nullable(),
  hasChild: Yup.boolean().notRequired(),
  img: Yup.object().shape({uri: Yup.string()}).notRequired().nullable(),
});

interface IProps extends IParentProps {
  id: string;
}
const EditCategory: React.FC<IProps> = ({id}) => {
  const router = useRouter();

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    getValues,
    formState: {isSubmitting, errors, touchedFields},
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
      setListCat(data?.getCategories?.itemSummaries || []);
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
        take: 300,
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
        variables: {...data, id: id},
      })
        .then(data => {
          //console.log('then of editCategory');
          messageMutation({
            variables: {msg: 'Category added successfully', type: 'success'},
          });
        })
        .catch(err => {
          //console.log('error of editCategory');
          messageMutation({
            variables: {msg: err.message, type: 'error'},
          });
        });
      // resetForm(initialValues)
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
              <Grid item xs={12} className={styles.textField}>
                <TextField
                  {...register('name')}
                  value={watch('name')}
                  label={t('category.name')}
                  placeholder={t('category.name')}
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
              <Grid item xs={12} className={styles.textField}>
                <TextField
                  {...register('slug')}
                  value={watch('slug')}
                  label={t('category.slug')}
                  placeholder={t('category.slug')}
                  type="text"
                  maxLength={250}
                  inputProps=\{{
                    pattern: `^([0-9a-zA-Z _\\-]+)?$`,
                  }}
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  size="small"
                  error={!!errors.slug}
                  helperText={errors?.slug?.message}
                  onChange={e => setValue('slug', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} className={styles.textField}>
                <Autocomplete
                  //{...register('parent_id')}
                  value={
                    listCat.find(v => v?.cid === watch('parent_id')) || null
                  }
                  autoHighlight
                  options={listCat}
                  getOptionLabel={(option: Option) => option?.name || ''}
                  onChange={(e, op: Option) =>
                    setValue('parent_id', op?.cid ? op.cid : null)
                  }
                  renderOption={(prop: any, option: Option) => (
                    <li {...prop}>{option?.name}</li>
                  )}
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={t('category.parent_id')}
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

export default EditCategory;
