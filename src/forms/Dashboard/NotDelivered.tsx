import React from 'react';
import {Card, CardContent, CardActions, Grid, colors} from '@mui/material';
import {Text} from 'nuudel-core';
import {t} from '@Translate';
import {formatPrice} from 'nuudel-utils';
import styles from './styles.module.scss';

const cardColor = colors.orange['500'];

type Props = {
  className: string;
  total: number;
};

const NotDelivered: React.FC<Props> = ({className, total, ...rest}) => {
  return (
    <Card className={`${styles.cardcont} ${className}`} {...rest}>
      <CardContent
        className={styles.bgCover}
        style=\{{
          borderLeft: `5px solid ${cardColor}`,
          backgroundImage:
            'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%,rgba(255,255,255,0.8) 100%), url(/svg/delivery.svg)',
        }}>
        <Grid container justifyContent="space-between" spacing={3}>
          <Grid item>
            <Text
              className={styles.cardHeader}
              style=\{{color: cardColor}}
              gutterBottom
              variant="h6">
              {t('NotDelivered')}
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
          color="textSecondary"
          style=\{{color: colors.green[900]}}
          variant="caption">
          {t('TotalPendingDelivery')}
        </Text>
      </CardActions>
    </Card>
  );
};
export default NotDelivered;
