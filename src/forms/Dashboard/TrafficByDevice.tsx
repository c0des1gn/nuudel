import React from 'react';
import Loadable from 'react-loadable';
import { Spinner } from 'nuudel-core';

const Chart = Loadable({
  loader: () => import('react-apexcharts'),
  loading: Spinner,
});

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  colors,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
  },
  devicePercent: {
    fontWeight: 400,
  },
}));

type Props = {
  className: string;
};

const TrafficByDevice: React.FC<Props> = ({ className, ...rest }) => {
  const classes = useStyles();

  const series = [30, 10, 60];
  const label = ['Tablet', 'Mobile', 'Laptop'];
  const options: any = {
    chart: {
      type: 'donut',
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
      },
    },
    dataLabels: {
      enabled: true,
    },
    fill: {
      type: 'gradient',
    },
    legend: {
      formatter: function(val: any, opts: any) {
        return label[opts.seriesIndex];
      },
    },
    title: {
      text: '',
    },
    responsive: [
      {
        breakpoint: 2480,
        options: {
          chart: {
            width: 370,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  return (
    <Card className={`${classes.root} ${className}`} {...rest}>
      <CardHeader title="Device Usage" />
      <Divider />
      <CardContent>
        <Box>
          <Chart options={options} series={series} type="donut" width={420} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrafficByDevice;
