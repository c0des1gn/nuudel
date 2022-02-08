export interface ISignInFormValues {
  email: string;
  password: string;
}

export interface IProps {
  onSubmit(values: ISignInFormValues, e: any): Promise<void>;
  username?: string;
}
