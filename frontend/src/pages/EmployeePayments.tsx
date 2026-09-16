import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Payment } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { CreditCard } from 'lucide-react';

export const EmployeePayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data.payments);
    } catch (err) {
      console.error('Failed to fetch payments', err);
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

  const columns: Column<Payment>[] = [
    {
      header: 'Receipt ID',
      accessor: (row) => <span className="font-black text-[#111111] font-mono">#RCT-{row.id}</span>,
    },
    {
      header: 'Loan Account',
      accessor: (row) => <span className="font-mono font-bold text-xs text-[#111111]">{row.loan_account_number}</span>,
    },
    {
      header: 'Borrower',
      accessor: (row) => <span className="font-bold text-[#111111]">{row.customer_name}</span>,
    },
    {
      header: 'Payment Mode',
      accessor: (row) => (
        <span className="font-bold text-xs bg-[#111111] text-[#FFFFFF] px-2.5 py-1 rounded-md border border-[#333333]">
          {row.payment_mode}
        </span>
      ),
    },
    {
      header: 'Reference / Cheque No',
      accessor: (row) => <span className="font-mono text-xs text-[#111111]">{row.transaction_ref || 'N/A'}</span>,
    },
    {
      header: 'Amount Collected',
      accessor: (row) => <span className="font-black text-[#111111] font-mono text-sm">{formatCurrency(row.amount)}</span>,
      sortable: true,
    },
    {
      header: 'Date & Time',
      accessor: (row) => <span className="text-[#111111]">{new Date(row.payment_date).toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#111111] tracking-tight">My Collection Receipts</h1>
        <p className="text-xs text-[#666666] font-medium mt-1">Record of payment collections, UPI deposits, and cheque receipts collected by you.</p>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No payment collections recorded yet."
      />
    </div>
  );
};
