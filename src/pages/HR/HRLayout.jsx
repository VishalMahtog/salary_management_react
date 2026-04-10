import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  LayoutDashboard,
  LogOut,
  Bell,
  Briefcase,
  BarChart,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation, Outlet, useSearchParams } from 'react-router-dom';
import '../../styles/HR.css';

const HRLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value) {
      searchParams.set('search', value);
      searchParams.set('page', '1');
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const menuItems = [
    { path: '/hr/employees', icon: Users, label: 'Employee Listing' },
    { path: '/hr/salary-stats', icon: BarChart, label: 'Salary Statistics' },
    { path: '/hr/job-title-stats', icon: Briefcase, label: 'Job Title Statistics' },
    { path: '/dashboard', icon: User, label: 'Personal View' },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand" onClick={() => navigate('/hr/employees')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo">HR</div>
          <span className="brand-name">SalaryPortal</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} strokeWidth={2.5} />
              <span>{item.label}</span>
            </Link>
          ))}
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
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="header-actions">
            <Link to="/dashboard" className="header-link">
              <LayoutDashboard size={18} strokeWidth={2.5} />
              <span>Employee View</span>
            </Link>

            <button className="icon-btn">
              <Bell size={20} strokeWidth={2.5} />
              <div className="badge"></div>
            </button>

            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user?.full_name}</span>
                <span className="user-role-pill">HR ADMIN</span>
              </div>
              <div className="user-avatar hr-avatar">
                {user?.full_name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default HRLayout;
