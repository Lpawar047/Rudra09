import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DashboardMetrics, RecoveryCase, Followup } from '../types';
import { DashboardCard } from '../components/DashboardCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { FolderOpen, IndianRupee, PhoneCall, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmployeeDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [myCases, setMyCases] = useState<RecoveryCase[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      setMetrics(res.data.metrics);
      setMyCases(res.data.recent_cases);
      setFollowups(res.data.recent_followups);
    } catch (err) {
      console.error('Failed to fetch employee dashboard', err);
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
        <p className="mt-3 text-sm text-slate-700 font-bold">Loading Field Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Field Officer Mobile Portal</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">View assigned vehicle recovery cases, log field visits, and submit payment collections.</p>
        </div>
        <Link
          to="/employee/cases"
          className="min-h-[42px] inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all text-center uppercase tracking-wider"
        >
          View My Assigned Cases
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Assigned Cases"
          value={metrics.total_cases}
          subtext="My portfolio cases"
          icon={FolderOpen}
          colorBg="bg-indigo-50"
          colorText="text-indigo-600"
        />
        <DashboardCard
          title="Pending Recovery"
          value={formatCurrency(metrics.total_outstanding_amount)}
          subtext="Total assigned POS"
          icon={IndianRupee}
          colorBg="bg-rose-50"
          colorText="text-rose-600"
        />
        <DashboardCard
          title="My Total Collections"
          value={formatCurrency(metrics.total_collected_amount)}
          subtext="Collected by me"
          icon={CheckCircle2}
          colorBg="bg-emerald-50"
          colorText="text-emerald-600"
        />
        <DashboardCard
          title="Follow-ups Conducted"
          value={followups.length}
          subtext="Recent interactions"
          icon={PhoneCall}
          colorBg="bg-amber-50"
          colorText="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider">My High Priority Cases</h3>
            <Link to="/employee/cases" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">View All →</Link>
          </div>
          <div className="space-y-3">
            {myCases.map((c) => (
              <div key={c.id} className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{c.customer_name} ({c.loan_account_number})</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono font-bold">{c.registration_number || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400">{formatCurrency(c.outstanding_amount || 0)}</p>
                  <div className="mt-1 flex items-center justify-end gap-1">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            Recent Follow-up Records
          </h3>
          <div className="space-y-3">
            {followups.map((f) => (
              <div key={f.id} className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">{f.customer_name}</span>
                  <StatusBadge status={f.contact_result} />
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic font-medium">"{f.remarks || f.customer_response || 'Field interaction'}"</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">{new Date(f.followup_date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
