import React, { FunctionComponent, useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, TextField } from 'nuudel-core';
import styles from './styles.module.scss';
import { getValidationSchema, initialValues, isEmailError } from './schema';
import { IProps, ISignInFormValues } from './types';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import AccountCircle from '@material-ui/icons/AccountCircle';
import IconButton from '@material-ui/core/IconButton';
import { InputAdornment } from '@material-ui/core';
import { t } from '@Translate';

const SignInForm: FunctionComponent<IProps> = (props: IProps) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, submitCount, touchedFields },
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
    event.preventDefault();
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
          field: { onChange, onBlur, name: fieldName, value },
          fieldState: { error },
        }) => (
          <TextField
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
            inputProps=\{{ autoCapitalize: 'none' }}
            fullWidth
            error={error && !!error.message}
          />
        )}
        control={control}
        name="email"
        defaultValue={initialValues.email}
      />
      <Controller
        render={({
          field: { onChange, onBlur, name: fieldName, value },
          fieldState: { error },
        }) => (
          <TextField
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
            inputProps=\{{ autoCapitalize: 'none' }}
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
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPass ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
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
          fullWidth
          disabled={isSubmitting || disabled}
          onClick={onSubmit}
          color="primary"
        >
          {isSubmitting ? t('loading') : t('Login')}
        </Button>
      </div>
    </form>
  );
};

export default SignInForm;
