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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading Performance Summary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Personal Recovery Performance</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Key performance metrics, resolution rate, and collection metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Assigned Cases"
          value={metrics.total_cases}
          subtext="Total cases assigned"
          icon={FolderOpen}
          colorBg="bg-blue-50 dark:bg-blue-950/60"
          colorText="text-blue-600 dark:text-blue-400"
        />
        <DashboardCard
          title="Total Recovered"
          value={formatCurrency(metrics.total_collected_amount)}
          subtext="Collected by you"
          icon={CheckCircle2}
          colorBg="bg-emerald-50 dark:bg-emerald-950/60"
          colorText="text-emerald-600 dark:text-emerald-400"
        />
        <DashboardCard
          title="Pending Portfolio POS"
          value={formatCurrency(metrics.total_outstanding_amount)}
          subtext="Outstanding balance"
          icon={IndianRupee}
          colorBg="bg-rose-50 dark:bg-rose-950/60"
          colorText="text-rose-600 dark:text-rose-400"
        />
        <DashboardCard
          title="Personal Recovery Rate"
          value={`${metrics.recovery_percentage}%`}
          subtext="Collection success ratio"
          icon={TrendingUp}
          colorBg="bg-indigo-50 dark:bg-indigo-950/60"
          colorText="text-indigo-600 dark:text-indigo-400"
        />
      </div>
    </div>
  );
};
