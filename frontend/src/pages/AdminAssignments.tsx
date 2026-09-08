import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { CaseAssignment } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { UserCheck, Clock, FileText } from 'lucide-react';

export const AdminAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<CaseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data.assignments);
    } catch (err) {
      console.error('Failed to fetch assignments', err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<CaseAssignment>[] = [
    {
      header: 'Assignment ID',
      accessor: (row) => <span className="font-bold text-slate-900 dark:text-white font-mono">#ASN-{row.id}</span>,
    },
    {
      header: 'Case / Loan Acc',
      accessor: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">Case #{row.case_id}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{row.loan_account_number}</p>
        </div>
      ),
    },
    {
      header: 'Borrower',
      accessor: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200">{row.customer_name}</span>,
    },
    {
      header: 'Assigned Officer',
      accessor: (row) => (
        <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 text-xs">
          {row.employee_name}
        </span>
      ),
    },
    {
      header: 'Previous Officer',
      accessor: (row) => (
        row.previous_employee_name 
          ? <span className="font-medium text-slate-700 dark:text-slate-300">{row.previous_employee_name}</span> 
          : <span className="text-slate-400 dark:text-slate-500 italic">None</span>
      ),
    },
    {
      header: 'Assigned By',
      accessor: (row) => <span className="font-medium text-slate-700 dark:text-slate-300">{row.assigned_by_name}</span>,
    },
    {
      header: 'Date & Time',
      accessor: (row) => <span className="text-slate-700 dark:text-slate-300">{new Date(row.assigned_at).toLocaleString()}</span>,
      sortable: true,
    },
    {
      header: 'Remarks',
      accessor: (row) => <span className="text-xs text-slate-600 dark:text-slate-400 italic">{row.remarks || 'Standard assignment'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Case Assignment Audit History</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Complete historical record of case transfers, reassignments, and management audit trail.</p>
      </div>

      <DataTable
        columns={columns}
        data={assignments}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No assignment history logged."
      />
    </div>
  );
};
