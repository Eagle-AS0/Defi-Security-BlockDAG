import React from 'react';

const Alerts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return <p>No alerts yet.</p>;
  }

  return (
    <ul>
      {alerts.map((alert, index) => (
        <li key={index}>
          <strong>{alert.title || 'Alert'}:</strong> {alert.message || JSON.stringify(alert)}
        </li>
      ))}
    </ul>
  );
};

export default Alerts;
