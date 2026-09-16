import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DashboardMetrics } from '../types';
import { DashboardCard } from '../components/DashboardCard';
import { TrendingUp, CheckCircle2, FolderOpen, IndianRupee } from 'lucide-react';

export const EmployeePerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      setMetrics(res.data.metrics);
    } catch (err) {
      console.error('Failed to fetch performance', err);
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
        <p className="mt-3 text-sm text-[#666666] font-medium">Loading Performance Summary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">Personal Recovery Performance</h1>
        <p className="text-xs text-[#666666] font-medium mt-1">Key performance metrics, resolution rate, and collection metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Assigned Cases"
          value={metrics.total_cases}
          subtext="Total cases assigned"
          icon={FolderOpen}
        />
        <DashboardCard
          title="Total Recovered"
          value={formatCurrency(metrics.total_collected_amount)}
          subtext="Collected by you"
          icon={CheckCircle2}
        />
        <DashboardCard
          title="Pending Portfolio POS"
          value={formatCurrency(metrics.total_outstanding_amount)}
          subtext="Outstanding balance"
          icon={IndianRupee}
        />
        <DashboardCard
          title="Personal Recovery Rate"
          value={`${metrics.recovery_percentage}%`}
          subtext="Collection success ratio"
          icon={TrendingUp}
        />
      </div>
    </div>
  );
};
