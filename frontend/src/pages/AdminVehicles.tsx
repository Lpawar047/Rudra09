import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Vehicle, VehicleStatus } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Plus, Edit, Search, Truck } from 'lucide-react';

export const AdminVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [regNo, setRegNo] = useState('');
  const [vehicleType, setVehicleType] = useState('Heavy Commercial Truck');
  const [manufacturer, setManufacturer] = useState('Tata Motors');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<VehicleStatus>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [search, statusFilter]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/vehicles', { params: { search, status: statusFilter } });
      setVehicles(res.data.vehicles);
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setRegNo('');
    setVehicleType('Heavy Commercial Truck');
    setManufacturer('Tata Motors');
    setModel('');
    setVariant('');
    setChassisNumber('');
    setEngineNumber('');
    setLocation('');
    setStatus('UNDER_RECOVERY');
    setShowModal(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setRegNo(v.registration_number);
    setVehicleType(v.vehicle_type || '');
    setManufacturer(v.manufacturer || '');
    setModel(v.model);
    setVariant(v.variant || '');
    setChassisNumber(v.chassis_number || '');
    setEngineNumber(v.engine_number || '');
    setLocation(v.location || '');
    setStatus(v.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, {
          registration_number: regNo,
          vehicle_type: vehicleType,
          manufacturer,
          model,
          variant,
          chassis_number: chassisNumber,
          engine_number: engineNumber,
          location,
          status,
        });
      } else {
        await api.post('/vehicles', {
          registration_number: regNo,
          vehicle_type: vehicleType,
          manufacturer,
          model,
          variant,
          chassis_number: chassisNumber,
          engine_number: engineNumber,
          location,
          status,
        });
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save vehicle record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Vehicle>[] = [
    {
      header: 'Registration No',
      accessor: (row) => (
        <span className="font-mono font-bold text-xs bg-[#111111] text-[#FFFFFF] px-2.5 py-1 rounded-md border border-[#333333]">
          {row.registration_number}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'Vehicle Model',
      accessor: (row) => (
        <div>
          <p className="font-black text-[#111111]">{row.model} {row.variant ? `(${row.variant})` : ''}</p>
          <p className="text-[11px] text-[#666666] font-medium">{row.manufacturer || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (row) => <span className="font-semibold text-[#111111]">{row.vehicle_type || 'Commercial'}</span>,
    },
    {
      header: 'Chassis / Engine',
      accessor: (row) => (
        <div className="text-[11px]">
          <p className="font-mono text-[#111111] font-bold">CH: {row.chassis_number || 'N/A'}</p>
          <p className="font-mono text-[#666666]">EN: {row.engine_number || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Yard / Location',
      accessor: (row) => <span className="text-[#111111] font-medium">{row.location || 'Yard Location Pending'}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => handleOpenEdit(row)}
          className="p-1.5 rounded-lg bg-[#F2F2F2] hover:bg-[#D6D6D6] text-[#111111] border border-[#D6D6D6] transition-colors"
          title="Edit Vehicle"
        >
          <Edit className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">Vehicle Inventory & Asset Tracking</h1>
          <p className="text-xs text-[#666666] font-medium mt-1">Track repossessed vehicles, chassis numbers, yard locations, and recovery statuses.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] text-[#000000] font-black text-xs rounded-xl shadow-xs transition-colors border border-[#EAB308]"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#D6D6D6] shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#666666]" />
          <input
            type="text"
            placeholder="Search vehicle registration, model, chassis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-[44px] w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-[#D6D6D6] rounded-xl text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="min-h-[44px] px-3.5 py-2.5 text-xs bg-[#FAFAFA] border border-[#D6D6D6] rounded-xl font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308]"
        >
          <option value="">All Vehicle Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="UNDER_RECOVERY">UNDER_RECOVERY</option>
          <option value="RECOVERED">RECOVERED</option>
          <option value="SOLD">SOLD</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No vehicles registered in inventory."
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingVehicle ? 'Edit Vehicle Record' : 'Register Vehicle Asset'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Registration Number</label>
              <input
                type="text"
                required
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-mono uppercase font-black text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
                placeholder="MH12AB1234"
              />
            </div>
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Vehicle Category</label>
              <input
                type="text"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-medium text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
                placeholder="Heavy Truck / Commercial LCV"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Manufacturer</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-medium text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
                placeholder="Tata Motors"
              />
            </div>
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Model Name</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-medium text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
                placeholder="Prima 2830.K"
              />
            </div>
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Variant</label>
              <input
                type="text"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-medium text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
                placeholder="Tipper / BS6"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Chassis Number</label>
              <input
                type="text"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-mono text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
                placeholder="MAT428015P3N10293"
              />
            </div>
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Engine Number</label>
              <input
                type="text"
                value={engineNumber}
                onChange={(e) => setEngineNumber(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-mono text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
                placeholder="CUMMINSISBE6.7"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Yard / Physical Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-medium text-[#111111] placeholder:text-[#666666]:text-[#999999] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
                placeholder="Pune Nigdi Yard"
              />
            </div>
            <div>
              <label className="block font-black text-[#111111] mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                className="min-h-[44px] w-full px-3.5 py-2.5 bg-white border border-[#D6D6D6] rounded-xl font-black text-[#111111] focus:ring-2 focus:ring-[#FACC15] focus:border-[#EAB308] focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="UNDER_RECOVERY">UNDER_RECOVERY</option>
                <option value="RECOVERED">RECOVERED</option>
                <option value="SOLD">SOLD</option>
                <option value="CLOSED">CLOSED</option>
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
              {isSubmitting ? 'Saving...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
