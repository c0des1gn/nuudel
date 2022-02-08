import React from 'react';
import { Editor } from 'nuudel-core';
//import { ControlMode } from 'nuudel-utils';
import { IAppProps } from 'nuudel-core';

interface IProps extends IAppProps {}

const Pages: React.FC<IProps> = (props: IProps) => {
  return (
    <>
      <Editor />
    </>
  );
};

export default Pages;
