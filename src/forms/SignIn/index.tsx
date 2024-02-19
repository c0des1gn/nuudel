import React, {FunctionComponent, useState, useEffect, useRef} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {Button} from 'nuudel-core';
import styles from './styles.module.scss';
import {getValidationSchema, initialValues, isEmailError} from './schema';
import {IProps, ISignInFormValues} from './types';
import {InputAdornment} from '@mui/material';
import {t} from '@Translate';
import TextField from '@mui/material/TextField';

const SignInForm: FunctionComponent<IProps> = (props: IProps) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: {errors, isSubmitting, submitCount, touchedFields},
  } = useForm<ISignInFormValues>({
    resolver: yupResolver(getValidationSchema),
    defaultValues: initialValues,
    //mode: 'onChange',
  });

  const onSubmit = handleSubmit(data => {
    setDisabled(true);
    props.onSubmit(data, () => {
      setDisabled(false);
      return submitCount % 5 === 4
        ? reset()
        : setValue('password', initialValues.password);
    }); // reset after form submit
  });
  const [showPass, setShowPass] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const handleClickShowPassword = () => {
    setShowPass(!showPass);
  };

  const handleMouseDownPassword = event => {
    //event.preventDefault();
  };

  const isInitalRender = useRef<boolean>(true);
  useEffect(() => {
    // on rerender
    if (isInitalRender.current) {
      setValue('email', props.username);
      isInitalRender.current = false;
    }
  }, [setValue]);

  return (
    <form className={styles.container}>
      <Controller
        render={({
          field: {onChange, onBlur, name: fieldName, value},
          fieldState: {error},
        }) => (
          <TextField
            size="small"
            className={styles.loginInput}
            placeholder={t('EmailOrUsername')}
            label={t('EmailOrUsername')}
            autoCapitalize="none"
            onChange={onChange}
            value={value}
            onBlur={onBlur}
            variant="outlined"
            name={fieldName}
            margin="normal"
            autoComplete="username"
            autoCorrect="off"
            inputProps=\{{autoCapitalize: 'none', maxLength: 128}}
            fullWidth
            error={error && !!error.message}
            InputProps=\{{
              className: styles.loginInput,
            }}
          />
        )}
        control={control}
        name="email"
        defaultValue={initialValues.email}
      />
      {/* <p className={styles.label + ' ' + styles.marginTop}>{t('Password')}</p> */}
      <Controller
        render={({
          field: {onChange, onBlur, name: fieldName, value},
          fieldState: {error},
        }) => (
          <TextField
            size="small"
            placeholder={t('Password')}
            label={t('Password')}
            type={showPass ? 'text' : 'password'}
            autoCapitalize="none"
            onChange={onChange}
            value={value}
            variant="outlined"
            onBlur={onBlur}
            name={fieldName}
            autoComplete="current-password"
            autoCorrect="off"
            inputProps=\{{autoCapitalize: 'none', maxLength: 40}}
            margin="normal"
            fullWidth
            error={error && !!error.message}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                onSubmit(e);
                e.preventDefault();
              }
            }}
            InputProps=\{{
              className: styles.loginInput,
              endAdornment: (
                <InputAdornment position="end">
                  <button
                    type="button"
                    className={styles.visibilityBtn}
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}>
                    {!showPass ? (
                      <i
                        className="icon-eye"
                        style=\{{fontSize: '20px', lineHeight: 1}}
                      />
                    ) : (
                      <i
                        className="icon-closed-eye"
                        style=\{{fontSize: '20px', lineHeight: 1}}
                      />
                    )}
                  </button>
                </InputAdornment>
              ),
            }}
          />
        )}
        control={control}
        name="password"
        defaultValue={initialValues.password}
      />
      <div className={styles.buttonCont}>
        <Button
          disableElevation
          className={styles.btn + ' ' + styles.loginBtn}
          fullWidth
          size="large"
          disabled={isSubmitting || disabled}
          onClick={onSubmit}
          color="primary">
          {isSubmitting ? t('loading') : t('Login')}
        </Button>
      </div>
    </form>
  );
};

export default SignInForm;
