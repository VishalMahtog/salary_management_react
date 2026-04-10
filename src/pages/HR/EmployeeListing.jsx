import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit2,
  Trash2,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { hrService } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

const EmployeeListing = () => {
  const designations = [
    "Software Engineer",
    "Project Manager",
    "HR Executive",
    "Marketing Specialist",
    "Senior Accountant"
  ];

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pagination, setPagination] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPageParams = parseInt(searchParams.get('page')) || 1;
  const searchTerm = searchParams.get('search') || '';
  const [jumpPage, setJumpPage] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    email: '',
    password: '',
    password_confirmation: '',
    salary: 0,
    role: 'employee',
    designation: '',
    country: '',
    active: true
  });

  useEffect(() => {
    fetchEmployees(currentPageParams, debouncedSearchTerm);
  }, [currentPageParams, debouncedSearchTerm]);

  const fetchEmployees = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const data = await hrService.getEmployees({ page, search });
      setEmployees(data.employees || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('Failed to fetch employees');
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

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        ...employee,
        password: '',
        password_confirmation: ''
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        full_name: '',
        job_title: '',
        email: '',
        password: '',
        password_confirmation: '',
        salary: 0,
        role: 'employee',
        designation: '',
        country: '',
        active: true
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingEmployee) {
        const { password, password_confirmation, ...updateData } = formData;
        await hrService.updateEmployee(editingEmployee.id, updateData);
        setSuccessMessage('Employee updated successfully');
      } else {
        await hrService.createEmployee(formData);
        setSuccessMessage('Employee created successfully');
      }
      setIsModalOpen(false);
      fetchEmployees(currentPageParams, debouncedSearchTerm);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.errors?.join(', ') || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await hrService.deleteEmployee(id);
      setSuccessMessage('Employee deleted successfully');
      fetchEmployees(currentPageParams, debouncedSearchTerm);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="employees-page">
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="toast success"
          >
            <CheckCircle2 size={20} />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="section-header">
        <div className="section-info">
          <h2 className="section-title">Employee Management</h2>
          <p className="section-subtitle">Manage and monitor employee records</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary-header">
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Employee</span>
        </button>
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
                    <th>Employee</th>
                    <th>Role & Title</th>
                    <th>Salary</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div className="emp-info">
                          <div className="emp-avatar">{emp.full_name?.charAt(0)}</div>
                          <div>
                            <div className="emp-name">{emp.full_name}</div>
                            <div className="emp-email">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="emp-title">{emp.job_title}</div>
                        <div className="emp-badge">{emp.role}</div>
                      </td>
                      <td>
                        <div className="emp-salary">₹{emp.salary?.toLocaleString()}</div>
                      </td>
                      <td>{emp.country}</td>
                      <td>
                        <span className={`${emp.active ? 'active-status' : 'inactive-status'}`}>
                          {emp.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button onClick={() => handleOpenModal(emp)} className="icon-btn edit">
                            <Edit2 size={16} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => handleDelete(emp.id)} className="icon-btn delete">
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        No employees found matching your search.
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content glass-card"
            >
              <div className="modal-header">
                <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="close-btn">
                  <X size={24} />
                </button>
              </div>

              {formError && (
                <div className="form-error">
                  <AlertCircle size={18} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="employee-form">
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Job Title</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.job_title}
                      onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Designation</label>
                    <select
                      className="input-field"
                      value={formData.designation}
                      onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    >
                      <option value="">Select Designation</option>
                      {designations.map(des => (
                        <option key={des} value={des}>{des}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Salary (₹)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.salary}
                      onChange={e => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Country</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Role</label>
                    <select
                      className="input-field"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR Admin</option>
                    </select>
                  </div>
                  <div className="input-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                      />
                      Active Account
                    </label>
                  </div>

                  {!editingEmployee && (
                    <>
                      <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                          type="password"
                          className="input-field"
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <input
                          type="password"
                          className="input-field"
                          value={formData.password_confirmation}
                          onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingEmployee ? 'Update Employee' : 'Create Employee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeListing;
