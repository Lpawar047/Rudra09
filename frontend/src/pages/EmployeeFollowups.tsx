import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Followup } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { PhoneCall } from 'lucide-react';

export const EmployeeFollowups: React.FC = () => {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/followups');
      setFollowups(res.data.followups);
    } catch (err) {
      console.error('Failed to fetch followups', err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<Followup>[] = [
    {
      header: 'Followup ID',
      accessor: (row) => <span className="font-black text-[#111111] font-mono">#FLD-{row.id}</span>,
    },
    {
      header: 'Loan Account',
      accessor: (row) => <span className="font-mono font-bold text-xs text-[#111111]">{row.loan_account_number}</span>,
    },
    {
      header: 'Borrower Name',
      accessor: (row) => <span className="font-bold text-[#111111]">{row.customer_name}</span>,
    },
    {
      header: 'Interaction Type',
      accessor: (row) => <span className="font-bold text-[#111111]">{row.followup_type}</span>,
    },
    {
      header: 'Outcome Result',
      accessor: (row) => <StatusBadge status={row.contact_result} />,
    },
    {
      header: 'Response / Remarks',
      accessor: (row) => <span className="text-xs text-[#666666] italic">{row.remarks || row.customer_response || 'Logged'}</span>,
    },
    {
      header: 'Logged Date',
      accessor: (row) => <span className="text-[#111111]">{new Date(row.followup_date).toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#111111] tracking-tight">My Logged Follow-ups</h1>
        <p className="text-xs text-[#666666] font-medium mt-1">Audit log of your phone calls, field visits, and customer promises.</p>
      </div>

      <DataTable
        columns={columns}
        data={followups}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No follow-up interactions logged yet."
      />
    </div>
  );
};
