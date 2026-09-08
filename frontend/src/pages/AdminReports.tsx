import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { FileSpreadsheet } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [reportType, setReportType] = useState<'recovery' | 'employees'>('recovery');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchReport();
  }, [reportType, statusFilter, locationFilter]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      if (reportType === 'recovery') {
        const res = await api.get('/reports/recovery', {
          params: { status: statusFilter, location: locationFilter },
        });
        setData(res.data.report);
      } else {
        const res = await api.get('/reports/employees');
        setData(res.data.employee_reports);
      }
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/reports/export-excel', {
        params: { status: statusFilter, location: locationFilter },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RUDRA_Recovery_Report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download Excel report.');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const recoveryColumns: Column<any>[] = [
    {
      header: 'Case ID',
      accessor: (row) => <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">#RC-{row.case_id}</span>,
    },
    {
      header: 'Loan Account',
      accessor: (row) => <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">{row.loan_account_number}</span>,
    },
    {
      header: 'Borrower',
      accessor: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.customer_name}</span>,
    },
    {
      header: 'Location',
      accessor: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200">{row.location}</span>,
    },
    {
      header: 'Outstanding POS',
      accessor: (row) => <span className="font-extrabold text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(row.outstanding_amount)}</span>,
    },
    {
      header: 'Total Collected',
      accessor: (row) => <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(row.total_collected)}</span>,
    },
    {
      header: 'Assigned Officer',
      accessor: (row) => <span className="font-bold text-slate-800 dark:text-slate-200">{row.employee_name || 'Unassigned'}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const employeeColumns: Column<any>[] = [
    {
      header: 'Officer Name',
      accessor: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.name}</span>,
    },
    {
      header: 'Email / Phone',
      accessor: (row) => <span className="font-medium text-slate-700 dark:text-slate-300">{row.email} ({row.phone || 'N/A'})</span>,
    },
    {
      header: 'Assigned Cases',
      accessor: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.total_assigned_cases}</span>,
    },
    {
      header: 'Recovered / Closed',
      accessor: (row) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{row.recovered_cases} Cases</span>,
    },
    {
      header: 'Total Collections (₹)',
      accessor: (row) => <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(row.total_recovery_amount)}</span>,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Recovery & Team Performance Reports</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Exportable business intelligence analytics and collection summaries.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setReportType('recovery')}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-bold rounded-xl transition-colors ${
              reportType === 'recovery'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Case Recovery Analytics
          </button>
          <button
            onClick={() => setReportType('employees')}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-bold rounded-xl transition-colors ${
              reportType === 'employees'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Field Officers Leaderboard
          </button>

          <button
            onClick={handleExportExcel}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors ml-auto sm:ml-0"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel Report
          </button>
        </div>
      </div>

      {reportType === 'recovery' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[44px] px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          >
            <option value="">All Recovery Statuses</option>
            <option value="RECOVERED">RECOVERED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="PROMISE_TO_PAY">PROMISE_TO_PAY</option>
            <option value="LEGAL_ACTION">LEGAL_ACTION</option>
          </select>
          <input
            type="text"
            placeholder="Filter by city / location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="min-h-[44px] px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>
      )}

      <DataTable
        columns={reportType === 'recovery' ? recoveryColumns : employeeColumns}
        data={data}
        keyExtractor={(item) => item.case_id || item.id}
        isLoading={isLoading}
        emptyMessage="No report records available."
      />
    </div>
  );
};
