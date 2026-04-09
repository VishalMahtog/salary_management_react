import React from 'react';
import { motion } from 'framer-motion';
import {
  LogOut,
  User,
  Briefcase,
  MapPin,
  IndianRupee,
  Bell,
  Search,
  LayoutDashboard,
  Calendar,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">S</div>
          <span className="brand-name">SalaryPortal</span>
        </div>

        <nav className="sidebar-nav">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<User size={20} />} label="Profile" />
          <NavItem icon={<Briefcase size={20} />} label="My Payroll" />
          <NavItem icon={<Calendar size={20} />} label="Attendance" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
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
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search for reports, payments..." />
          </div>

          <div className="header-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge"></span>
            </button>
            <div className="user-profile">
              <div className="user-info">
                <p className="user-name">{user.full_name}</p>
                <p className="user-role">{user.role.toUpperCase()}</p>
              </div>
              <div className="user-avatar">
                {user.full_name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="welcome-section">
            <h2 className="welcome-title">Welcome back, {user.full_name.split(' ')[0]}! 👋</h2>
            <p className="welcome-subtitle">Here's what's happening with your profile today.</p>
          </div>

          <div className="stats-grid">
            <StatCard
              icon={<IndianRupee className="text-primary" />}
              label="Monthly Salary"
              value={`₹${user.salary.toLocaleString()}`}
              trend="+4.5%"
              color="indigo"
            />
            <StatCard
              icon={<Briefcase className="text-secondary" />}
              label="Designation"
              value={user.designation}
              color="pink"
            />
            <StatCard
              icon={<ShieldCheck className="text-success" />}
              label="Status"
              value={user.active ? 'Active' : 'Inactive'}
              color="emerald"
            />
          </div>

          <div className="details-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="details-card glass-card"
            >
              <h3 className="card-title">Employee Overview</h3>
              <div className="details-grid">
                <DetailRow label="Full Name" value={user.full_name} />
                <DetailRow label="Email Address" value={user.email} />
                <DetailRow label="Job Title" value={user.job_title} />
                <DetailRow label="Country" value={user.country} />
                <DetailRow label="Employee ID" value={`#${user.id.toString().padStart(4, '0')}`} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="recent-activity glass-card"
            >
              <h3 className="card-title">Recent Activity</h3>
              <div className="activity-list">
                <ActivityItem title="Salary Paid" date="Oct 01, 2023" desc="Monthly salary credited to account" />
                <ActivityItem title="Bonus Awarded" date="Sep 15, 2023" desc="Performance bonus for Q3" />
                <ActivityItem title="Profile Updated" date="Aug 30, 2023" desc="Emergency contact info updated" />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #0b0f1a;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 260px;
          background: #111827;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          position: sticky;
          top: 0;
          height: 100vh;
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
          color: var(--text-muted);
          transition: all 0.2s;
          text-decoration: none;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          font-size: 0.9375rem;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text);
        }

        .nav-item.active {
          background: var(--primary);
          color: white;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
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
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
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
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          width: 320px;
          gap: 0.5rem;
        }

        .search-bar input {
          background: transparent;
          border: none;
          color: var(--text);
          outline: none;
          width: 100%;
          font-size: 0.875rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          position: relative;
        }

        .badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: var(--secondary);
          border-radius: 50%;
          border: 2px solid #111827;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-left: 1.5rem;
          border-left: 1px solid var(--border);
        }

        .user-info {
          text-align: right;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
        }

        /* Dashboard Content */
        .dashboard-content {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .welcome-section {
          margin-bottom: 2rem;
        }

        .welcome-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .welcome-subtitle {
          color: var(--text-muted);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          border-radius: 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .stat-trend {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--success);
        }

        .details-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        .card-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .details-card, .recent-activity {
          padding: 1.5rem;
        }

        .details-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .detail-value {
          font-weight: 500;
          color: var(--text);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .activity-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding-left: 1rem;
          border-left: 2px solid var(--primary);
        }

        .activity-title {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .activity-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .activity-desc {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        @media (max-width: 1024px) {
          .details-container {
            grid-template-columns: 1fr;
          }
          .sidebar {
            width: 80px;
            padding: 1rem;
          }
          .brand-name, .nav-item span, .logout-btn span {
            display: none;
          }
          .nav-item {
            justify-content: center;
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }) => (
  <button className={`nav-item ${active ? 'active' : ''}`}>
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ icon, label, value, trend, color }) => (
  <div className="stat-card">
    <div className="stat-header">
      <div className={`stat-icon bg-${color}-soft`}>
        {icon}
      </div>
      {trend && <span className="stat-trend">{trend}</span>}
    </div>
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="detail-row">
    <span className="detail-label">{label}</span>
    <span className="detail-value">{value}</span>
  </div>
);

const ActivityItem = ({ title, date, desc }) => (
  <div className="activity-item">
    <span className="activity-title">{title}</span>
    <span className="activity-date">{date}</span>
    <p className="activity-desc">{desc}</p>
  </div>
);

export default Dashboard;
