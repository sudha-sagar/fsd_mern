import React from 'react';

const StatusBadge = ({ type, status }) => {
  if (!status) return null;

  const formattedStatus = status.replace('_', ' ');

  let badgeClass = `badge badge-${status.toLowerCase()}`;

  return (
    <span className={badgeClass}>
      <span style={{ fontSize: '0.65rem' }}>●</span>
      {formattedStatus}
    </span>
  );
};

export default StatusBadge;
