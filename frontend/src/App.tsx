import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './layouts/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AccountPending } from './pages/AccountPending';
import { AccountRejected } from './pages/AccountRejected';
import { AccountDisabled } from './pages/AccountDisabled';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminRecoveryCases } from './pages/AdminRecoveryCases';
import { AdminEmployees } from './pages/AdminEmployees';
import { AdminManagers } from './pages/AdminManagers';
import { AdminAssignments } from './pages/AdminAssignments';
import { AdminCustomers } from './pages/AdminCustomers';
import { AdminVehicles } from './pages/AdminVehicles';
import { AdminExcelUpload } from './pages/AdminExcelUpload';
import { AdminReports } from './pages/AdminReports';

// Manager Pages
import { ManagerDashboard } from './pages/ManagerDashboard';
import { ManagerRecoveryCases } from './pages/ManagerRecoveryCases';

// Employee Pages
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployeeCases } from './pages/EmployeeCases';
import { CaseDetails } from './pages/CaseDetails';
import { EmployeeFollowups } from './pages/EmployeeFollowups';
import { EmployeePayments } from './pages/EmployeePayments';
import { EmployeePerformance } from './pages/EmployeePerformance';

// Shared Pages
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

import { ThemeProvider } from './context/ThemeContext';
import { Home } from './pages/Home';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultPath = user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'MANAGER' ? '/manager/dashboard' : '/employee/dashboard';
    return <Navigate to={defaultPath} replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'MANAGER') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Home & Landing Page */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />

            {/* Public & Account Status Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account-pending" element={<AccountPending />} />
            <Route path="/account-rejected" element={<AccountRejected />} />
            <Route path="/account-disabled" element={<AccountDisabled />} />

            {/* Protected Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/portal" element={<RootRedirect />} />

            {/* Admin Routes */}
            <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/cases" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminRecoveryCases /></ProtectedRoute>} />
            <Route path="admin/employees" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminEmployees /></ProtectedRoute>} />
            <Route path="admin/managers" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminManagers /></ProtectedRoute>} />
            <Route path="admin/assignments" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAssignments /></ProtectedRoute>} />
            <Route path="admin/customers" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCustomers /></ProtectedRoute>} />
            <Route path="admin/vehicles" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminVehicles /></ProtectedRoute>} />
            <Route path="admin/excel-upload" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><AdminExcelUpload /></ProtectedRoute>} />
            <Route path="admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReports /></ProtectedRoute>} />
            <Route path="admin/profile" element={<ProtectedRoute allowedRoles={['ADMIN']}><Profile /></ProtectedRoute>} />
            <Route path="admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><Settings /></ProtectedRoute>} />

            {/* Manager Routes */}
            <Route path="manager/dashboard" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerDashboard /></ProtectedRoute>} />
            <Route path="manager/cases" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerRecoveryCases /></ProtectedRoute>} />
            <Route path="manager/assignments" element={<ProtectedRoute allowedRoles={['MANAGER']}><AdminAssignments /></ProtectedRoute>} />
            <Route path="manager/employees" element={<ProtectedRoute allowedRoles={['MANAGER']}><AdminEmployees /></ProtectedRoute>} />
            <Route path="manager/reports" element={<ProtectedRoute allowedRoles={['MANAGER']}><AdminReports /></ProtectedRoute>} />
            <Route path="manager/profile" element={<ProtectedRoute allowedRoles={['MANAGER']}><Profile /></ProtectedRoute>} />
            <Route path="manager/settings" element={<ProtectedRoute allowedRoles={['MANAGER']}><Settings /></ProtectedRoute>} />

            {/* Employee Routes */}
            <Route path="employee/dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="employee/cases" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeCases /></ProtectedRoute>} />
            <Route path="employee/cases/:id" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><CaseDetails /></ProtectedRoute>} />
            <Route path="employee/followups" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeFollowups /></ProtectedRoute>} />
            <Route path="employee/payments" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeePayments /></ProtectedRoute>} />
            <Route path="employee/performance" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeePerformance /></ProtectedRoute>} />
            <Route path="employee/profile" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><Profile /></ProtectedRoute>} />
            <Route path="employee/settings" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><Settings /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
  );
};

export default App;
