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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FACC15] border-t-transparent"></div>
        <p className="mt-3 text-sm text-[#111111] font-bold">Loading Admin Dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white text-[#111111] p-6 rounded-2xl shadow-xs border border-[#D6D6D6]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#111111] tracking-tight">Admin Command Dashboard</h1>
          <p className="text-sm text-[#666666] font-normal mt-1">Real-time overview of vehicle loan collection performance & recovery cases.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/excel-upload"
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] border border-[#EAB308] font-bold text-[13px] sm:text-[14px] rounded-xl shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#000000]" /> Bulk Excel Import
          </Link>
          <Link
            to="/admin/cases"
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F2F2F2] text-[#111111] font-semibold text-[13px] sm:text-[14px] rounded-xl border border-[#D6D6D6] transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#FACC15]" /> View All Cases
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
          colorBg="bg-[#FEF9C3]"
          colorText="text-[#000000]"
        />
        <DashboardCard
          title="Total Outstanding POS"
          value={formatCurrency(metrics.total_outstanding_amount)}
          subtext="Outstanding loan balance"
          icon={IndianRupee}
          colorBg="bg-[#111111]"
          colorText="text-white"
        />
        <DashboardCard
          title="Total Recovered Amount"
          value={formatCurrency(metrics.total_collected_amount)}
          subtext="Collected funds"
          icon={CheckCircle2}
          colorBg="bg-[#FEF9C3]"
          colorText="text-[#000000]"
        />
        <DashboardCard
          title="Recovery Rate"
          value={`${metrics.recovery_percentage}%`}
          subtext="Collection ratio"
          icon={TrendingUp}
          colorBg="bg-[#FEF9C3]"
          colorText="text-[#000000]"
        />
      </div>

      {/* Secondary Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#D6D6D6] text-center shadow-xs">
          <p className="text-[12px] font-semibold text-[#666666] uppercase tracking-wider">Pending</p>
          <p className="text-xl sm:text-2xl font-bold font-heading tabular-nums text-[#111111] mt-1">{metrics.pending_cases}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D6D6D6] text-center shadow-xs">
          <p className="text-[12px] font-semibold text-[#666666] uppercase tracking-wider">In Progress</p>
          <p className="text-xl sm:text-2xl font-bold font-heading tabular-nums text-[#111111] mt-1">{metrics.in_progress}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D6D6D6] text-center shadow-xs">
          <p className="text-[12px] font-semibold text-[#666666] uppercase tracking-wider">Contacted</p>
          <p className="text-xl sm:text-2xl font-bold font-heading tabular-nums text-[#111111] mt-1">{metrics.contacted}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D6D6D6] text-center shadow-xs">
          <p className="text-[12px] font-semibold text-[#666666] uppercase tracking-wider">Promise to Pay</p>
          <p className="text-xl sm:text-2xl font-bold font-heading tabular-nums text-[#111111] mt-1">{metrics.promise_to_pay}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D6D6D6] text-center shadow-xs">
          <p className="text-[12px] font-semibold text-[#666666] uppercase tracking-wider">Recovered</p>
          <p className="text-xl sm:text-2xl font-bold font-heading tabular-nums text-[#111111] mt-1">{metrics.recovered}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#D6D6D6] text-center shadow-xs">
          <p className="text-[12px] font-semibold text-[#666666] uppercase tracking-wider">Legal Action</p>
          <p className="text-xl sm:text-2xl font-bold font-heading tabular-nums text-[#111111] mt-1">{metrics.legal_action}</p>
        </div>
      </div>

      {/* Main Grid: Recent Cases & Employee Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D6D6D6] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D6D6D6]">
            <h3 className="font-bold font-heading text-[#111111] text-[14px] uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#FACC15]" /> Recent Priority Cases
            </h3>
            <Link to="/admin/cases" className="text-xs font-semibold text-[#111111] hover:underline">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs sm:text-sm text-[#111111]">
              <thead className="bg-[#111111] text-white font-black uppercase text-[11px] tracking-wider">
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
                {recentCases.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FFFBE6] transition-colors">
                    <td className="p-3 font-bold text-[#111111]">{c.loan_account_number}</td>
                    <td className="p-3 font-semibold">{c.customer_name}</td>
                    <td className="p-3">
                      <span className="font-mono text-xs bg-[#111111] text-white rounded px-2 py-1 font-bold border border-[#333333] inline-block">
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

        {/* Employee Leaderboard */}
        <div className="bg-white rounded-2xl border border-[#D6D6D6] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D6D6D6]">
            <h3 className="font-black text-[#111111] text-sm uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#FACC15]" /> Field Recovery Leaders
            </h3>
          </div>

          <div className="space-y-3">
            {empPerformance.map((emp, idx) => (
              <div key={emp.id} className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#D6D6D6] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#111111] text-white font-black text-xs flex items-center justify-center shadow-xs border border-[#333333]">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#111111]">{emp.name}</p>
                    <p className="text-[11px] text-[#666666] font-medium">{emp.assigned_cases} cases assigned</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-[#111111]">{formatCurrency(emp.recovered_amount)}</p>
                  <p className="text-[10px] text-[#666666] font-semibold">{emp.completed_cases} closed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Logs & Recent Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Follow-ups */}
        <div className="bg-white rounded-2xl border border-[#D6D6D6] p-5 shadow-xs">
          <h3 className="font-black text-[#111111] text-sm uppercase tracking-wider mb-4 pb-3 border-b border-[#D6D6D6]">
            Recent Field Follow-ups
          </h3>
          <div className="space-y-3">
            {recentFollowups.map((f) => (
              <div key={f.id} className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#D6D6D6]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#111111]">{f.customer_name} ({f.loan_account_number})</span>
                  <StatusBadge status={f.contact_result} />
                </div>
                <p className="text-xs text-[#111111] italic font-medium">"{f.remarks || f.customer_response || 'Follow-up logged'}"</p>
                <div className="mt-2 text-[11px] text-[#666666] font-semibold flex items-center justify-between">
                  <span>Logged by: {f.created_by_name}</span>
                  <span>{new Date(f.followup_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Audit Log */}
        <div className="bg-white rounded-2xl border border-[#D6D6D6] p-5 shadow-xs">
          <h3 className="font-black text-[#111111] text-sm uppercase tracking-wider mb-4 pb-3 border-b border-[#D6D6D6] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FACC15]" /> System Activity Audit Log
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3 bg-[#FAFAFA] rounded-xl border border-[#D6D6D6] text-xs flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#FACC15] mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#111111]">{log.details}</p>
                  <p className="text-[11px] text-[#666666] mt-0.5 font-medium">
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
