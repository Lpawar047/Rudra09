import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User, UserStatus } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { 
  UserPlus, Edit, Trash2, Ban, CheckCircle, XCircle, 
  Info, AlertCircle, RefreshCw
} from 'lucide-react';

export const AdminEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Field Recovery');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rejection modal state
  const [rejectingUser, setRejectingUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Rejection info modal state
  const [viewingRejection, setViewingRejection] = useState<User | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users?role=EMPLOYEE');
      setEmployees(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch employees', err);
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
    setDepartment('Field Recovery');
    setStatus('ACTIVE');
    setShowModal(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setPhone(u.phone || '');
    setDepartment(u.department || 'Field Recovery');
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
          role: 'EMPLOYEE',
          phone,
          department,
          status,
        });
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save employee record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: UserStatus, reason?: string) => {
    try {
      await api.put(`/users/${userId}/status`, {
        status: newStatus,
        rejection_reason: reason,
      });
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to change status to ${newStatus}.`);
    }
  };

  const handleApprove = (u: User) => {
    if (confirm(`Approve registration for ${u.name}? Account status will be changed from PENDING to ACTIVE.`)) {
      handleStatusChange(u.id, 'ACTIVE');
    }
  };

  const handleOpenRejectModal = (u: User) => {
    setRejectingUser(u);
    setRejectionReason('');
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingUser) return;
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    setIsRejecting(true);
    try {
      await handleStatusChange(rejectingUser.id, 'REJECTED', rejectionReason.trim());
      setRejectingUser(null);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDisable = (u: User) => {
    if (confirm(`Disable account for ${u.name}? They will be blocked from logging into the application.`)) {
      handleStatusChange(u.id, 'DISABLED');
    }
  };

  const handleReactivate = (u: User) => {
    if (confirm(`Reactivate account for ${u.name}? Account status will be restored from DISABLED to ACTIVE.`)) {
      handleStatusChange(u.id, 'ACTIVE');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this employee account?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchEmployees();
    } catch (err) {
      alert('Failed to delete employee.');
    }
  };

  const filteredEmployees = statusFilter === 'ALL'
    ? employees
    : employees.filter(e => e.status === statusFilter);

  const columns: Column<User>[] = [
    {
      header: 'Employee ID',
      accessor: (row) => <span className="font-bold text-[#111111]">#EMP-{row.id}</span>,
    },
    {
      header: 'Name',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#111111] text-[#FACC15] font-black flex items-center justify-center text-xs shadow-xs border border-[#333333] shrink-0">
            {row.name.charAt(0)}
          </div>
          <div>
            <span className="font-black text-[#111111] block leading-tight">{row.name}</span>
            <span className="text-[11px] font-medium text-[#666666]">{row.email}</span>
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
      header: 'Department',
      accessor: (row) => <span className="font-semibold text-[#111111]">{row.department || 'Field Ops'}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={row.status} />
          {row.status === 'REJECTED' && row.rejection_reason && (
            <button
              onClick={() => setViewingRejection(row)}
              title="View Rejection Reason"
              className="p-1.5 text-[#000000] hover:text-[#000000] bg-[#FEF9C3] rounded-lg border border-[#EAB308]/40 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
    {
      header: 'Status Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          {/* PENDING -> Approve or Reject */}
          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(row)}
                className="min-h-[38px] sm:min-h-[32px] inline-flex items-center gap-1 px-3 py-1.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs rounded-lg transition-colors border border-[#EAB308] shadow-2xs"
                title="Approve Employee Registration"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                onClick={() => handleOpenRejectModal(row)}
                className="min-h-[38px] sm:min-h-[32px] inline-flex items-center gap-1 px-3 py-1.5 bg-[#1F1F1F] hover:bg-[#333333] text-[#D6D6D6] hover:text-white font-bold text-xs rounded-lg transition-colors border border-[#333333] shadow-2xs"
                title="Reject Registration"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}

          {/* ACTIVE -> Disable */}
          {row.status === 'ACTIVE' && (
            <button
              onClick={() => handleDisable(row)}
              className="min-h-[38px] sm:min-h-[32px] inline-flex items-center gap-1 px-3 py-1.5 bg-[#F2F2F2] hover:bg-[#D6D6D6] text-[#111111] font-bold text-xs rounded-lg border border-[#D6D6D6] transition-colors"
              title="Disable Employee Account"
            >
              <Ban className="w-3.5 h-3.5 text-[#666666]" /> Disable
            </button>
          )}

          {/* DISABLED -> Reactivate */}
          {row.status === 'DISABLED' && (
            <button
              onClick={() => handleReactivate(row)}
              className="min-h-[38px] sm:min-h-[32px] inline-flex items-center gap-1 px-3 py-1.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs rounded-lg transition-colors border border-[#EAB308] shadow-2xs"
              title="Reactivate Employee Account"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reactivate
            </button>
          )}

          {/* REJECTED -> Re-evaluate/Activate */}
          {row.status === 'REJECTED' && (
            <button
              onClick={() => handleApprove(row)}
              className="min-h-[38px] sm:min-h-[32px] inline-flex items-center gap-1 px-3 py-1.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs rounded-lg transition-colors border border-[#EAB308] shadow-2xs"
              title="Re-evaluate & Activate"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Approve
            </button>
          )}
        </div>
      ),
    },
    {
      header: 'Manage',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="min-h-[38px] min-w-[38px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center rounded-lg bg-[#F2F2F2] hover:bg-[#D6D6D6] text-[#111111] transition-colors border border-[#D6D6D6]"
            title="Edit User Info"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="min-h-[38px] min-w-[38px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center rounded-lg bg-[#1F1F1F] hover:bg-[#333333] text-[#D6D6D6] hover:text-white transition-colors border border-[#333333]"
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">Field Employees</h1>
          <p className="text-xs text-[#666666] font-medium mt-1">Manage field recovery officers, status permissions, approvals, and account access.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs rounded-xl shadow-xs transition-colors border border-[#EAB308]"
        >
          <UserPlus className="w-4 h-4" /> Add Field Officer
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-[#D6D6D6] text-xs font-bold w-fit shadow-2xs">
        {['ALL', 'ACTIVE', 'PENDING', 'DISABLED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg font-black transition-all ${
              statusFilter === st
                ? 'bg-[#111111] text-[#FFFFFF] shadow-2xs'
                : 'text-[#666666] hover:text-[#000000] hover:bg-[#F2F2F2]'
            }`}
          >
            {st} {st !== 'ALL' && `(${employees.filter(e => e.status === st).length})`}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredEmployees}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No employee accounts found for the selected status."
        renderMobileCard={(item) => (
          <div className="bg-white rounded-xl border border-[#D6D6D6] p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#111111] text-[#FACC15] font-black flex items-center justify-center text-xs shadow-xs border border-[#333333] shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-[#111111] text-sm leading-snug">{item.name}</h4>
                  <p className="text-xs text-[#666666] font-medium">{item.email}</p>
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#666666] font-black block text-[10px] uppercase">Employee ID</span>
                <span className="font-bold text-[#111111]">#EMP-{item.id}</span>
              </div>
              <div>
                <span className="text-[#666666] font-black block text-[10px] uppercase">Phone</span>
                <span className="font-semibold text-[#111111]">{item.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D6D6D6] text-xs">
              <span className="text-[#666666] font-medium">Dept: <strong className="text-[#111111]">{item.department || 'Field Ops'}</strong></span>
              
              <div className="flex items-center gap-1.5">
                {item.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(item)}
                      className="min-h-[40px] px-3 py-1.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black rounded-lg border border-[#EAB308]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(item)}
                      className="min-h-[40px] px-3 py-1.5 bg-[#1F1F1F] hover:bg-[#333333] text-[#D6D6D6] hover:text-white font-bold rounded-lg border border-[#333333]"
                    >
                      Reject
                    </button>
                  </>
                )}
                {item.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleDisable(item)}
                    className="min-h-[40px] px-3 py-1.5 bg-[#F2F2F2] hover:bg-[#D6D6D6] text-[#111111] border border-[#D6D6D6] font-bold rounded-lg"
                  >
                    Disable
                  </button>
                )}
                {item.status === 'DISABLED' && (
                  <button
                    onClick={() => handleReactivate(item)}
                    className="min-h-[40px] px-3 py-1.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black rounded-lg border border-[#EAB308]"
                  >
                    Reactivate
                  </button>
                )}
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="min-h-[40px] p-2 bg-[#F2F2F2] hover:bg-[#D6D6D6] text-[#111111] rounded-lg border border-[#D6D6D6]"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="min-h-[40px] p-2 bg-[#1F1F1F] hover:bg-[#333333] text-[#D6D6D6] hover:text-white rounded-lg border border-[#333333]"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      />


      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit Field Employee' : 'Add New Field Employee'}
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
              placeholder="e.g. Rahul Sharma"
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
              placeholder="rahul@rudraservices.com"
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
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-black text-[#111111] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="DISABLED">DISABLED</option>
                <option value="REJECTED">REJECTED</option>
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
              className="min-h-[44px] px-5 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black rounded-xl transition-colors border border-[#EAB308] shadow-xs"
            >
              {isSubmitting ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={!!rejectingUser}
        onClose={() => setRejectingUser(null)}
        title={`Reject Account Registration — ${rejectingUser?.name}`}
      >
        <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
          <div className="p-3.5 bg-[#FEF9C3] border border-[#EAB308]/40 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#EAB308] shrink-0 mt-0.5" />
            <div className="text-[#111111]">
              <p className="font-black">Important Notice</p>
              <p className="text-xs mt-0.5 text-[#333333] font-medium">
                Rejecting this account will set its status to <strong className="font-black text-[#111111]">REJECTED</strong>. 
                If this user attempts to log in, they will receive: <em>"Your account registration was rejected by Admin."</em>
              </p>
            </div>
          </div>

          <div>
            <label className="block font-black text-[#111111] mb-1.5">
              Rejection Reason <span className="text-[#EAB308]">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 bg-white border border-[#D6D6D6] rounded-xl font-medium text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
              placeholder="e.g. Invalid employment documentation provided during registration."
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setRejectingUser(null)}
              className="min-h-[44px] px-4 py-2.5 bg-[#F2F2F2] hover:bg-[#D6D6D6] text-[#111111] font-bold rounded-xl border border-[#D6D6D6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRejecting}
              className="min-h-[44px] px-5 py-2.5 bg-[#1F1F1F] hover:bg-[#333333] text-white font-bold rounded-xl shadow-xs transition-colors border border-[#333333]"
            >
              {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Viewing Rejection Reason Modal */}
      <Modal
        isOpen={!!viewingRejection}
        onClose={() => setViewingRejection(null)}
        title={`Rejection Details — ${viewingRejection?.name}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-[#FAFAFA] border border-[#D6D6D6] rounded-xl space-y-2.5">
            <div>
              <span className="text-[#666666] block text-[10px] uppercase font-black">Employee Name</span>
              <span className="font-black text-[#111111]">{viewingRejection?.name} ({viewingRejection?.email})</span>
            </div>
            <div>
              <span className="text-[#666666] block text-[10px] uppercase font-black">Rejected By Admin</span>
              <span className="font-bold text-[#111111]">{viewingRejection?.rejected_by_name || 'Admin'}</span>
            </div>
            {viewingRejection?.rejected_at && (
              <div>
                <span className="text-[#666666] block text-[10px] uppercase font-black">Rejection Date & Time</span>
                <span className="font-bold text-[#111111]">{new Date(viewingRejection.rejected_at).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div>
            <span className="text-[#111111] font-black block mb-1.5">Stored Rejection Reason:</span>
            <div className="p-3.5 bg-[#FEF9C3] border border-[#EAB308]/40 rounded-xl text-[#000000] font-medium whitespace-pre-wrap">
              {viewingRejection?.rejection_reason || 'No rejection reason recorded.'}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setViewingRejection(null)}
              className="min-h-[44px] px-5 py-2.5 bg-[#111111] hover:bg-[#000000]:bg-[#FFD600] text-white rounded-xl font-black transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
