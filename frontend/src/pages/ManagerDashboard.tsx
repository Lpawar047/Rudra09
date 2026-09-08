import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DashboardMetrics, RecoveryCase } from '../types';
import { DashboardCard } from '../components/DashboardCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { FolderOpen, IndianRupee, CheckCircle2, TrendingUp, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManagerDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      setMetrics(res.data.metrics);
      setCases(res.data.recent_cases);
    } catch (err) {
      console.error('Failed to fetch manager dashboard', err);
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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading Manager Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Manager Control Dashboard</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Supervise recovery performance, assign cases to field staff, and monitor follow-ups.</p>
        </div>
        <Link
          to="/manager/cases"
          className="min-h-[42px] px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all inline-flex items-center justify-center"
        >
          Manage Team Cases
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Zonal Cases"
          value={metrics.total_cases}
          subtext="Under management"
          icon={FolderOpen}
          colorBg="bg-blue-50"
          colorText="text-blue-600"
        />
        <DashboardCard
          title="Outstanding POS"
          value={formatCurrency(metrics.total_outstanding_amount)}
          subtext="Team portfolio POS"
          icon={IndianRupee}
          colorBg="bg-rose-50"
          colorText="text-rose-600"
        />
        <DashboardCard
          title="Collected Amount"
          value={formatCurrency(metrics.total_collected_amount)}
          subtext="Total recovery"
          icon={CheckCircle2}
          colorBg="bg-emerald-50"
          colorText="text-emerald-600"
        />
        <DashboardCard
          title="Recovery Percentage"
          value={`${metrics.recovery_percentage}%`}
          subtext="Team efficiency"
          icon={TrendingUp}
          colorBg="bg-amber-50"
          colorText="text-amber-600"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          Zonal Priority Cases
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-2.5">Loan Acc</th>
                <th className="p-2.5">Borrower</th>
                <th className="p-2.5">Reg No</th>
                <th className="p-2.5">Outstanding</th>
                <th className="p-2.5">Priority</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">{c.loan_account_number}</td>
                  <td className="p-2.5">{c.customer_name}</td>
                  <td className="p-2.5 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-200">{c.registration_number || 'N/A'}</td>
                  <td className="p-2.5 font-bold text-rose-600 dark:text-rose-400">{formatCurrency(c.outstanding_amount || 0)}</td>
                  <td className="p-2.5"><PriorityBadge priority={c.priority} /></td>
                  <td className="p-2.5"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
