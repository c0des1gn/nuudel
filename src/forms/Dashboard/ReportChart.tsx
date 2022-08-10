import React, { useEffect, useState } from 'react';
import { t } from '@Translate';
import { Chart } from './Chart';


import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  makeStyles,
} from '@material-ui/core';
import { Select } from 'nuudel-core';
import { useLazyQuery } from '@apollo/react-hooks';

const useStyles = makeStyles(() => ({
  root: {},
}));

const initoptions = {
  series: [],
  options: {
    chart: {
      type: 'bar',
      height: 350,
      id: 'mychart',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: [],
    },
    yaxis: {
      title: {
        text: t('unit'),
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function(val: any) {
          return val + ' ' + t('unit');
        },
      },
    },
  },
};

const chartDate = [
  'Today',
  'Yesterday',
  'Week',
  'Previous Week',
  'Month',
  'Previous Month',
];

function getPreviousMonday() {
  var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000),
    day = beforeOneWeek.getDay(),
    diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1),
    lastMonday = new Date(beforeOneWeek.setDate(diffToMonday));
  //lastSunday = new Date(beforeOneWeek.setDate(diffToMonday + 6));
  return lastMonday;
}

const getSeries = (datas: any[], dates: string[]) => {
  let tmp = [];
  let series = [];
  let names = getNames(datas);

  names.forEach(name => {
    let objSeries = {
      name: name,
      data: [],
    };
    tmp = datas.filter(function(data) {
      return (
        (data._id && data._id === name) ||
        (data._id === null && 'Unassigned' === name)
      );
    });
    dates.forEach(date => {
      let index =
        tmp && tmp[0]
          ? tmp[0].startDate.findIndex(function(elem) {
              return elem.replace(/\b0+/g, '') === date;
            })
          : -1;
      let cnt = index >= 0 ? tmp[0].count[index] : 0;
      objSeries.data.push(cnt);
    });

    series.push(objSeries);
  });

  return series;
};

const getNames = datas => {
  let tmp = [];
  tmp = datas.map(a => {
    return a._id ? a._id : 'Unassigned';
  });
  var unique = tmp.filter(function(elem, index, self) {
    return index === self.indexOf(elem);
  });

  return unique;
};

const getDaysByType = (type: string): string[] => {
  let tmpDays = [];
  if (type === 'Today') {
    return [new Date().toLocaleDateString()];
  } else if (type === 'Yesterday') {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return [yesterday.toLocaleDateString()];
  } else if (type === 'Week') {
    var mondayDT = new Date();
    while (mondayDT.getDay() != 1) {
      mondayDT.setDate(mondayDT.getDate() - 1);
    }
    var day = mondayDT.getUTCDate();
    var month = mondayDT.getMonth();
    var year = mondayDT.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < 7; i++) {
      if (daysInMonth <= day) {
        tmpDays.push(month + 1 + '/' + day + '/' + year);
        day = 1;
        mondayDT.setMonth(month + 1);
        month = mondayDT.getMonth();
        continue;
      }
      tmpDays.push(month + 1 + '/' + day + '/' + year);
      day++;
    }
    return tmpDays;
  } else if (type === 'Previous Week') {
    var prevMondayDT = getPreviousMonday();
    var day = prevMondayDT.getUTCDate();
    var month = prevMondayDT.getMonth();
    var year = prevMondayDT.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < 7; i++) {
      if (daysInMonth <= day) {
        tmpDays.push(month + 1 + '/' + day + '/' + year);
        day = 1;
        prevMondayDT.setMonth(month + 1);
        month = prevMondayDT.getMonth();
        continue;
      }
      tmpDays.push(month + 1 + '/' + day + '/' + year);
      day++;
    }
    return tmpDays;
  } else if (type === 'Month') {
    var month = new Date().getMonth();
    var year = new Date().getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < daysInMonth; i++) {
      tmpDays.push(month + 1 + '/' + (i + 1) + '/' + year);
    }
    return tmpDays;
  } else if (type === 'Previous Month') {
    const current = new Date();
    current.setMonth(current.getMonth() - 1);

    var month = current.getMonth();
    var year = current.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < daysInMonth; i++) {
      tmpDays.push(month + 1 + '/' + (i + 1) + '/' + year);
    }
    return tmpDays;
  }
  return [];
};

const getDateByType = type => {
  let startDate = new Date();
  let endDate = new Date();
  if (type === 'Today') {
  } else if (type === 'Yesterday') {
    startDate.setDate(startDate.getDate() - 1);
    endDate = new Date(startDate);
  } else if (type === 'Week') {
    while (startDate.getDay() != 1) {
      startDate.setDate(startDate.getDate() - 1);
    }
    endDate.setDate(startDate.getDate() + 6);
  } else if (type === 'Previous Week') {
    startDate = getPreviousMonday();
    endDate.setDate(startDate.getDate() + 6);
  } else if (type === 'Month') {
    startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  } else if (type === 'Previous Month') {
    startDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1,
    );
    endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
  }
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

type Props = {
  className: string;
  title: string;
  chartId: string;
};

const ReportChart: React.FC<Props> = ({
  className,
  title,
  chartId,
  ...rest
}) => {
  const classes = useStyles();
  var monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  var monthEnd = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  );

  const [chartOptions, setChartOptions] = useState({
    ...initoptions,
    options: {
      ...initoptions.options,
      chart: { id: chartId, type: 'bar', height: 350 },
    },
  });

  const [filterChart, setFilterChart] = useState({
    startDate: monthStart,
    endDate: monthEnd,
    value: 'Month',
  });

  const handleSelect = value => {
    setFilterChart({
      startDate: new Date(),
      endDate: new Date(),
      value: value,
      ...getDateByType(value),
    });
  };

  return (
    <Card className={`${classes.root} ${className}`} {...rest}>
      <CardHeader
        action={
          <Select
            label={t('Date')}
            onChange={handleSelect}
            defaultValue={'Month'}
            renderValue={selected => (!selected ? '' : t(selected))}
            inputProps=\{{
              id: 'date-label',
            }}
            options={chartDate.map(c => ({
              value: c,
              label: t(c),
            }))}
          />
        }
        title={title}
      />
      <Divider />
      <CardContent>
        <Box height={400} position="relative">
          <Chart
            options={chartOptions.options}
            series={chartOptions.series}
            height="350"
            type="bar"
            width="97%"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReportChart;
