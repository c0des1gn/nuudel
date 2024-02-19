import React from 'react';
import {Text} from 'nuudel-core';
import {COLORS} from '@Variables';
import {t} from '@Translate';

interface IProps {
  title?: string;
  //icon?: string;
}

export const NoResult: React.FC<IProps> = ({title = 'NoResult'}) => {
  return (
    <div
      style=\{{
        textAlign: 'center',
        padding: 50,
        color: COLORS['text-light'],
        opacity: 0.75,
        width: '100%',
      }}>
      {t(title)}
    </div>
  );
};

export default NoResult;
