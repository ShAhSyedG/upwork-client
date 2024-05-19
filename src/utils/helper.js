import moment from 'moment';

export const isoDateFormat = (date) => {
  if (!date) return '--';
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

export const remainingTime = (date) => {
  const startDate = moment(date?.from);
  const endDate = moment(date?.to);
  const duration = moment.duration(endDate.diff(startDate));
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  return `${days}d ${hours}h ${minutes}m`;
};

export const formatCnic = (cnic) => {
  if (!cnic) return;
  const inputStr = cnic.toString();
  return `${inputStr.slice(0, 5)}-${inputStr.slice(5, 12)}-${inputStr.slice(
    12,
  )}`;
};
