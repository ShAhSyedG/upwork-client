import React from 'react';
import { useCountdown } from '../hooks/use-countdown';

const CountdownTimer = ({ endDate }) => {
  const [days, hours, minutes, seconds] = useCountdown(endDate);

  const timeRemaining =
    days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;

  const timerColor = timeRemaining > 3600 ? 'green' : 'red';

  if (!endDate) return <p>Loading</p>;

  return (
    <>
      {!endDate ? (
        <p>Loading...</p>
      ) : (
        <p
          className="p-0 m-0 font-mono"
          style={{ color: timerColor }}
        >{`${days}d ${hours}h ${minutes}m ${seconds}s`}</p>
      )}
    </>
  );
};

export default CountdownTimer;
