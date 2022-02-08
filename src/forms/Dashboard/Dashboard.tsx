import React, { useEffect, useState } from 'react';
import { Container, Grid, makeStyles } from '@material-ui/core';
import TotalDelivery from './TotalDelivery';
import Delivered from './Delivered';
import NotDelivered from './NotDelivered';
import TotalProfit from './TotalProfit';
import ReportChart from './ReportChart';
import { t } from 'api/loc/I18n';

const useStyles = makeStyles(theme => ({
  root: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0),
    },
  },
  firstRow: {
    height: 'auto',
  },
}));

const Dashboard = () => {
  const classes = useStyles();

  const [report, setReport] = useState({});
  let filterDate: any = {};
  const datenow = new Date().toISOString().slice(0, 19);

  filterDate = {
    endDate: {
      $lte: datenow,
    },
    deliveryStatus: {
      $nin: [
        'Deleted',
        'Delivered',
        'Declined',
        'Returned',
        'Canceled',
        'Failed',
      ],
    },
  };

  useEffect(() => {}, []);

  return (
    <Container maxWidth={false} className={classes.root}>
      <Grid container spacing={3}>
        <Grid item lg={3} sm={6} xs={12}>
          <TotalDelivery
            className={classes.firstRow}
            total={report['totalDelivery'] || 0}
            totalYesterday={report['totalDeliveryYesterday'] || 0}
          />
        </Grid>
        <Grid item lg={3} sm={6} xs={12}>
          <Delivered
            className={classes.firstRow}
            total={report['delivered'] || 0}
            totalYesterday={report['deliveredYesterday'] || 0}
          />
        </Grid>
        <Grid item lg={3} sm={6} xs={12}>
          <NotDelivered
            className={classes.firstRow}
            total={report['notdelivered'] || 0}
          />
        </Grid>
        <Grid item lg={3} sm={6} xs={12}>
          <TotalProfit
            className={classes.firstRow}
            total={report['totalAmount'] || 0}
            totalAmountMonth={report['totalAmountMonth'] || 0}
          />
        </Grid>
        <Grid item lg={6} xs={12}>
          <ReportChart
            className=""
            chartId="courier"
            title={t('DriverReport')}
          />
        </Grid>
        <Grid item lg={6} xs={12}>
          <ReportChart
            className=""
            chartId="merchant"
            title={t('MerchantReport')}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
