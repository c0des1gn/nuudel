import React from 'react';
import {Card, CardContent, CardActions, Grid, colors} from '@mui/material';
import {Text} from 'nuudel-core';
import {t} from '@Translate';
import {formatPrice} from 'nuudel-utils';
import styles from './styles.module.scss';

const cardColor = colors.green['500'];

type Props = {
  className: string;
  total: number;
  totalYesterday: number;
};

const Delivered: React.FC<Props> = ({
  className,
  total,
  totalYesterday,
  ...rest
}) => {
  return (
    <Card className={`${styles.cardcont} ${className}`} {...rest}>
      <CardContent
        className={styles.bgCover}
        style=\{{
          borderLeft: `5px solid ${cardColor}`,
          backgroundImage:
            'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%,rgba(255,255,255,0.8) 100%), url(/svg/shipped-truck.svg)',
        }}>
        <Grid container justifyContent="space-between" spacing={3}>
          <Grid item>
            <Text
              className={styles.cardHeader}
              style=\{{color: cardColor}}
              gutterBottom
              variant="h6">
              {t('Delivered')}
            </Text>
            <Text color="textPrimary" variant="h4" className={styles.amount}>
              {formatPrice(total)}
            </Text>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions
        className={styles.actionBar}
        style=\{{
          borderLeft: `5px solid ${cardColor}`,
        }}>
        <Text
          className={styles.differenceValue}
          style=\{{color: colors.green[900]}}
          variant="body2">
          {formatPrice(totalYesterday)}
        </Text>
        <Text color="textSecondary" variant="caption">
          {t('DeliveredMonth')}
        </Text>
      </CardActions>
    </Card>
  );
};

export default Delivered;
