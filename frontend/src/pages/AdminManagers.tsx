import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User, UserStatus } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { UserPlus, Edit, Trash2 } from 'lucide-react';

export const AdminManagers: React.FC = () => {
  const [managers, setManagers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Zone Recovery');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users?role=MANAGER');
      setManagers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch managers', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setDepartment('Zone Recovery');
    setStatus('ACTIVE');
    setShowModal(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setPhone(u.phone || '');
    setDepartment(u.department || 'Zone Recovery');
    setStatus(u.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          name,
          email,
          password: password || undefined,
          phone,
          department,
          status,
        });
      } else {
        await api.post('/users', {
          name,
          email,
          password,
          role: 'MANAGER',
          phone,
          department,
          status,
        });
      }
      setShowModal(false);
      fetchManagers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save manager record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Manager ID',
      accessor: (row) => <span className="font-bold text-[#111111]">#MGR-{row.id}</span>,
    },
    {
      header: 'Name',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#111111] text-[#FACC15] font-black flex items-center justify-center text-xs shadow-xs border border-[#333333]">
            {row.name.charAt(0)}
          </div>
          <div>
            <span className="font-black text-[#111111] block">{row.name}</span>
            <span className="text-[11px] text-[#666666]">{row.email}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Phone',
      accessor: (row) => <span className="font-semibold text-[#111111]">{row.phone || 'N/A'}</span>,
    },
    {
      header: 'Zone / Dept',
      accessor: (row) => <span className="font-semibold text-[#111111]">{row.department || 'Recovery Division'}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg bg-[#F2F2F2] hover:bg-[#D6D6D6] text-[#111111] border border-[#D6D6D6] transition-colors"
            title="Edit Manager"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">Zone Managers</h1>
          <p className="text-xs text-[#666666] font-medium mt-1">Supervise recovery managers and zonal supervisors.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs rounded-xl shadow-xs transition-colors border border-[#EAB308]"
        >
          <UserPlus className="w-4 h-4" /> Add Recovery Manager
        </button>
      </div>

      <DataTable
        columns={columns}
        data={managers}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No manager accounts registered."
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit Recovery Manager' : 'Add New Recovery Manager'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-black text-[#111111] mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-medium text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
              placeholder="e.g. Rajesh Sharma"
            />
          </div>
          <div>
            <label className="block font-black text-[#111111] mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-medium text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
              placeholder="manager@rudraservices.com"
            />
          </div>
          <div>
            <label className="block font-black text-[#111111] mb-1.5">
              Password {editingUser && '(Leave blank to keep unchanged)'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-medium text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-medium text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
                placeholder="+91 98200 44556"
              />
            </div>
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-black text-[#111111] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ON_LEAVE">ON_LEAVE</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="min-h-[44px] px-4 py-2.5 bg-[#F2F2F2] hover:bg-[#D6D6D6] text-[#111111] font-bold rounded-xl border border-[#D6D6D6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-5 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black rounded-xl shadow-xs transition-colors border border-[#EAB308]"
            >
              {isSubmitting ? 'Saving...' : 'Save Manager'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
