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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FACC15] border-t-transparent"></div>
        <p className="mt-3 text-sm text-[#666666] font-bold">Loading Field Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white text-[#111111] p-6 rounded-2xl shadow-xs border border-[#D1D1D1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FEF9C3] text-[#000000] text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#EAB308]/40">
            Field Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#000000] tracking-tight">Personal Recovery Performance</h1>
          <p className="text-sm text-[#666666] font-normal mt-1">Real-time overview of your assigned vehicle recovery portfolio, field visits, and collections.</p>
        </div>
        <Link
          to="/employee/cases"
          className="min-h-[42px] inline-flex items-center justify-center px-5 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-bold text-[13px] sm:text-[14px] rounded-xl shadow-xs transition-all text-center border border-[#EAB308]"
        >
          View My Assigned Cases →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Assigned Cases"
          value={metrics.total_cases}
          subtext="My portfolio cases"
          icon={FolderOpen}
        />
        <DashboardCard
          title="Pending Recovery"
          value={formatCurrency(metrics.total_outstanding_amount)}
          subtext="Total assigned POS"
          icon={IndianRupee}
        />
        <DashboardCard
          title="My Total Collections"
          value={formatCurrency(metrics.total_collected_amount)}
          subtext="Collected by me"
          icon={CheckCircle2}
        />
        <DashboardCard
          title="Follow-ups Conducted"
          value={followups.length}
          subtext="Recent interactions"
          icon={PhoneCall}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#D1D1D1] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8E8]">
            <h3 className="font-bold font-heading text-[#111111] text-[14px] uppercase tracking-wider">My High Priority Cases</h3>
            <Link to="/employee/cases" className="text-xs font-semibold text-[#000000] hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {myCases.length === 0 ? (
              <p className="text-xs text-[#666666] py-4 text-center">No assigned cases at the moment.</p>
            ) : (
              myCases.map((c) => (
                <div key={c.id} className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8E8] flex items-center justify-between hover:border-[#FACC15] transition-colors">
                  <div>
                    <p className="font-bold text-[#111111] text-xs">{c.customer_name} ({c.loan_account_number})</p>
                    <p className="text-[11px] mt-1">
                      <span className="font-mono bg-[#111111] text-[#FFFFFF] rounded px-1.5 py-0.5 border border-[#000000] font-bold">
                        {c.registration_number || 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#111111]">{formatCurrency(c.outstanding_amount || 0)}</p>
                    <div className="mt-1.5 flex items-center justify-end gap-1">
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#D1D1D1] p-5 shadow-xs">
          <h3 className="font-black text-[#111111] text-sm uppercase tracking-wider mb-4 pb-3 border-b border-[#E8E8E8]">
            Recent Follow-up Records
          </h3>
          <div className="space-y-3">
            {followups.length === 0 ? (
              <p className="text-xs text-[#666666] py-4 text-center">No recent follow-ups recorded.</p>
            ) : (
              followups.map((f) => (
                <div key={f.id} className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8E8] text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#111111]">{f.customer_name}</span>
                    <StatusBadge status={f.contact_result} />
                  </div>
                  <p className="text-[#333333] italic font-medium">"{f.remarks || f.customer_response || 'Field interaction'}"</p>
                  <p className="text-[11px] text-[#666666] font-semibold mt-1">{new Date(f.followup_date).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
