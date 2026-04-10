import React, { useState, useEffect } from 'react';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { hrService } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

const SalaryStatistics = () => {
  const [statsData, setStatsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPageParams = parseInt(searchParams.get('page')) || 1;
  const [countryFilter, setCountryFilter] = useState('');
  const [jumpPage, setJumpPage] = useState('');

  const debouncedCountryFilter = useDebounce(countryFilter, 500);

  useEffect(() => {
    fetchSalaryStats(currentPageParams, debouncedCountryFilter);
  }, [currentPageParams, debouncedCountryFilter]);

  useEffect(() => {
    if (debouncedCountryFilter) {
      searchParams.set('page', '1');
      setSearchParams(searchParams);
    }
  }, [debouncedCountryFilter]);

  const fetchSalaryStats = async (page = 1, country = '') => {
    setIsLoading(true);
    try {
      const data = await hrService.getSalaryStats({ page, country });
      setStatsData(data.stats || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('Failed to fetch salary stats');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    searchParams.set('page', newPage);
    setSearchParams(searchParams);
  };

  const getPageNumbers = () => {
    if (!pagination) return [];
    const { current_page, total_pages } = pagination;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total_pages; i++) {
      if (i === 1 || i === total_pages || (i >= current_page - delta && i <= current_page + delta)) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="stats-page">
      <div className="section-header">
        <div className="section-info">
          <h2 className="section-title">Salary Statistics</h2>
          <p className="section-subtitle">View summary of salaries grouped by country</p>
        </div>
        <div className="search-bar" style={{ width: '250px' }}>
          <Filter size={18} strokeWidth={2.5} className="search-icon" />
          <input
            type="text"
            placeholder="Filter by country..."
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="content-card glass-card">
        <div className="table-responsive">
          {isLoading ? (
            <div className="loading-state">
              <Loader2 size={40} className="animate-spin text-primary" />
              <p>Loading data...</p>
            </div>
          ) : (
            <>
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Employees</th>
                    <th>Min Salary</th>
                    <th>Max Salary</th>
                    <th>Avg Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.map((stat, i) => (
                    <tr key={i}>
                      <td>{stat.country}</td>
                      <td style={{ fontWeight: '600', color: '#818cf8' }}>{stat.employee_count}</td>
                      <td>₹{parseFloat(stat.min_salary).toLocaleString()}</td>
                      <td>₹{parseFloat(stat.max_salary).toLocaleString()}</td>
                      <td>₹{parseFloat(stat.average_salary).toLocaleString()}</td>
                    </tr>
                  ))}
                  {statsData.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        No statistics found matching your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {!isLoading && pagination && pagination.total_count > 0 && (
                <div className="pagination">
                  <div className="pagination-info">
                    Showing <span>{((pagination.current_page - 1) * pagination.per_page) + 1}</span> to <span>{Math.min(pagination.current_page * pagination.per_page, pagination.total_count)}</span> of <span>{pagination.total_count}</span> results
                  </div>
                  
                  {pagination.total_pages > 1 && (
                    <>
                      <div className="pagination-controls">
                        <button
                          onClick={() => handlePageChange(Math.max(pagination.current_page - 1, 1))}
                          disabled={pagination.current_page === 1}
                          className="pagi-btn"
                        >
                          <ChevronLeft size={18} />
                        </button>

                        {getPageNumbers().map((pageNumber, i) => (
                          pageNumber === '...' ? (
                            <span key={`dots-${i}`} className="pagi-dots">...</span>
                          ) : (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`pagi-btn ${pagination.current_page === pageNumber ? 'active' : ''}`}
                            >
                              {pageNumber}
                            </button>
                          )
                        ))}

                        <button
                          onClick={() => handlePageChange(Math.min(pagination.current_page + 1, pagination.total_pages))}
                          disabled={pagination.current_page === pagination.total_pages}
                          className="pagi-btn"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>

                      {pagination.total_pages > 5 && (
                        <div className="pagination-jump">
                          <span className="jump-text">Go to:</span>
                          <input
                            type="number"
                            min="1"
                            max={pagination.total_pages}
                            value={jumpPage}
                            onChange={(e) => setJumpPage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const page = parseInt(jumpPage);
                                if (page >= 1 && page <= pagination.total_pages) {
                                  handlePageChange(page);
                                  setJumpPage('');
                                }
                              }
                            }}
                            placeholder="Page"
                            className="jump-input"
                          />
                          <button
                            onClick={() => {
                              const page = parseInt(jumpPage);
                              if (page >= 1 && page <= pagination.total_pages) {
                                handlePageChange(page);
                                setJumpPage('');
                              }
                            }}
                            className="jump-btn"
                          >
                            Go
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryStatistics;
