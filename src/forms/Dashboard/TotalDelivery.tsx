import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  colors,
  makeStyles,
} from '@material-ui/core';
import { Text } from 'nuudel-core';
import { t } from '@Translate';
import { formatPrice } from 'nuudel-utils';

const cardColor = colors.purple['500'];

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
  },
  avatar: {
    height: 56,
    width: 56,
  },
  differenceIcon: {
    color: cardColor, //colors.red[900],
  },
  differenceValue: {
    color: colors.red[900],
    marginRight: theme.spacing(1),
  },
  cardHeader: {
    color: cardColor,
    fontWeight: 400,
    textTransform: 'uppercase',
  },
  amount: {
    fontWeight: 300,
  },
  bgCover: {
    backgroundImage:
      'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%,rgba(255,255,255,0.8) 100%), url(/images/choices-order.svg)',
    backgroundAttachment: 'static',
    backgroundPosition: 'bottom 5px right 10px',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '25%',
    borderLeft: `5px solid ${cardColor}`,
  },
  actionBar: {
    background:
      'linear-gradient(90deg, rgba(187,179,179,1) 0%, rgba(255,255,255,1) 100%)',
    borderLeft: `5px solid ${cardColor}`,
  },
}));

type Props = {
  className: string;
  total: number;
  totalYesterday: number;
};

const TotalDelivery: React.FC<Props> = ({
  className,
  total,
  totalYesterday,
  ...rest
}) => {
  const classes = useStyles();

  return (
    <Card className={`${classes.root} ${className}`} {...rest}>
      <CardContent className={classes.bgCover}>
        <Grid container justifyContent="space-between" spacing={3}>
          <Grid item>
            <Text className={classes.cardHeader} gutterBottom variant="h6">
              {t('TotalDelivery')}
            </Text>
            <Text color="textPrimary" variant="h4" className={classes.amount}>
              {formatPrice(total)}
            </Text>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions className={classes.actionBar}>
        <Text className={classes.differenceValue} variant="body2">
          {formatPrice(totalYesterday)}
        </Text>
        <Text color="textSecondary" variant="caption">
          {t('TotalDeliveryMonth')}
        </Text>
      </CardActions>
    </Card>
  );
};

export default TotalDelivery;
