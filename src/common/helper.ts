export const getSteps = (status: string, step = 'Created') => {
  let activeStep: number = 0;
  let values: string[] = [];
  switch (status) {
    case 'Pending':
    case 'Created':
    case 'Pickedup':
    case 'Canceled':
    case 'Deleted':
      activeStep = 0;
      values = [status, step, 'InTransit', 'Delivered'];
      break;
    case 'Facility':
    case 'Failed':
      activeStep = 1;
      values = ['Created', status, 'InTransit', 'Delivered'];
      break;
    case 'InTransit':
      activeStep = 2;
      values = ['Created', step, status, 'Delivered'];
      break;
    case 'Returned':
    case 'Delivered':
    case 'Declined':
      activeStep = 3;
      values = ['Created', step, 'InTransit', status];
      break;
    default:
      break;
  }
  return {values, activeStep};
};
