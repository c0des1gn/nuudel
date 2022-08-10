import React from 'react';
import { Chart } from './Chart';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  makeStyles,
  colors,
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

const useStyles = makeStyles(() => ({
  root: {},
}));

type Props = {
  className: string;
};

const DailyVisitsInsight: React.FC<Props> = ({ className, ...rest }) => {
  const classes = useStyles();

  const options = {
    series: [
      {
        name: 'Day',
        data: [31, 40, 28, 51, 42, 109, 100],
      },
      {
        name: 'Night',
        data: [11, 32, 45, 32, 34, 52, 41],
      },
    ],
    options: {
      chart: {
        height: 350,
        type: 'area',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        type: 'datetime',
        categories: [
          '2018-09-19T00:00:00.000Z',
          '2018-09-19T01:30:00.000Z',
          '2018-09-19T02:30:00.000Z',
          '2018-09-19T03:30:00.000Z',
          '2018-09-19T04:30:00.000Z',
          '2018-09-19T05:30:00.000Z',
          '2018-09-19T06:30:00.000Z',
        ],
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm',
        },
      },
    },
  };

  return (
    <Card className={`${classes.root} ${className}`} {...rest}>
      <CardHeader
        action={
          <Button endIcon={<ArrowDropDownIcon />} size="small" variant="text">
            Last 7 days
          </Button>
        }
        title="Daily Visits Insights"
      />
      <Divider />
      <CardContent>
        <Box height={400} position="relative">
          <Chart
            options={options.options}
            series={options.series}
            height="350"
            width="97%"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default DailyVisitsInsight;
