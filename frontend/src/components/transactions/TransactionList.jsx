import React from 'react';

const TransactionList = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <p>No transactions</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Tx Hash</th>
          <th>From</th>
          <th>To</th>
          <th>Value</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, index) => (
          <tr key={index}>
            <td>{log.txHash}</td>
            <td>{log.from}</td>
            <td>{log.to}</td>
            <td>{log.value}</td>
            <td>{log.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionList;
