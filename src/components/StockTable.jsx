import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './StockTable.css';

const StockTable = ({ stocks }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'bounce_percentage',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Sort stocks based on current sort configuration
  const sortedStocks = useMemo(() => {
    let sortableStocks = [...stocks];
    if (sortConfig !== null) {
      sortableStocks.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableStocks;
  }, [stocks, sortConfig]);

  // Calculate paginated data
  const paginatedStocks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedStocks.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedStocks, currentPage]);

  // Request a sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction indicator
  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Handle page change
  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="stock-table-container">
      <div className="table-info">
        <p>Showing {paginatedStocks.length} of {stocks.length} stocks</p>
      </div>
      
      <div className="table-responsive">
        <table className="stock-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('symbol')}>
                Symbol {getSortDirectionIndicator('symbol')}
              </th>
              <th onClick={() => requestSort('sector')}>
                Sector {getSortDirectionIndicator('sector')}
              </th>
              <th onClick={() => requestSort('market_cap_category')}>
                Market Cap {getSortDirectionIndicator('market_cap_category')}
              </th>
              <th onClick={() => requestSort('bounce_percentage')}>
                Bounce % {getSortDirectionIndicator('bounce_percentage')}
              </th>
              <th onClick={() => requestSort('lowest_price')}>
                Lowest (₹) {getSortDirectionIndicator('lowest_price')}
              </th>
              <th onClick={() => requestSort('current_price')}>
                Current (₹) {getSortDirectionIndicator('current_price')}
              </th>
              <th onClick={() => requestSort('lowest_date')}>
                Low Date {getSortDirectionIndicator('lowest_date')}
              </th>
              <th onClick={() => requestSort('days_to_recover')}>
                Days to 20% {getSortDirectionIndicator('days_to_recover')}
              </th>
              <th onClick={() => requestSort('volume_increase')}>
                Vol Incr. {getSortDirectionIndicator('volume_increase')}
              </th>
              <th onClick={() => requestSort('recovery_strength')}>
                Rec. Strength {getSortDirectionIndicator('recovery_strength')}
              </th>
              <th onClick={() => requestSort('relative_sector_performance')}>
                vs Sector {getSortDirectionIndicator('relative_sector_performance')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedStocks.length > 0 ? (
              paginatedStocks.map((stock) => (
                <tr key={stock.symbol}>
                  <td>
                    <Link to={`/stock/${stock.symbol}`} className="stock-link">
                      {stock.display_symbol || stock.symbol}
                    </Link>
                  </td>
                  <td>{stock.sector}</td>
                  <td>{stock.market_cap_category}</td>
                  <td className={stock.bounce_percentage >= 0 ? "positive" : "negative"}>
                    {stock.bounce_percentage.toFixed(2)}%
                  </td>
                  <td>{stock.lowest_price.toFixed(2)}</td>
                  <td>{stock.current_price.toFixed(2)}</td>
                  <td>{formatDate(stock.lowest_date)}</td>
                  <td>{stock.days_to_recover !== null ? stock.days_to_recover : 'N/A'}</td>
                  <td>{stock.volume_increase ? stock.volume_increase.toFixed(2) : 'N/A'}</td>
                  <td>{stock.recovery_strength.toFixed(2)}</td>
                  <td className={stock.relative_sector_performance >= 0 ? "positive" : "negative"}>
                    {stock.relative_sector_performance.toFixed(2)}%
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="no-results">No stocks match the current filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default StockTable;