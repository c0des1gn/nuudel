import { ISignInFormValues } from './types';
import * as Yup from 'yup';
import { t } from '@Translate';

export const initialValues: ISignInFormValues = { email: '', password: '' };

export const getValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required(t('required'))
    .min(5, t('min length') + '5')
    .max(100, t('max length') + '100'),
  password: Yup.string()
    .required(t('required'))
    //.min(5, t('min length') + '5')
    .max(30, t('max length') + '30'),
});

export const isError = (id: string) => (touched: any, errors: any) =>
  Boolean(touched[id] && errors[id]);

export const isEmailError = isError('email');
