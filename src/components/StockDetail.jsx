import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
         Tooltip, Legend, Bar, BarChart } from 'recharts';
import { fetchStockData } from '../services/supabase';
import { formatDate } from '../utils/formatters';
import '../styles/components/StockDetail.css';

const StockDetail = ({ recoveryMetrics }) => {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState([]);
  const [stockMetrics, setStockMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Find the stock metrics for this symbol
    const metrics = recoveryMetrics.find(stock => stock.symbol === symbol);
    setStockMetrics(metrics);

    async function fetchHistoricalData() {
      try {
        setLoading(true);
        const data = await fetchStockData(symbol);
        
        // Add 'date' field formatted for charts
        const processedData = data.map(item => ({
          ...item,
          date: formatDate(item.Date),
          // Calculate percentage change from lowest price
          percentageChange: metrics ? 
            ((item.Close - metrics.lowest_price) / metrics.lowest_price) * 100 : 0
        }));
        
        setStockData(processedData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load stock data');
        setLoading(false);
      }
    }

    if (symbol) {
      fetchHistoricalData();
    }
  }, [symbol, recoveryMetrics]);

  // Mark lowest date on the chart
  const referenceLines = stockMetrics ? [
    {
      x: formatDate(stockMetrics.lowest_date),
      stroke: 'red',
      label: 'Lowest'
    }
  ] : [];

  if (loading) return <div className="loading">Loading stock data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stockMetrics) return <div className="error">Stock not found</div>;

  return (
    <div className="stock-detail">
      <div className="stock-header">
        <h1>{stockMetrics.display_symbol || symbol}</h1>
        <div className="stock-metadata">
          <span className="sector">{stockMetrics.sector}</span>
          <span className="market-cap">{stockMetrics.market_cap_category}</span>
        </div>
      </div>

      <div className="metrics-summary">
        <div className="metric-card">
          <h3>Bounce Percentage</h3>
          <p className={stockMetrics.bounce_percentage >= 0 ? "positive" : "negative"}>
            {stockMetrics.bounce_percentage.toFixed(2)}%
          </p>
        </div>
        <div className="metric-card">
          <h3>Current Price</h3>
          <p>₹{stockMetrics.current_price.toFixed(2)}</p>
        </div>
        <div className="metric-card">
          <h3>Lowest Price</h3>
          <p>₹{stockMetrics.lowest_price.toFixed(2)}</p>
          <small>{formatDate(stockMetrics.lowest_date)}</small>
        </div>
        <div className="metric-card">
          <h3>Recovery Strength</h3>
          <p>{stockMetrics.recovery_strength.toFixed(2)}</p>
        </div>
      </div>

      <div className="chart-section">
        <h2>Price Recovery Chart</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={stockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              interval={Math.ceil(stockData.length / 10)} 
              angle={-45} 
              textAnchor="end"
              height={70}
            />
            <YAxis yAxisId="left" orientation="left" label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Change (%)', angle: 90, position: 'insideRight' }} />
            <Tooltip formatter={(value, name) => {
              if (name === 'Close') return [`₹${value.toFixed(2)}`, 'Price'];
              if (name === 'percentageChange') return [`${value.toFixed(2)}%`, 'Change from Low'];
              return [value, name];
            }} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="Close" stroke="#8884d8" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="percentageChange" stroke="#82ca9d" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">
        <h2>Trading Volume</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              interval={Math.ceil(stockData.length / 10)} 
              angle={-45} 
              textAnchor="end"
              height={70}
            />
            <YAxis label={{ value: 'Volume', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => [value.toLocaleString(), 'Volume']} />
            <Legend />
            <Bar dataKey="Volume" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="additional-metrics">
        <h2>Additional Recovery Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-item">
            <h3>Days to 20% Recovery</h3>
            <p>{stockMetrics.days_to_recover !== null ? stockMetrics.days_to_recover : 'N/A'}</p>
          </div>
          <div className="metric-item">
            <h3>Volume Increase</h3>
            <p>{stockMetrics.volume_increase ? `${stockMetrics.volume_increase.toFixed(2)}x` : 'N/A'}</p>
          </div>
          <div className="metric-item">
            <h3>vs Sector Average</h3>
            <p className={stockMetrics.relative_sector_performance >= 0 ? "positive" : "negative"}>
              {stockMetrics.relative_sector_performance.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;