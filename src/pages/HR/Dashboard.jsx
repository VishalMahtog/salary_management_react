import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Edit2,
  Trash2,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { hrService } from '../../services/api';

const HRDashboard = () => {
  const designations = [
    "Software Engineer",
    "Project Manager",
    "HR Executive",
    "Marketing Specialist",
    "Senior Accountant"
  ];

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pagination, setPagination] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPageParams = parseInt(searchParams.get('page')) || 1;

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
    fetchEmployees(currentPageParams);
  }, [currentPageParams]);

  const fetchEmployees = async (page = 1) => {
    try {
      const data = await hrService.getEmployees(page);
      setEmployees(data.employees || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
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
      fetchEmployees(currentPageParams);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.errors?.join(', ') || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hrService.deleteEmployee(id);
      setSuccessMessage('Employee deleted successfully');
      fetchEmployees(currentPageParams);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert('Delete failed');
    }

  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredEmployees;

  useEffect(() => {
    if (searchTerm) {
      setSearchParams({ page: 1 });
    }
  }, [searchTerm, setSearchParams]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">HR</div>
          <span className="brand-name">SalaryPortal</span>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <Users size={20} strokeWidth={2.5} />
            <span>Employee Listing</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="search-bar">
            <Search size={18} strokeWidth={2.5} className="search-icon" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <Link to="/dashboard" className="header-link">
              <LayoutDashboard size={18} strokeWidth={2.5} />
              <span>My Dashboard</span>
            </Link>

            <button className="icon-btn">
              <Bell size={20} strokeWidth={2.5} />
              <div className="badge"></div>
            </button>

            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user.full_name}</span>
                <span className="user-role-pill">HR ADMIN</span>
              </div>
              <div className="user-avatar hr-avatar">
                {user.full_name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
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
                  <p>Loading employee data...</p>
                </div>
              ) : (
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
                    {currentItems.map(emp => (
                      <tr key={emp.id}>
                        <td>
                          <div className="emp-info">
                            <div className="emp-avatar">{emp.full_name.charAt(0)}</div>
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
                          <div className="emp-salary">₹{emp.salary.toLocaleString()}</div>
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
                  </tbody>
                </table>
              )}
            </div>

            {!isLoading && pagination && pagination.total_pages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing <span>{((pagination.current_page - 1) * pagination.per_page) + 1}</span> to <span>{Math.min(pagination.current_page * pagination.per_page, pagination.total_count)}</span> of <span>{pagination.total_count}</span> results
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePageChange(Math.max(pagination.current_page - 1, 1))}
                    disabled={pagination.current_page === 1}
                    className="pagi-btn"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {[...Array(pagination.total_pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`pagi-btn ${pagination.current_page === i + 1 ? 'active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(Math.min(pagination.current_page + 1, pagination.total_pages))}
                    disabled={pagination.current_page === pagination.total_pages}
                    className="pagi-btn"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Employee Modal */}
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

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #0b0f1a;
        }

        .sidebar {
          width: 260px;
          background: #111827;
          border-right: 1px solid #1f2937;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
        }

        .brand-logo {
          width: 32px;
          height: 32px;
          background: var(--primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
        }

        .brand-name {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          color: #9ca3af;
          transition: all 0.2s;
          text-decoration: none;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          font-size: 0.9375rem;
          cursor: pointer;
        }

        .nav-item.active {
          background: var(--primary);
          color: white;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          background: transparent;
          border: none;
          color: #fca5a5;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
        }

        .main-content {
          flex: 1;
          overflow-y: auto;
        }

        .top-header {
          height: 70px;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #1f2937;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid #1f2937;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          width: 320px;
          gap: 0.5rem;
        }

        .search-bar input {
          background: transparent;
          border: none;
          color: white;
          outline: none;
          width: 100%;
          font-size: 0.875rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .header-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .header-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .btn-primary-header {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .btn-primary-header:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-left: 1.25rem;
          border-left: 1px solid #1f2937;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          line-height: 1;
        }

        .user-role-pill {
          font-size: 0.625rem;
          font-weight: 700;
          color: var(--secondary);
          background: rgba(236, 72, 153, 0.1);
          padding: 0.125rem 0.5rem;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .hr-avatar {
          background: linear-gradient(135deg, var(--secondary), var(--accent));
        }

        .dashboard-content {
          padding: 2.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2.5rem;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
        }

        .section-subtitle {
          color: #94a3b8;
          font-size: 0.9375rem;
        }

        .content-card {
          border-radius: 1rem;
          overflow: hidden;
        }

        .portal-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .portal-table th {
          padding: 1rem 1.5rem;
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          background: rgba(255,255,255,0.02);
        }

        .portal-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #1f2937;
        }

        .emp-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .emp-avatar {
          width: 36px;
          height: 36px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
        }

        .emp-name {
          font-weight: 600;
          font-size: 0.9375rem;
        }

        .emp-email {
          font-size: 0.8125rem;
          color: #94a3b8;
        }

        .emp-salary {
          font-weight: 700;
          color: #10b981;
        }

        .active-status {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .inactive-status {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          width: 100%;
          max-width: 650px;
          padding: 2rem;
          max-height: 90vh;
          overflow-y: auto;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem 1.5rem;
        }

        .checkbox-group {
          grid-column: span 2;
          background: rgba(255, 255, 255, 0.02);
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 0 !important;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          color: white;
          font-weight: 500;
          font-size: 0.9375rem;
        }

        .checkbox-label input {
          width: 20px;
          height: 20px;
          accent-color: var(--primary);
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          padding: 1rem 1.5rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          z-index: 2000;
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: 600;
          font-size: 0.9375rem;
          pointer-events: none;
        }

        .toast.success {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.2);
        }

        .pagination {
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.01);
        }

        .pagination-info {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .pagination-info span {
          color: white;
          font-weight: 600;
        }

        .pagination-controls {
          display: flex;
          gap: 0.5rem;
        }

        .pagi-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          transition: all 0.2s;
        }

        .pagi-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .pagi-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .pagi-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .form-error {
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
        }

        .icon-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .icon-btn.edit:hover {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border-color: rgba(99, 102, 241, 0.3);
        }

        .icon-btn.delete:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .action-btns {
          display: flex;
          gap: 0.75rem;
        }

        .badge {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--secondary);
          border-radius: 50%;
          border: 2px solid #111827;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .btn-ghost {
          background: transparent;
          color: #94a3b8;
          border: 1px solid #1f2937;
          padding: 0.75rem 1.5rem;
          border-radius: 0.625rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border-color: #374151;
        }
      `}</style>
    </div>
  );
};

export default HRDashboard;
