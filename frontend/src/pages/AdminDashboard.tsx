import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DashboardMetrics, RecoveryCase, Followup } from '../types';
import { DashboardCard } from '../components/DashboardCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  FolderOpen,
  UserCheck,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  Activity,
  FileSpreadsheet,
  PlusCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentCases, setRecentCases] = useState<RecoveryCase[]>([]);
  const [empPerformance, setEmpPerformance] = useState<any[]>([]);
  const [recentFollowups, setRecentFollowups] = useState<Followup[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      setMetrics(res.data.metrics);
      setRecentCases(res.data.recent_cases);
      setEmpPerformance(res.data.employee_performance);
      setRecentFollowups(res.data.recent_followups);
      setActivityLogs(res.data.activity_logs || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (isLoading || !metrics) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-700 font-semibold">Loading Admin Dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Admin Command Dashboard</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Real-time overview of vehicle loan collection performance & recovery cases.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/excel-upload"
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Bulk Excel Import
          </Link>
          <Link
            to="/admin/cases"
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" /> View All Cases
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Recovery Cases"
          value={metrics.total_cases}
          subtext="Active portfolio cases"
          icon={FolderOpen}
          colorBg="bg-indigo-50"
          colorText="text-indigo-600"
        />
        <DashboardCard
          title="Total Outstanding POS"
          value={formatCurrency(metrics.total_outstanding_amount)}
          subtext="Outstanding loan balance"
          icon={IndianRupee}
          colorBg="bg-rose-50"
          colorText="text-rose-600"
        />
        <DashboardCard
          title="Total Recovered Amount"
          value={formatCurrency(metrics.total_collected_amount)}
          subtext="Collected funds"
          icon={CheckCircle2}
          colorBg="bg-emerald-50"
          colorText="text-emerald-600"
        />
        <DashboardCard
          title="Recovery Rate"
          value={`${metrics.recovery_percentage}%`}
          subtext="Collection ratio"
          icon={TrendingUp}
          colorBg="bg-amber-50"
          colorText="text-amber-700"
        />
      </div>

      {/* Secondary Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Pending</p>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{metrics.pending_cases}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">In Progress</p>
          <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{metrics.in_progress}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Contacted</p>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{metrics.contacted}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Promise to Pay</p>
          <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{metrics.promise_to_pay}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Recovered</p>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{metrics.recovered}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Legal Action</p>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{metrics.legal_action}</p>
        </div>
      </div>

      {/* Main Grid: Recent Cases & Employee Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Recent Priority Cases
            </h3>
            <Link to="/admin/cases" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs sm:text-sm text-slate-900 dark:text-slate-200">
              <thead className="bg-slate-100/80 dark:bg-slate-850/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3">Loan Acc</th>
                  <th className="p-3">Borrower</th>
                  <th className="p-3">Reg No</th>
                  <th className="p-3">Outstanding</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {recentCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{c.loan_account_number}</td>
                    <td className="p-3 font-semibold">{c.customer_name}</td>
                    <td className="p-3 font-mono text-xs bg-slate-100 dark:bg-slate-800 rounded-md px-2 py-1 font-bold border border-slate-200 dark:border-slate-700">{c.registration_number || 'N/A'}</td>
                    <td className="p-3 font-bold text-rose-600 dark:text-rose-400">{formatCurrency(c.outstanding_amount || 0)}</td>
                    <td className="p-3"><PriorityBadge priority={c.priority} /></td>
                    <td className="p-3"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employee Leaderboard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Field Recovery Leaders
            </h3>
          </div>

          <div className="space-y-3">
            {empPerformance.map((emp, idx) => (
              <div key={emp.id} className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{emp.name}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{emp.assigned_cases} cases assigned</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(emp.recovered_amount)}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{emp.completed_cases} closed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Logs & Recent Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Follow-ups */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            Recent Field Follow-ups
          </h3>
          <div className="space-y-3">
            {recentFollowups.map((f) => (
              <div key={f.id} className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">{f.customer_name} ({f.loan_account_number})</span>
                  <StatusBadge status={f.contact_result} />
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic font-medium">"{f.remarks || f.customer_response || 'Follow-up logged'}"</p>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
                  <span>Logged by: {f.created_by_name}</span>
                  <span>{new Date(f.followup_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Audit Log */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> System Activity Audit Log
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{log.details}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    {log.user_name || 'System'} • {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
