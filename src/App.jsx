import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { fetchStockRecoveryMetrics, fetchStockMetadata } from './services/supabase';
import Dashboard from './components/Dashboard';
import StockDetail from './components/StockDetail';
import ComparisonTool from './components/ComparisonTool';
import SectorAnalysis from './components/SectorAnalysis';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [recoveryMetrics, setRecoveryMetrics] = useState([]);
  const [stockMetadata, setStockMetadata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const [metricsData, metadataData] = await Promise.all([
          fetchStockRecoveryMetrics(),
          fetchStockMetadata()
        ]);
        
        setRecoveryMetrics(metricsData);
        setStockMetadata(metadataData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar />
        {loading ? (
          <div className="loading">Loading data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  recoveryMetrics={recoveryMetrics} 
                  stockMetadata={stockMetadata} 
                />
              } 
            />
            <Route 
              path="/stock/:symbol" 
              element={<StockDetail recoveryMetrics={recoveryMetrics} />} 
            />
            <Route 
              path="/comparison" 
              element={
                <ComparisonTool 
                  recoveryMetrics={recoveryMetrics} 
                  stockMetadata={stockMetadata} 
                />
              } 
            />
            <Route 
              path="/sector-analysis" 
              element={<SectorAnalysis recoveryMetrics={recoveryMetrics} />} 
            />
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;