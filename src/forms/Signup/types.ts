import * as Yup from 'yup';
import { t } from '@Translate';
import { ICurrentUser } from '@Interfaces';

export interface ISignUpFormValues {
  username: string;
  email: string;
  mail: string;
  firstname: string;
  lastname: string;
  password: string;
  phone: string;
  mobile: string;
  gender: string;
  avatar: any;
  type: string;
  web: string;
  about: string;
  birthday: Date;
}

export const userType: string[] = ['Admin', 'User', 'Viewer', 'Manager'];
export const Vehicle: string[] = ['None', 'Car', 'Scooter', 'Bicycle'];
export const Gender: string[] = ['Male', 'Female'];

export interface IProps {
  allowSignup?: boolean;
  user?: ICurrentUser;
  onSubmit?(values: ISignUpFormValues): Promise<void>;
}

export const initialValues: ISignUpFormValues = {
  username: '',
  email: '',
  mail: '',
  firstname: '',
  lastname: '',
  password: '',
  phone: '',
  mobile: '',
  gender: 'Male',
  avatar: { uri: '' },
  type: 'User',
  web: '',
  about: '',
  birthday: new Date('1970-01-01 12:00:00'),
};
const required: string = 'Заавал';
const min: string = t('min length') || 'Хамгийн багадаа:';
const max: string = t('max length') || 'Хамгийн ихдээ:';

const signupPasswordValidationSchema = Yup.object().shape({
  password: Yup.string()
    .required(t('required') || required)
    .min(6, min + '6')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z0-9\~\!\@\#\$\%\^\&\*\(\)\-\_\+\=\|\;\:\<\>\,\.\/\?])(?!.*\s)(?=.{6,30})/,
      t('allowedCharacters') || 'Том үсэг эсвэл тоо заавал орно',
    )
    .matches(
      /^[0-9a-zA-Z\~\!\@\#\$\%\^\&\*\(\)\-\_\+\=\|\;\:\<\>\,\.\/\?]+$/,
      t('OnlyLatinCharacters') || 'Зөвхөн латин үсэг',
    )
    .max(30, max + '30'),
});

export const oldPasswordvalidateSchema = Yup.object().shape({
  oldPassword: Yup.string()
    .required(t('required') || required)
    .min(6, min + '6')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z0-9\~\!\@\#\$\%\^\&\*\(\)\-\_\+\=\|\;\:\<\>\,\.\/\?])(?!.*\s)(?=.{6,30})/,
      t('allowedCharacters') || 'Том үсэг эсвэл тоо заавал орно',
    )
    .matches(
      /^[0-9a-zA-Z\~\!\@\#\$\%\^\&\*\(\)\-\_\+\=\|\;\:\<\>\,\.\/\?]+$/,
      t('OnlyLatinCharacters') || 'Зөвхөн латин үсэг',
    )
    .max(30, max + '30'),
});

export const passwordValidationSchema = Yup.object().shape({
  password: Yup.string()
    .required(t('required') || required)
    .min(6, min + '6')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z0-9\~\!\@\#\$\%\^\&\*\(\)\-\_\+\=\|\;\:\<\>\,\.\/\?])(?!.*\s)(?=.{6,30})/,
      t('allowedCharacters') || 'Том үсэг эсвэл тоо заавал орно',
    )
    .matches(
      /^[0-9a-zA-Z\~\!\@\#\$\%\^\&\*\(\)\-\_\+\=\|\;\:\<\>\,\.\/\?]+$/,
      t('OnlyLatinCharacters') || 'Зөвхөн латин үсэг',
    )
    .max(30, max + '30'),
  confirmPassword: Yup.string()
    .required(t('required') || required)
    .min(6, min + '6')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z0-9\~\!\@\#\$\%\^\&\*\(\)\-\_\+\=\|\;\:\<\>\,\.\/\?])(?!.*\s)(?=.{6,30})/,
      t('allowedCharacters') || 'Том үсэг эсвэл тоо заавал орно',
    )
    .matches(
      /^[0-9a-zA-Z\~\!\@\#\$\%\^\&\*\(\)\-\_\+\=\|\;\:\<\>\,\.\/\?]+$/,
      t('OnlyLatinCharacters') || 'Зөвхөн латин үсэг',
    )
    .max(30, max + '30')
    .oneOf(
      [Yup.ref('password'), null],
      t('passwordMustMatch') || 'Нууц үг хоорондоо таарсангүй',
    ),
});

export const validateSchema = Yup.object()
  .shape({
    username: Yup.string()
      .trim()
      .required(t('required') || required)
      //.lowercase()
      .min(5, min + '5')
      .max(35, max + '35')
      .matches(
        /^[0-9a-zA-Z\-\_\.]+$/,
        t('LatinCharactersOnly') || 'Зөвхөн латин үсэг',
      ),
    email: Yup.string()
      .trim()
      .required(t('required') || required)
      .email(t('must be a valid email') || 'Имэйл хаяг буруу')
      .max(100, max + '100'),
    mail: Yup.string()
      .trim()
      .email(t('must be a valid email') || 'Имэйл хаяг буруу')
      .oneOf(
        [Yup.ref('email'), null],
        t('EmailMustMatch') || 'Имэйл хоорондоо таарсангүй',
      )
      .max(100),
    firstname: Yup.string()
      .trim()
      .required(t('required') || required)
      .max(60, max + '60'),
    lastname: Yup.string()
      .trim()
      .required(t('required') || required)
      .max(60, max + '60'),
    phone: Yup.string()
      .matches(
        /^(?:[0-9\s\(\)\-\+\*\#\,]+)?$/,
        t('allowedCharacters') || 'Утасны дугаар',
      )
      //.min(8)
      .max(13),
    mobile: Yup.string()
      .matches(
        /^(?:[0-9\s\(\)\-\+\*\#\,]+)?$/,
        t('allowedCharacters') || 'Утасны дугаар',
      )
      //.min(8)
      .max(13),
    gender: Yup.string(),
    type: Yup.string(),
    web: Yup.string()
      .trim()
      .matches(
        /^((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))?$/g,
        t('Enter a valid url'),
      ),
    about: Yup.string().trim(),
    birthday: Yup.date(),
    avatar: Yup.object().shape({ uri: Yup.string() }),
    //check: Yup.boolean().oneOf([true], t('agreement') || 'Зөвшөөрөх'),
  })
  .concat(signupPasswordValidationSchema);
