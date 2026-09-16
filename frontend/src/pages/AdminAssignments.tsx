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
      accessor: (row) => <span className="font-bold text-[#111111] font-mono">#ASN-{row.id}</span>,
    },
    {
      header: 'Case / Loan Acc',
      accessor: (row) => (
        <div>
          <p className="font-black text-[#111111]">Case #{row.case_id}</p>
          <p className="text-[11px] text-[#666666] font-mono">{row.loan_account_number}</p>
        </div>
      ),
    },
    {
      header: 'Borrower',
      accessor: (row) => <span className="font-bold text-[#111111]">{row.customer_name}</span>,
    },
    {
      header: 'Assigned Officer',
      accessor: (row) => (
        <span className="font-black text-[#000000] bg-[#FEF9C3] px-2.5 py-1 rounded-md border border-[#EAB308]/40 text-xs">
          {row.employee_name}
        </span>
      ),
    },
    {
      header: 'Previous Officer',
      accessor: (row) => (
        row.previous_employee_name 
          ? <span className="font-medium text-[#111111]">{row.previous_employee_name}</span> 
          : <span className="text-[#666666] italic">None</span>
      ),
    },
    {
      header: 'Assigned By',
      accessor: (row) => <span className="font-medium text-[#111111]">{row.assigned_by_name}</span>,
    },
    {
      header: 'Date & Time',
      accessor: (row) => <span className="text-[#111111]">{new Date(row.assigned_at).toLocaleString()}</span>,
      sortable: true,
    },
    {
      header: 'Remarks',
      accessor: (row) => <span className="text-xs text-[#666666] italic">{row.remarks || 'Standard assignment'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#111111] tracking-tight">Case Assignment Audit History</h1>
        <p className="text-xs text-[#666666] font-medium mt-1">Complete historical record of case transfers, reassignments, and management audit trail.</p>
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
