// DeFi Security Dashboard - React Application
const { useState, useEffect, useRef } = React;

// Sample data from the provided JSON
const sampleData = {
  "transactions": [
    {
      "id": "0x1a2b3c4d5e6f7890",
      "timestamp": "2025-07-21T18:41:00Z",
      "from": "0x742d35Cc6634C0532925a3b8D0C9e3f8A123456789",
      "to": "0x8ba1f109551bD432803012645Hac136c22416",
      "value": "2.5",
      "mlScore": 92,
      "status": "normal",
      "gasUsed": "21000",
      "blockNumber": 12345678,
      "attackType": null
    },
    {
      "id": "0x9f8e7d6c5b4a3210",
      "timestamp": "2025-07-21T18:40:30Z",
      "from": "0x123456789abcdef0123456789abcdef012345678",
      "to": "0x8ba1f109551bD432803012645Hac136c22416",
      "value": "100.0",
      "mlScore": 15,
      "status": "blocked",
      "gasUsed": "0",
      "blockNumber": 12345677,
      "attackType": "flash_loan"
    },
    {
      "id": "0xa1b2c3d4e5f67890",
      "timestamp": "2025-07-21T18:39:45Z",
      "from": "0xabcdef0123456789abcdef0123456789abcdef01",
      "to": "0x8ba1f109551bD432803012645Hac136c22416",
      "value": "0.1",
      "mlScore": 78,
      "status": "suspicious",
      "gasUsed": "35000",
      "blockNumber": 12345676,
      "attackType": "reentrancy"
    }
  ],
  "contractStatus": {
    "guard": {
      "address": "0x1234567890abcdef1234567890abcdef12345678",
      "isPaused": false,
      "threshold": 50,
      "lastUpdate": "2025-07-21T18:41:00Z",
      "totalBlocked": 156,
      "owner": "0x742d35Cc6634C0532925a3b8D0C9e3f8A123456789"
    },
    "oracle": {
      "address": "0xabcdef1234567890abcdef1234567890abcdef12",
      "lastUpdate": "2025-07-21T18:40:50Z",
      "updateFrequency": 300,
      "reliability": 99.7,
      "priceData": {
        "ETH": 2350.75,
        "BTC": 67890.23
      }
    }
  },
  "systemMetrics": {
    "transactionsMonitored": 45672,
    "attacksDetected": 234,
    "successRate": 99.2,
    "averageResponseTime": 150,
    "apiHealth": "healthy",
    "blockchainSyncStatus": "synced"
  },
  "attackTypes": [
    {
      "name": "Reentrancy",
      "count": 89,
      "percentage": 38.2,
      "color": "#ef4444"
    },
    {
      "name": "Flash Loan",
      "count": 67,
      "percentage": 28.6,
      "color": "#f59e0b"
    },
    {
      "name": "Oracle Manipulation",
      "count": 43,
      "percentage": 18.4,
      "color": "#8b5cf6"
    },
    {
      "name": "Front Running",
      "count": 35,
      "percentage": 14.8,
      "color": "#06b6d4"
    }
  ],
  "performanceData": [
    {
      "timestamp": "18:35",
      "responseTime": 145,
      "throughput": 1250,
      "errorRate": 0.2
    },
    {
      "timestamp": "18:36",
      "responseTime": 152,
      "throughput": 1180,
      "errorRate": 0.3
    },
    {
      "timestamp": "18:37",
      "responseTime": 148,
      "throughput": 1220,
      "errorRate": 0.1
    },
    {
      "timestamp": "18:38",
      "responseTime": 143,
      "throughput": 1280,
      "errorRate": 0.2
    },
    {
      "timestamp": "18:39",
      "responseTime": 156,
      "throughput": 1150,
      "errorRate": 0.4
    },
    {
      "timestamp": "18:40",
      "responseTime": 149,
      "throughput": 1200,
      "errorRate": 0.1
    },
    {
      "timestamp": "18:41",
      "responseTime": 150,
      "throughput": 1250,
      "errorRate": 0.2
    }
  ],
  "alerts": [
    {
      "id": 1,
      "timestamp": "2025-07-21T18:40:30Z",
      "type": "high_risk_transaction",
      "message": "High-risk flash loan attack detected and blocked",
      "severity": "critical"
    },
    {
      "id": 2,
      "timestamp": "2025-07-21T18:39:45Z",
      "type": "suspicious_activity",
      "message": "Suspicious reentrancy pattern detected",
      "severity": "warning"
    },
    {
      "id": 3,
      "timestamp": "2025-07-21T18:38:15Z",
      "type": "system_info",
      "message": "Guard contract threshold updated to 50",
      "severity": "info"
    }
  ],
  "networkInfo": {
    "name": "BlockDAG Testnet",
    "chainId": "0x539",
    "blockNumber": 12345678,
    "gasPrice": "20",
    "connected": true
  }
};

// Utility functions
const formatAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
};

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return React.createElement('div', { className: `toast ${type}` },
    React.createElement('div', { className: 'toast-content' },
      React.createElement('div', { className: 'toast-message' }, message)
    ),
    React.createElement('button', { 
      className: 'toast-close', 
      onClick: onClose 
    }, React.createElement('i', { className: 'fas fa-times' }))
  );
};

// Overview Dashboard Component
const OverviewView = ({ data, showToast }) => {
  const chartRef = useRef();
  const chartInstance = useRef();

  useEffect(() => {
    if (chartRef.current && window.Chart) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.attackTypes.map(type => type.name),
          datasets: [{
            data: data.attackTypes.map(type => type.count),
            backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data.attackTypes]);

  return React.createElement('div', null,
    React.createElement('div', { className: 'view-header' },
      React.createElement('h2', null, 'System Overview'),
      React.createElement('p', { className: 'text-secondary' }, 'Real-time monitoring of DeFi security systems')
    ),

    React.createElement('div', { className: 'stats-grid' },
      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-icon success' },
          React.createElement('i', { className: 'fas fa-shield-check' })
        ),
        React.createElement('div', { className: 'stat-content' },
          React.createElement('div', { className: 'stat-value' }, 
            data.contractStatus.guard.isPaused ? 'Paused' : 'Active'),
          React.createElement('div', { className: 'stat-label' }, 'Guard Contract')
        )
      ),

      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-icon info' },
          React.createElement('i', { className: 'fas fa-clock' })
        ),
        React.createElement('div', { className: 'stat-content' },
          React.createElement('div', { className: 'stat-value' }, 
            formatTime(data.contractStatus.oracle.lastUpdate)),
          React.createElement('div', { className: 'stat-label' }, 'Oracle Update')
        )
      ),

      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-icon primary' },
          React.createElement('i', { className: 'fas fa-exchange-alt' })
        ),
        React.createElement('div', { className: 'stat-content' },
          React.createElement('div', { className: 'stat-value' }, 
            formatNumber(data.systemMetrics.transactionsMonitored)),
          React.createElement('div', { className: 'stat-label' }, 'Total Monitored')
        )
      ),

      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-icon warning' },
          React.createElement('i', { className: 'fas fa-exclamation-triangle' })
        ),
        React.createElement('div', { className: 'stat-content' },
          React.createElement('div', { className: 'stat-value' }, 
            data.systemMetrics.attacksDetected),
          React.createElement('div', { className: 'stat-label' }, 'Attacks Detected')
        )
      )
    ),

    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6' },
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card__header' },
          React.createElement('h3', null, 'Recent Transactions'),
          React.createElement('div', { className: 'pulse-dot' })
        ),
        React.createElement('div', { className: 'card__body' },
          React.createElement('div', { className: 'transaction-feed' },
            data.transactions.map(tx =>
              React.createElement('div', { key: tx.id, className: 'transaction-item' },
                React.createElement('div', { className: 'transaction-info' },
                  React.createElement('a', { href: '#', className: 'transaction-hash' }, 
                    formatAddress(tx.id)),
                  React.createElement('div', { className: 'transaction-meta' },
                    React.createElement('span', null, formatTime(tx.timestamp)),
                    React.createElement('span', null, `${tx.value} ETH`),
                    React.createElement('span', { className: `status status--${tx.status}` }, tx.status)
                  )
                ),
                React.createElement('div', { className: 'ml-score' },
                  React.createElement('span', null, tx.mlScore),
                  React.createElement('div', { className: 'score-bar' },
                    React.createElement('div', { 
                      className: `score-fill ${tx.mlScore > 70 ? 'high' : tx.mlScore > 40 ? 'medium' : 'low'}`,
                      style: { width: `${tx.mlScore}%` }
                    })
                  )
                )
              )
            )
          )
        )
      ),

      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card__header' },
          React.createElement('h3', null, 'Attack Types Distribution')
        ),
        React.createElement('div', { className: 'card__body' },
          React.createElement('div', { className: 'chart-container' },
            React.createElement('canvas', { ref: chartRef })
          )
        )
      )
    ),

    React.createElement('div', { className: 'card mt-6' },
      React.createElement('div', { className: 'card__header' },
        React.createElement('h3', null, 'System Alerts')
      ),
      React.createElement('div', { className: 'card__body' },
        React.createElement('div', { className: 'alerts-list' },
          data.alerts.map(alert =>
            React.createElement('div', { key: alert.id, className: `alert-item ${alert.severity}` },
              React.createElement('div', { className: 'alert-icon' },
                React.createElement('i', { 
                  className: `fas ${alert.severity === 'critical' ? 'fa-exclamation-circle' : 
                    alert.severity === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}` 
                })
              ),
              React.createElement('div', { className: 'alert-content' },
                React.createElement('div', { className: 'alert-message' }, alert.message),
                React.createElement('div', { className: 'alert-time' }, formatTime(alert.timestamp))
              )
            )
          )
        )
      )
    )
  );
};

// Transaction Monitor Component
const TransactionView = ({ data, showToast }) => {
  const [txAmount, setTxAmount] = useState('0.1');
  const [transactions, setTransactions] = useState(data.transactions);

  const handleSubmitTransaction = (e) => {
    e.preventDefault();
    
    const newTx = {
      id: `0x${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toISOString(),
      from: '0x742d35Cc6634C0532925a3b8D0C9e3f8A123456789',
      to: '0x8ba1f109551bD432803012645Hac136c22416',
      value: txAmount,
      mlScore: Math.floor(Math.random() * 100),
      status: Math.random() > 0.8 ? 'suspicious' : 'normal',
      gasUsed: '21000',
      blockNumber: Math.floor(Math.random() * 1000000),
      attackType: null
    };

    setTransactions(prev => [newTx, ...prev]);
    showToast(`Transaction submitted: ${formatAddress(newTx.id)}`, 'success');
  };

  return React.createElement('div', null,
    React.createElement('div', { className: 'view-header' },
      React.createElement('h2', null, 'Transaction Monitor'),
      React.createElement('p', { className: 'text-secondary' }, 'Submit transactions and monitor ML analysis')
    ),

    React.createElement('div', { className: 'card mb-6' },
      React.createElement('div', { className: 'card__header' },
        React.createElement('h3', null, 'Send Test Transaction')
      ),
      React.createElement('div', { className: 'card__body' },
        React.createElement('form', { onSubmit: handleSubmitTransaction, className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { className: 'form-label' }, 'Vault Address'),
            React.createElement('input', { 
              type: 'text', 
              className: 'form-control', 
              value: '0x8ba1f109551bD432803012645Hac136c22416', 
              readOnly: true 
            })
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { className: 'form-label' }, 'Amount (ETH)'),
            React.createElement('input', { 
              type: 'number', 
              className: 'form-control',
              value: txAmount, 
              onChange: (e) => setTxAmount(e.target.value),
              placeholder: '0.1', 
              step: '0.001', 
              min: '0' 
            })
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { className: 'form-label' }, 'Action'),
            React.createElement('button', { type: 'submit', className: 'btn btn--primary btn--full-width' },
              React.createElement('i', { className: 'fas fa-paper-plane mr-2' }),
              'Send Transaction'
            )
          )
        ),
        React.createElement('div', { className: 'mt-4 p-4 bg-secondary rounded-lg' },
          React.createElement('div', { className: 'text-sm' },
            React.createElement('strong', null, 'Gas Estimate:'), ' 21,000 gas',
            React.createElement('strong', { className: 'ml-4' }, 'Cost:'), ' ~$0.42'
          )
        )
      )
    ),

    React.createElement('div', { className: 'card' },
      React.createElement('div', { className: 'card__header' },
        React.createElement('h3', null, 'Live Transaction Feed'),
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement('button', { className: 'btn btn--outline btn--sm' },
            React.createElement('i', { className: 'fas fa-pause' })
          ),
          React.createElement('button', { className: 'btn btn--outline btn--sm' },
            React.createElement('i', { className: 'fas fa-download' })
          )
        )
      ),
      React.createElement('div', { className: 'card__body' },
        React.createElement('div', { className: 'transaction-table-container' },
          React.createElement('table', { className: 'transaction-table' },
            React.createElement('thead', null,
              React.createElement('tr', null,
                React.createElement('th', null, 'Hash'),
                React.createElement('th', null, 'Time'),
                React.createElement('th', null, 'From'),
                React.createElement('th', null, 'Value'),
                React.createElement('th', null, 'ML Score'),
                React.createElement('th', null, 'Status')
              )
            ),
            React.createElement('tbody', null,
              transactions.map(tx =>
                React.createElement('tr', { key: tx.id },
                  React.createElement('td', null,
                    React.createElement('code', { className: 'contract-address' }, formatAddress(tx.id))
                  ),
                  React.createElement('td', null, formatTime(tx.timestamp)),
                  React.createElement('td', null,
                    React.createElement('code', { className: 'contract-address' }, formatAddress(tx.from))
                  ),
                  React.createElement('td', null, `${tx.value} ETH`),
                  React.createElement('td', null,
                    React.createElement('div', { className: 'flex items-center gap-2' },
                      React.createElement('span', null, tx.mlScore),
                      React.createElement('div', { className: 'score-bar' },
                        React.createElement('div', { 
                          className: `score-fill ${tx.mlScore > 70 ? 'high' : tx.mlScore > 40 ? 'medium' : 'low'}`,
                          style: { width: `${tx.mlScore}%` }
                        })
                      )
                    )
                  ),
                  React.createElement('td', null,
                    React.createElement('span', { className: `status status--${tx.status}` }, tx.status)
                  )
                )
              )
            )
          )
        )
      )
    )
  );
};

// Attack Detection Component
const DetectionView = ({ data, showToast }) => {
  const [threatLevel, setThreatLevel] = useState('low');
  const [simulationResults, setSimulationResults] = useState(null);

  const simulateAttack = (attackType) => {
    showToast(`Simulating ${attackType} attack...`, 'info');
    
    setTimeout(() => {
      const result = {
        type: attackType,
        detected: Math.random() > 0.2,
        confidence: Math.floor(Math.random() * 30) + 70,
        blocked: Math.random() > 0.1,
        details: `${attackType} simulation completed with ${Math.floor(Math.random() * 5) + 1} attack vectors tested`
      };
      
      setSimulationResults(result);
      showToast(`${attackType} simulation ${result.detected ? 'detected and blocked' : 'completed'}`, 
                result.detected ? 'success' : 'warning');
    }, 2000);
  };

  return React.createElement('div', null,
    React.createElement('div', { className: 'view-header' },
      React.createElement('h2', null, 'Attack Detection'),
      React.createElement('p', { className: 'text-secondary' }, 'ML-powered threat detection and simulation')
    ),

    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6' },
      React.createElement('div', { className: 'threat-level-card' },
        React.createElement('div', { className: 'threat-indicator' },
          React.createElement('div', { className: `threat-circle ${threatLevel}` },
            React.createElement('span', { className: 'threat-text' }, threatLevel.toUpperCase())
          )
        ),
        React.createElement('div', { className: 'mt-4 text-center' },
          React.createElement('h4', null, 'Current Threat Level'),
          React.createElement('p', { className: 'text-sm text-secondary' }, 'Based on ML analysis')
        )
      ),

      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card__body text-center' },
          React.createElement('div', { className: 'text-3xl font-bold text-success mb-2' }, '94.2%'),
          React.createElement('div', { className: 'text-sm text-secondary' }, 'ML Model Confidence'),
          React.createElement('div', { className: 'confidence-bar mt-2' },
            React.createElement('div', { className: 'confidence-fill', style: { width: '94.2%' } })
          )
        )
      ),

      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card__body text-center' },
          React.createElement('div', { className: 'text-3xl font-bold text-primary mb-2' }, '23'),
          React.createElement('div', { className: 'text-sm text-secondary' }, 'Blocked Today'),
          React.createElement('div', { className: 'text-xs text-success mt-1' }, '↑ 12% from yesterday')
        )
      )
    ),

    React.createElement('div', { className: 'card mb-6' },
      React.createElement('div', { className: 'card__header' },
        React.createElement('h3', null, 'Attack Simulation')
      ),
      React.createElement('div', { className: 'card__body' },
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4' },
          React.createElement('button', { 
            className: 'simulation-btn', 
            onClick: () => simulateAttack('Reentrancy') 
          },
            React.createElement('div', { className: 'simulation-icon' },
              React.createElement('i', { className: 'fas fa-repeat text-red-500' })
            ),
            React.createElement('div', null,
              React.createElement('div', { className: 'font-semibold' }, 'Reentrancy Attack'),
              React.createElement('div', { className: 'text-sm text-secondary' }, 'Test recursive call detection')
            )
          ),
          
          React.createElement('button', { 
            className: 'simulation-btn', 
            onClick: () => simulateAttack('Flash Loan') 
          },
            React.createElement('div', { className: 'simulation-icon' },
              React.createElement('i', { className: 'fas fa-bolt text-orange-500' })
            ),
            React.createElement('div', null,
              React.createElement('div', { className: 'font-semibold' }, 'Flash Loan Attack'),
              React.createElement('div', { className: 'text-sm text-secondary' }, 'Test arbitrage manipulation')
            )
          )
        ),
        
        simulationResults && React.createElement('div', { className: 'simulation-results p-4 bg-secondary rounded-lg' },
          React.createElement('div', { className: 'flex items-center justify-between mb-4' },
            React.createElement('h4', null, `${simulationResults.type} Simulation Results`),
            React.createElement('span', { 
              className: `status ${simulationResults.detected ? 'status--success' : 'status--warning'}` 
            }, simulationResults.detected ? 'Detected' : 'Not Detected')
          ),
          React.createElement('div', { className: 'grid grid-cols-2 gap-4 text-sm' },
            React.createElement('div', null,
              React.createElement('strong', null, 'Confidence:'), ` ${simulationResults.confidence}%`
            ),
            React.createElement('div', null,
              React.createElement('strong', null, 'Blocked:'), ` ${simulationResults.blocked ? 'Yes' : 'No'}`
            )
          ),
          React.createElement('p', { className: 'mt-2 text-sm text-secondary' }, simulationResults.details)
        )
      )
    ),

    React.createElement('div', { className: 'card' },
      React.createElement('div', { className: 'card__header' },
        React.createElement('h3', null, 'Blocked Transactions Log')
      ),
      React.createElement('div', { className: 'card__body' },
        React.createElement('div', { className: 'blocked-transactions' },
          data.transactions.filter(tx => tx.status === 'blocked').map(tx =>
            React.createElement('div', { key: tx.id, className: 'transaction-item' },
              React.createElement('div', { className: 'transaction-info' },
                React.createElement('a', { href: '#', className: 'transaction-hash' }, formatAddress(tx.id)),
                React.createElement('div', { className: 'transaction-meta' },
                  React.createElement('span', null, formatTime(tx.timestamp)),
                  React.createElement('span', null, `Attack Type: ${tx.attackType}`),
                  React.createElement('span', { className: 'text-error' }, `ML Score: ${tx.mlScore}`)
                )
              ),
              React.createElement('div', { className: 'status status--error' }, 'Blocked')
            )
          )
        )
      )
    )
  );
};

// Smart Contracts Component
const ContractsView = ({ data, showToast }) => {
  const [guardStatus, setGuardStatus] = useState(data.contractStatus.guard);
  const [oracleStatus, setOracleStatus] = useState(data.contractStatus.oracle);
  const [newThreshold, setNewThreshold] = useState(guardStatus.threshold);

  const pauseGuard = () => {
    setGuardStatus(prev => ({ ...prev, isPaused: true }));
    showToast('Guard contract paused successfully', 'success');
  };

  const resumeGuard = () => {
    setGuardStatus(prev => ({ ...prev, isPaused: false }));
    showToast('Guard contract resumed successfully', 'success');
  };

  const updateThreshold = () => {
    setGuardStatus(prev => ({ ...prev, threshold: newThreshold }));
    showToast(`Threshold updated to ${newThreshold}`, 'success');
  };

  const manualOracleUpdate = () => {
    setOracleStatus(prev => ({ 
      ...prev, 
      lastUpdate: new Date().toISOString(),
      priceData: {
        ETH: prev.priceData.ETH + (Math.random() - 0.5) * 100,
        BTC: prev.priceData.BTC + (Math.random() - 0.5) * 1000
      }
    }));
    showToast('Oracle updated manually', 'success');
  };

  return React.createElement('div', null,
    React.createElement('div', { className: 'view-header' },
      React.createElement('h2', null, 'Smart Contracts'),
      React.createElement('p', { className: 'text-secondary' }, 'Monitor and control Guard and Oracle contracts')
    ),

    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card__header' },
          React.createElement('h3', null, 'Guard Contract'),
          React.createElement('div', { 
            className: `status ${guardStatus.isPaused ? 'status--warning' : 'status--success'}` 
          }, guardStatus.isPaused ? 'Paused' : 'Active')
        ),
        React.createElement('div', { className: 'card__body' },
          React.createElement('div', { className: 'contract-info' },
            React.createElement('div', { className: 'info-item' },
              React.createElement('label', null, 'Address:'),
              React.createElement('code', { className: 'contract-address' }, formatAddress(guardStatus.address))
            ),
            React.createElement('div', { className: 'info-item' },
              React.createElement('label', null, 'Threshold:'),
              React.createElement('span', null, guardStatus.threshold)
            ),
            React.createElement('div', { className: 'info-item' },
              React.createElement('label', null, 'Total Blocked:'),
              React.createElement('span', null, guardStatus.totalBlocked)
            )
          ),

          React.createElement('div', { className: 'contract-controls mt-4' },
            React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
              React.createElement('button', { 
                className: 'btn btn--outline', 
                onClick: pauseGuard, 
                disabled: guardStatus.isPaused 
              },
                React.createElement('i', { className: 'fas fa-pause mr-2' }),
                'Emergency Pause'
              ),
              React.createElement('button', { 
                className: 'btn btn--primary', 
                onClick: resumeGuard, 
                disabled: !guardStatus.isPaused 
              },
                React.createElement('i', { className: 'fas fa-play mr-2' }),
                'Resume Operations'
              )
            ),
            
            React.createElement('div', { className: 'form-group mt-4' },
              React.createElement('label', { className: 'form-label' }, 'Update Threshold'),
              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('input', { 
                  type: 'number', 
                  className: 'form-control',
                  value: newThreshold, 
                  onChange: (e) => setNewThreshold(Number(e.target.value)),
                  min: '1', 
                  max: '100' 
                }),
                React.createElement('button', { className: 'btn btn--secondary', onClick: updateThreshold }, 'Update')
              )
            )
          )
        )
      ),

      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card__header' },
          React.createElement('h3', null, 'Oracle Contract'),
          React.createElement('div', { className: 'status status--success' }, 'Active')
        ),
        React.createElement('div', { className: 'card__body' },
          React.createElement('div', { className: 'contract-info' },
            React.createElement('div', { className: 'info-item' },
              React.createElement('label', null, 'Address:'),
              React.createElement('code', { className: 'contract-address' }, formatAddress(oracleStatus.address))
            ),
            React.createElement('div', { className: 'info-item' },
              React.createElement('label', null, 'Last Update:'),
              React.createElement('span', null, formatTime(oracleStatus.lastUpdate))
            ),
            React.createElement('div', { className: 'info-item' },
              React.createElement('label', null, 'Reliability:'),
              React.createElement('span', null, `${oracleStatus.reliability}%`)
            )
          ),

          React.createElement('div', { className: 'price-data mt-4' },
            React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
              React.createElement('div', { className: 'price-item' },
                React.createElement('div', { className: 'price-label' }, 'ETH'),
                React.createElement('div', { className: 'price-value' }, `$${oracleStatus.priceData.ETH.toFixed(2)}`)
              ),
              React.createElement('div', { className: 'price-item' },
                React.createElement('div', { className: 'price-label' }, 'BTC'),
                React.createElement('div', { className: 'price-value' }, `$${oracleStatus.priceData.BTC.toFixed(2)}`)
              )
            )
          ),

          React.createElement('div', { className: 'contract-controls mt-4' },
            React.createElement('button', { 
              className: 'btn btn--primary btn--full-width', 
              onClick: manualOracleUpdate 
            },
              React.createElement('i', { className: 'fas fa-sync-alt mr-2' }),
              'Manual Update'
            )
          )
        )
      )
    ),

    React.createElement('div', { className: 'card mt-6' },
      React.createElement('div', { className: 'card__header' },
        React.createElement('h3', null, 'Contract Event Logs')
      ),
      React.createElement('div', { className: 'card__body' },
        React.createElement('div', { className: 'event-logs' },
          React.createElement('div', { className: 'event-item' },
            React.createElement('div', { className: 'event-icon' },
              React.createElement('i', { className: 'fas fa-shield-check' })
            ),
            React.createElement('div', { className: 'event-content' },
              React.createElement('div', { className: 'event-message' }, `Guard contract threshold updated to ${guardStatus.threshold}`),
              React.createElement('div', { className: 'event-time' }, formatTime(guardStatus.lastUpdate))
            )
          ),
          React.createElement('div', { className: 'event-item' },
            React.createElement('div', { className: 'event-icon' },
              React.createElement('i', { className: 'fas fa-sync-alt' })
            ),
            React.createElement('div', { className: 'event-content' },
              React.createElement('div', { className: 'event-message' }, 'Oracle price data updated'),
              React.createElement('div', { className: 'event-time' }, formatTime(oracleStatus.lastUpdate))
            )
          )
        )
      )
    )
  );
};

// Performance Monitor Component
const PerformanceView = ({ data }) => {
  const chartRef = useRef();
  const chartInstance = useRef();

  useEffect(() => {
    if (chartRef.current && window.Chart) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.performanceData.map(d => d.timestamp),
          datasets: [{
            label: 'Response Time (ms)',
            data: data.performanceData.map(d => d.responseTime),
            borderColor: '#1FB8CD',
            backgroundColor: 'rgba(31, 184, 205, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Response Time (ms)'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data.performanceData]);

  return React.createElement('div', null,
    React.createElement('div', { className: 'view-header' },
      React.createElement('h2', null, 'Performance Monitor'),
      React.createElement('p', { className: 'text-secondary' }, 'System metrics and resource usage')
    ),

    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6' },
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card__header' },
          React.createElement('h3', null, 'Response Time')
        ),
        React.createElement('div', { className: 'card__body' },
          React.createElement('div', { className: 'chart-container' },
            React.createElement('canvas', { ref: chartRef })
          )
        )
      ),

      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card__header' },
          React.createElement('h3', null, 'System Health')
        ),
        React.createElement('div', { className: 'card__body' },
          React.createElement('div', { className: 'health-metrics' },
            React.createElement('div', { className: 'health-item' },
              React.createElement('div', { className: 'flex justify-between items-center' },
                React.createElement('span', null, 'API Health'),
                React.createElement('span', { className: 'status status--success' }, 'Healthy')
              ),
              React.createElement('div', { className: 'health-bar' },
                React.createElement('div', { className: 'health-fill success', style: { width: '100%' } })
              )
            ),
            
            React.createElement('div', { className: 'health-item' },
              React.createElement('div', { className: 'flex justify-between items-center' },
                React.createElement('span', null, 'Blockchain Sync'),
                React.createElement('span', { className: 'status status--success' }, 'Synced')
              ),
              React.createElement('div', { className: 'health-bar' },
                React.createElement('div', { className: 'health-fill success', style: { width: '100%' } })
              )
            ),
            
            React.createElement('div', { className: 'health-item' },
              React.createElement('div', { className: 'flex justify-between items-center' },
                React.createElement('span', null, 'ML Model'),
                React.createElement('span', { className: 'status status--success' }, 'Active')
              ),
              React.createElement('div', { className: 'health-bar' },
                React.createElement('div', { className: 'health-fill success', style: { width: '94%' } })
              )
            )
          )
        )
      )
    ),

    React.createElement('div', { className: 'card' },
      React.createElement('div', { className: 'card__header' },
        React.createElement('h3', null, 'Resource Usage')
      ),
      React.createElement('div', { className: 'card__body' },
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
          React.createElement('div', { className: 'resource-item' },
            React.createElement('div', { className: 'resource-header' },
              React.createElement('i', { className: 'fas fa-microchip text-primary' }),
              React.createElement('span', null, 'CPU Usage')
            ),
            React.createElement('div', { className: 'resource-value' }, '45%'),
            React.createElement('div', { className: 'resource-bar' },
              React.createElement('div', { className: 'resource-fill', style: { width: '45%' } })
            )
          ),
          
          React.createElement('div', { className: 'resource-item' },
            React.createElement('div', { className: 'resource-header' },
              React.createElement('i', { className: 'fas fa-memory text-warning' }),
              React.createElement('span', null, 'Memory')
            ),
            React.createElement('div', { className: 'resource-value' }, '67%'),
            React.createElement('div', { className: 'resource-bar' },
              React.createElement('div', { className: 'resource-fill warning', style: { width: '67%' } })
            )
          ),
          
          React.createElement('div', { className: 'resource-item' },
            React.createElement('div', { className: 'resource-header' },
              React.createElement('i', { className: 'fas fa-network-wired text-info' }),
              React.createElement('span', null, 'Network')
            ),
            React.createElement('div', { className: 'resource-value' }, '32%'),
            React.createElement('div', { className: 'resource-bar' },
              React.createElement('div', { className: 'resource-fill info', style: { width: '32%' } })
            )
          )
        )
      )
    )
  );
};

// Testing Suite Component
const TestingView = ({ showToast }) => {
  const [testResults, setTestResults] = useState(null);
  const [testStatuses, setTestStatuses] = useState({});

  const runTest = (testType) => {
    setTestStatuses(prev => ({ ...prev, [testType]: 'running' }));
    showToast(`Running ${testType} test...`, 'info');
    
    setTimeout(() => {
      const passed = Math.random() > 0.3;
      const result = {
        type: testType,
        status: passed ? 'passed' : 'failed',
        details: `${testType} test completed with ${passed ? 'success' : 'failures detected'}`,
        timestamp: new Date().toISOString(),
        metrics: {
          duration: Math.floor(Math.random() * 5000) + 1000,
          coverage: Math.floor(Math.random() * 30) + 70,
          assertions: Math.floor(Math.random() * 50) + 20
        }
      };
      
      setTestStatuses(prev => ({ ...prev, [testType]: result.status }));
      setTestResults(result);
      showToast(`${testType} test ${result.status}`, result.status === 'passed' ? 'success' : 'error');
    }, 3000);
  };

  const testConfig = [
    { key: 'reentrancy', name: 'Reentrancy Test', icon: 'fa-repeat text-red-500' },
    { key: 'oracle', name: 'Oracle Test', icon: 'fa-eye text-purple-500' },
    { key: 'flashloan', name: 'Flashloan Test', icon: 'fa-bolt text-orange-500' },
    { key: 'frontrun', name: 'Front Run Test', icon: 'fa-running text-blue-500' }
  ];

  return React.createElement('div', null,
    React.createElement('div', { className: 'view-header' },
      React.createElement('h2', null, 'Testing Suite'),
      React.createElement('p', { className: 'text-secondary' }, 'Comprehensive security testing and simulation')
    ),

    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6' },
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card__header' },
          React.createElement('h3', null, 'Attack Vector Tests')
        ),
        React.createElement('div', { className: 'card__body' },
          React.createElement('div', { className: 'test-grid' },
            testConfig.map(test =>
              React.createElement('button', { 
                key: test.key, 
                className: 'test-btn', 
                onClick: () => runTest(test.key) 
              },
                React.createElement('i', { className: `fas ${test.icon}` }),
                React.createElement('span', null, test.name),
                React.createElement('div', { className: `test-status ${testStatuses[test.key] || ''}` },
                  (testStatuses[test.key] || 'Ready').charAt(0).toUpperCase() + (testStatuses[test.key] || 'Ready').slice(1)
                )
              )
            )
          )
        )
      ),

      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card__header' },
          React.createElement('h3', null, 'Stress Testing')
        ),
        React.createElement('div', { className: 'card__body' },
          React.createElement('div', { className: 'stress-controls' },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Transaction Volume'),
              React.createElement('select', { className: 'form-control' },
                React.createElement('option', { value: 'low' }, 'Low (100 tx/min)'),
                React.createElement('option', { value: 'medium' }, 'Medium (500 tx/min)'),
                React.createElement('option', { value: 'high' }, 'High (1000 tx/min)')
              )
            ),
            
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Duration'),
              React.createElement('select', { className: 'form-control' },
                React.createElement('option', { value: '1' }, '1 minute'),
                React.createElement('option', { value: '5' }, '5 minutes'),
                React.createElement('option', { value: '10' }, '10 minutes')
              )
            ),
            
            React.createElement('button', { 
              className: 'btn btn--primary btn--full-width', 
              onClick: () => runTest('stress') 
            },
              React.createElement('i', { className: 'fas fa-play mr-2' }),
              'Start Stress Test'
            )
          )
        )
      )
    ),

    React.createElement('div', { className: 'card' },
      React.createElement('div', { className: 'card__header' },
        React.createElement('h3', null, 'Test Results')
      ),
      React.createElement('div', { className: 'card__body' },
        testResults ? React.createElement('div', { className: 'test-results' },
          React.createElement('div', { className: 'flex items-center justify-between mb-4' },
            React.createElement('h4', null, `${testResults.type.charAt(0).toUpperCase() + testResults.type.slice(1)} Test Results`),
            React.createElement('span', { 
              className: `status status--${testResults.status === 'passed' ? 'success' : 'error'}` 
            }, testResults.status.toUpperCase())
          ),
          React.createElement('div', { className: 'grid grid-cols-3 gap-4 mb-4 text-sm' },
            React.createElement('div', null,
              React.createElement('strong', null, 'Duration:'), ` ${testResults.metrics.duration}ms`
            ),
            React.createElement('div', null,
              React.createElement('strong', null, 'Coverage:'), ` ${testResults.metrics.coverage}%`
            ),
            React.createElement('div', null,
              React.createElement('strong', null, 'Assertions:'), ` ${testResults.metrics.assertions}`
            )
          ),
          React.createElement('p', { className: 'text-sm text-secondary' }, testResults.details),
          React.createElement('div', { className: 'text-xs text-secondary mt-2' },
            `Completed at ${formatTime(testResults.timestamp)}`
          )
        ) : React.createElement('div', { className: 'empty-state' },
          React.createElement('i', { className: 'fas fa-flask text-6xl text-gray-300 mb-4' }),
          React.createElement('p', { className: 'text-gray-500' }, 'No tests run yet. Start a test to see results here.')
        )
      )
    )
  );
};

// Navigation Component
const Navigation = ({ currentView, onViewChange }) => {
  const navItems = [
    { key: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
    { key: 'transactions', label: 'Transaction Monitor', icon: 'fa-exchange-alt' },
    { key: 'detection', label: 'Attack Detection', icon: 'fa-bug' },
    { key: 'contracts', label: 'Smart Contracts', icon: 'fa-file-contract' },
    { key: 'performance', label: 'Performance', icon: 'fa-tachometer-alt' },
    { key: 'testing', label: 'Testing Suite', icon: 'fa-flask' }
  ];

  return React.createElement('aside', { className: 'dashboard-sidebar bg-surface border-r border-card-border w-60 flex-shrink-0' },
    React.createElement('nav', { className: 'sidebar-nav p-4' },
      React.createElement('ul', { className: 'nav-list flex flex-col gap-2' },
        navItems.map(item =>
          React.createElement('li', { key: item.key },
            React.createElement('button', {
              className: `nav-item ${currentView === item.key ? 'active' : ''}`,
              onClick: () => onViewChange(item.key)
            },
              React.createElement('i', { className: `fas ${item.icon}` }),
              React.createElement('span', null, item.label)
            )
          )
        )
      )
    )
  );
};

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        showToast('Wallet connected successfully!', 'success');
      } catch (error) {
        showToast('Failed to connect wallet', 'error');
      }
    } else {
      showToast('MetaMask is not installed. Please install MetaMask to connect your wallet.', 'error');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-color-scheme', isDarkMode ? 'light' : 'dark');
  };

  const renderView = () => {
    const props = { data: sampleData, showToast };
    
    switch(currentView) {
      case 'overview': return React.createElement(OverviewView, props);
      case 'transactions': return React.createElement(TransactionView, props);
      case 'detection': return React.createElement(DetectionView, props);
      case 'contracts': return React.createElement(ContractsView, props);
      case 'performance': return React.createElement(PerformanceView, props);
      case 'testing': return React.createElement(TestingView, props);
      default: return React.createElement(OverviewView, props);
    }
  };

  useEffect(() => {
    // Initialize wallet connection check
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        }
      });
    }
  }, []);

  return React.createElement('div', null,
    React.createElement('header', { className: 'dashboard-header shadow-sm p-4 flex items-center justify-between bg-surface sticky top-0 z-30' },
      React.createElement('div', { className: 'flex items-center gap-4' },
        React.createElement('i', { className: 'fas fa-shield-alt text-primary text-2xl' }),
        React.createElement('span', { className: 'font-bold text-xl' }, 'DeFi Security Dashboard')
      ),
      React.createElement('div', { className: 'flex items-center gap-4' },
        React.createElement('div', { className: 'flex items-center gap-2 text-sm' },
          React.createElement('span', { className: 'status-dot bg-success online' }),
          React.createElement('span', null, 'BlockDAG Testnet')
        ),
        React.createElement('button', { 
          className: 'btn btn--outline btn--sm', 
          onClick: toggleTheme,
          'aria-label': 'Toggle Theme'
        },
          React.createElement('i', { className: `fas ${isDarkMode ? 'fa-moon' : 'fa-sun'}` })
        ),
        React.createElement('button', { 
          className: 'btn btn--primary', 
          onClick: connectWallet,
          'aria-label': 'Connect Wallet'
        },
          React.createElement('i', { className: 'fas fa-wallet mr-2' }),
          React.createElement('span', null, isWalletConnected ? formatAddress(walletAddress) : 'Connect Wallet')
        )
      )
    ),

    React.createElement('div', { className: 'dashboard-main flex' },
      React.createElement(Navigation, { 
        currentView: currentView, 
        onViewChange: setCurrentView 
      }),
      React.createElement('main', { className: 'dashboard-content flex-1 p-6 overflow-y-auto' },
        renderView()
      )
    ),

    toasts.length > 0 && React.createElement('div', { className: 'toast-container fixed bottom-4 right-4 flex flex-col gap-2 z-50' },
      toasts.map(toast =>
        React.createElement(Toast, {
          key: toast.id,
          message: toast.message,
          type: toast.type,
          onClose: () => removeToast(toast.id)
        })
      )
    )
  );
};

// Initialize the React app
const container = document.getElementById('mainContent');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(App));
} else {
  // Fallback: render to app div
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.innerHTML = '';
    const root = ReactDOM.createRoot(appContainer);
    root.render(React.createElement(App));
  }
}