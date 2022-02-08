import React from 'react';
import Settings from '../../forms/Settings';
import config from '../../common/config.json';

type Props = {};

const Config: React.FC<Props> = (): JSX.Element => {
  return <Settings id={config._id}></Settings>;
};

export default Config;
