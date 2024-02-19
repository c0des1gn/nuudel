import React, {useEffect, useState} from 'react';
import {useLazyQuery} from '@apollo/react-hooks';
import {Container, Grid} from '@mui/material';
import TotalDelivery from './TotalOrder';
import Delivered from './Delivered';
import NotDelivered from './NotDelivered';
import TotalProfit from './TotalProfit';
import ReportChart from './ReportChart';
import {t} from '@Translate';
import styles from './styles.module.scss';

function getTimezoneNumber() {
  let offset = new Date().getTimezoneOffset();
  return offset / 60;
}

const Dashboard = () => {
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

  useEffect(() => {
    //getReport();
  }, []);

  return (
    <Container
      maxWidth={false}
      sx={theme => ({
        [theme.breakpoints.down('sm')]: {
          padding: theme.spacing(0),
        },
      })}>
      <Grid container spacing={3}>
        <Grid item lg={3} sm={6} xs={12}>
          <TotalDelivery
            className={styles.firstRow}
            total={report['totalOrder'] || 0}
            totalOrderMonth={report['totalOrderMonth'] || 0}
          />
        </Grid>
        <Grid item lg={3} sm={6} xs={12}>
          <Delivered
            className={styles.firstRow}
            total={report['delivered'] || 0}
            totalYesterday={report['deliveredYesterday'] || 0}
          />
        </Grid>
        <Grid item lg={3} sm={6} xs={12}>
          <NotDelivered
            className={styles.firstRow}
            total={report['notdelivered'] || 0}
          />
        </Grid>
        <Grid item lg={3} sm={6} xs={12}>
          <TotalProfit
            className={styles.firstRow}
            total={report['totalAmount'] || 0}
            totalAmountMonth={report['totalAmountMonth'] || 0}
          />
        </Grid>
        <Grid item xs={12}>
          <ReportChart
            className=""
            chartId="courier"
            title={t('MerchantReport')}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
