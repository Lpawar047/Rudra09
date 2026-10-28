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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FACC15] border-t-transparent"></div>
        <p className="mt-3 text-sm text-[#666666] font-medium">Loading Manager Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white text-[#111111] p-6 rounded-2xl shadow-xs border border-[#D6D6D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FEF9C3] text-[#000000] text-xs font-black uppercase tracking-wider mb-2 border border-[#EAB308]/40">
            Manager Portal
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Manager Control Dashboard</h1>
          <p className="text-xs text-[#666666] mt-1 font-medium">Supervise recovery performance, assign cases to field staff, and monitor follow-ups.</p>
        </div>
        <Link
          to="/manager/cases"
          className="min-h-[42px] px-5 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs rounded-xl shadow-xs transition-all inline-flex items-center justify-center border border-[#EAB308]"
        >
          Manage Team Cases →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Zonal Cases"
          value={metrics.total_cases}
          subtext="Under management"
          icon={FolderOpen}
          colorBg="bg-[#FEF9C3]"
          colorText="text-[#000000]"
        />
        <DashboardCard
          title="Outstanding POS"
          value={formatCurrency(metrics.total_outstanding_amount)}
          subtext="Team portfolio POS"
          icon={IndianRupee}
          colorBg="bg-[#FEF9C3]"
          colorText="text-[#000000]"
        />
        <DashboardCard
          title="Collected Amount"
          value={formatCurrency(metrics.total_collected_amount)}
          subtext="Total recovery"
          icon={CheckCircle2}
          colorBg="bg-[#FEF9C3]"
          colorText="text-[#000000]"
        />
        <DashboardCard
          title="Recovery Percentage"
          value={`${metrics.recovery_percentage}%`}
          subtext="Team efficiency"
          icon={TrendingUp}
          colorBg="bg-[#FEF9C3]"
          colorText="text-[#000000]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#D6D6D6] p-5 shadow-xs">
        <h3 className="font-black text-[#111111] text-sm uppercase tracking-wider mb-4 pb-3 border-b border-[#D6D6D6] flex items-center justify-between">
          <span>Zonal Priority Cases</span>
          <span className="text-xs font-bold text-[#666666]">{cases.length} Recent</span>
        </h3>
        <div className="overflow-x-auto rounded-xl border border-[#D6D6D6]">
          <table className="w-full text-left text-xs text-[#111111]">
            <thead className="bg-[#111111] text-[#FFFFFF] font-black uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3">Loan Acc</th>
                <th className="p-3">Borrower</th>
                <th className="p-3">Reg No</th>
                <th className="p-3">Outstanding</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6D6D6] font-medium">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-[#FFFBE6] transition-colors">
                  <td className="p-3 font-bold text-[#111111]">{c.loan_account_number}</td>
                  <td className="p-3">{c.customer_name}</td>
                  <td className="p-3">
                    <span className="font-mono text-[11px] bg-[#111111] text-[#FFFFFF] rounded px-2 py-0.5 border border-[#333333] font-bold">
                      {c.registration_number || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 font-black text-[#111111]">{formatCurrency(c.outstanding_amount || 0)}</td>
                  <td className="p-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="p-3"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
