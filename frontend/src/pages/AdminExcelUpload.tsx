import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Upload, CheckCircle2, XCircle, 
  FileText, RefreshCw, Layers, ShieldCheck, Clock, Hash, Trash2, FolderOpen
} from 'lucide-react';
import api from '../services/api';
import { ExcelUpload } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useNavigate } from 'react-router-dom';

export const AdminExcelUpload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [recentUploads, setRecentUploads] = useState<ExcelUpload[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [importSummary, setImportSummary] = useState<any>(null);
  const [selectedUploadDetail, setSelectedUploadDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Delete modal states
  const [deleteTarget, setDeleteTarget] = useState<ExcelUpload | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCasesAlso, setDeleteCasesAlso] = useState(false);

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  const fetchRecentUploads = async () => {
    try {
      const res = await api.get('/excel/uploads');
      setRecentUploads(res.data.uploads || []);
      setSummaryStats(res.data.summary || null);
    } catch (err) {
      console.error('Failed to fetch recent uploads', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setErrorMsg('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      setSelectedFile(file);
      setValidationResult(null);
      setImportSummary(null);
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setErrorMsg('Please upload a valid Excel spreadsheet file (.xlsx or .xls)');
        return;
      }
      setSelectedFile(file);
      setValidationResult(null);
      setImportSummary(null);
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  const handleUploadAndValidate = async () => {
    if (!selectedFile) return;

    // Step 2 Verification Logging
    console.log('[FRONTEND FILE SELECTION]', {
      name: selectedFile?.name,
      size: selectedFile?.size,
      type: selectedFile?.type,
      isFile: selectedFile instanceof File
    });

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setImportSummary(null);

    // Step 3 FormData Creation
    const formData = new FormData();
    formData.append('file', selectedFile);

    // Step 4 FormData Inspection
    for (const [key, value] of formData.entries()) {
      console.log(
        '[FRONTEND FORMDATA ENTRY]',
        key,
        value instanceof File
          ? {
              name: value.name,
              size: value.size,
              type: value.type
            }
          : value
      );
    }

    try {
      const res = await api.post('/excel/upload', formData);
      setValidationResult(res.data);
      setSuccessMsg(`File parsed successfully. Found ${res.data.total_rows} total rows.`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationResult || !validationResult.preview_rows) return;

    setImporting(true);
    setErrorMsg('');

    try {
      const res = await api.post('/excel/import', {
        upload_id: validationResult.upload_id,
        rows: validationResult.preview_rows,
      });

      setImportSummary({
        imported_new: res.data.imported_new_records || 0,
        updated_existing: res.data.updated_existing_records || 0,
        duplicate_rows: validationResult.duplicate_rows || 0,
        total_rows: validationResult.total_rows || 0,
      });

      setSuccessMsg('Excel data imported successfully. Recovery records are now available in the system.');
      setValidationResult(null);
      setSelectedFile(null);
      fetchRecentUploads();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to import data into database.');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteExcel = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (deleteCasesAlso) {
        await api.delete(`/excel/uploads/${deleteTarget.id}/cases`);
      }
      const res = await api.delete(`/excel/uploads/${deleteTarget.id}`);
      setSuccessMsg(res.data.message || 'Excel file deleted successfully.');
      setDeleteTarget(null);
      setDeleteCasesAlso(false);
      fetchRecentUploads();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete Excel file.');
    } finally {
      setIsDeleting(false);
    }
  };

  const viewUploadDetailsModal = async (uploadId: number) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/excel/uploads/${uploadId}`);
      setSelectedUploadDetail(res.data);
    } catch (err) {
      console.error('Failed to fetch upload details', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Bulk Excel Ingestion Engine
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
            Upload recovery data spreadsheets (.xlsx / .xls) with non-destructive UPSERT logic
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/cases')}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <FolderOpen className="w-4 h-4 text-indigo-300" />
          View Cases Page
        </button>
      </div>

      {/* Upload History High-Level Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Excel Uploads</span>
            <Hash className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {summaryStats?.total_uploads || recentUploads.length || 0}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Permanent database audit log count</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Rows Processed</span>
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {(summaryStats?.total_rows_processed || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Accumulated across all uploads</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Successful Records</span>
            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {(summaryStats?.successful_rows || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">Validly synchronized to database</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Last Excel Upload</span>
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
            {summaryStats?.last_upload?.original_name || 'No uploads yet'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {summaryStats?.last_upload?.created_at ? new Date(summaryStats.last_upload.created_at).toLocaleString('en-IN') : 'N/A'}
          </p>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Post-Import Detailed Notification Toast */}
      {importSummary && (
        <div className="p-5 bg-indigo-950 dark:bg-indigo-950/90 border border-indigo-800 rounded-2xl text-white space-y-3 shadow-md">
          <h4 className="font-bold text-base flex items-center gap-2 text-indigo-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Automatic Data Synchronization Complete
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
            <div className="bg-indigo-900/60 p-3 rounded-xl border border-indigo-800">
              <span className="text-indigo-300 block text-[10px] uppercase font-sans font-bold">New Records Inserted</span>
              <span className="text-xl font-extrabold text-white">{importSummary.imported_new}</span>
            </div>
            <div className="bg-indigo-900/60 p-3 rounded-xl border border-indigo-800">
              <span className="text-indigo-300 block text-[10px] uppercase font-sans font-bold">Existing Records Updated</span>
              <span className="text-xl font-extrabold text-white">{importSummary.updated_existing}</span>
            </div>
            <div className="bg-indigo-900/60 p-3 rounded-xl border border-indigo-800">
              <span className="text-indigo-300 block text-[10px] uppercase font-sans font-bold">Total Rows Processed</span>
              <span className="text-xl font-extrabold text-white">{importSummary.total_rows}</span>
            </div>
            <div className="bg-indigo-900/60 p-3 rounded-xl border border-indigo-800 flex items-center justify-center">
              <button
                onClick={() => navigate('/admin/cases')}
                className="min-h-[44px] w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs uppercase tracking-wider"
              >
                <FolderOpen className="w-4 h-4" />
                View Cases →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Upload Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500 rounded-2xl p-8 text-center transition-all bg-slate-50/50 dark:bg-slate-850/50 cursor-pointer"
        >
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
            id="excel-file-input"
          />
          <label htmlFor="excel-file-input" className="cursor-pointer space-y-3 block">
            <Upload className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <div>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                {selectedFile ? selectedFile.name : 'Click to upload or drag & drop Excel file'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                Supports .xlsx and .xls formats (Maximum file size: 10MB)
              </p>
            </div>
          </label>
        </div>

        {selectedFile && !validationResult && (
          <div className="flex justify-end">
            <button
              onClick={handleUploadAndValidate}
              disabled={uploading}
              className="min-h-[44px] px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 uppercase tracking-wider"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Parsing & Validating Excel...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Validate & Parse File
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Validation & Preview Section */}
      {validationResult && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Sheet Validation Summary: {validationResult.filename}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                Parsed file data verified against system schema & database UPSERT rules
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700">
                Total Rows: {validationResult.total_rows}
              </span>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800">
                Valid: {validationResult.successful_rows}
              </span>
              <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-800">
                Updates: {validationResult.duplicate_rows}
              </span>
              <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800">
                Failed: {validationResult.failed_rows}
              </span>
            </div>
          </div>

          {/* Validated Data Preview Table */}
          {validationResult.preview_rows && validationResult.preview_rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Confirmed Valid Records Ready for Database UPSERT ({validationResult.preview_rows.length} Rows)
                </h4>

                <button
                  onClick={handleConfirmImport}
                  disabled={importing}
                  className="min-h-[44px] px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  {importing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Importing to Database...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm & Import Valid Records
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto w-full rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left text-slate-900 dark:text-slate-200">
                  <thead className="bg-slate-100/90 dark:bg-slate-850/90 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Proposal / Loan Acc</th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Reg No / Asset</th>
                      <th className="p-3">POS Balance</th>
                      <th className="p-3">Total Due</th>
                      <th className="p-3">BOM / DPD</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {validationResult.preview_rows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-700 dark:text-indigo-400">
                          {row.loan_account_number}
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{row.customer_name}</td>
                        <td className="p-3 font-mono">{row.phone}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 dark:text-white block">{row.vehicle_number}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{row.vehicle_model}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                          ₹{row.outstanding_amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 font-mono font-extrabold text-rose-600 dark:text-rose-400">
                          ₹{row.total_overdue.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 font-mono font-bold">{row.dpd} DPD</td>
                        <td className="p-3">
                          <StatusBadge status={row.recovery_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Excel Upload History Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Excel Upload Management & History Audit ({recentUploads.length} Files)
          </h3>
          <button
            onClick={fetchRecentUploads}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            title="Refresh Upload History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {recentUploads.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium text-center py-6">No previous Excel upload audit records found.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left text-slate-900 dark:text-slate-200">
              <thead className="bg-slate-100/90 dark:bg-slate-850/90 text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Upload #</th>
                  <th className="p-3">Upload Date & Time</th>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Uploaded By</th>
                  <th className="p-3 text-center">Total Rows</th>
                  <th className="p-3 text-center">Imported Rows</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {recentUploads.map((up, idx) => {
                  const uploadNum = recentUploads.length - idx;
                  return (
                    <tr key={up.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-700 dark:text-indigo-400">
                        #{uploadNum} (ID: {up.id})
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                        {up.created_at ? new Date(up.created_at).toLocaleString('en-IN') : 'N/A'}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{up.original_name}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{up.uploaded_by_name || 'Admin'}</td>
                      <td className="p-3 text-center font-bold text-slate-900 dark:text-white">{up.total_rows}</td>
                      <td className="p-3 text-center text-emerald-600 dark:text-emerald-400 font-extrabold">{up.successful_rows}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 font-extrabold rounded-full text-[10px] border ${
                          up.status === 'IMPORTED' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}>
                          {up.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => viewUploadDetailsModal(up.id)}
                            className="min-h-[38px] px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                            title="View Upload Details"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setDeleteTarget(up)}
                            className="min-h-[38px] px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1 border border-rose-200 dark:border-rose-800"
                            title="Delete Excel File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedUploadDetail && (
        <Modal
          isOpen={!!selectedUploadDetail}
          onClose={() => setSelectedUploadDetail(null)}
          title={`Upload Details: ${selectedUploadDetail.upload?.original_name}`}
        >
          <div className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block uppercase font-bold">Upload Date</span>
                <span className="font-bold text-slate-900 dark:text-white">{new Date(selectedUploadDetail.upload?.created_at).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block uppercase font-bold">Uploaded By</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedUploadDetail.upload?.uploaded_by_name || 'Admin'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block uppercase font-bold">Total Rows</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedUploadDetail.upload?.total_rows}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block uppercase font-bold">Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedUploadDetail.upload?.status}</span>
              </div>
            </div>

            {selectedUploadDetail.errors && selectedUploadDetail.errors.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-extrabold text-rose-700 dark:text-rose-400 text-xs">Logged Validation Errors ({selectedUploadDetail.errors.length}):</h4>
                <div className="max-h-60 overflow-y-auto border border-rose-200 dark:border-rose-900 rounded-xl p-2 bg-rose-50 dark:bg-rose-950/40 space-y-2">
                  {selectedUploadDetail.errors.map((err: any) => (
                    <div key={err.id} className="p-2.5 bg-white dark:bg-slate-850 border border-rose-200 dark:border-rose-900 rounded-lg font-mono text-[11px]">
                      <div className="flex justify-between text-rose-700 dark:text-rose-400 font-bold">
                        <span>Row #{err.row_number} - Proposal: {err.loan_account_number}</span>
                        <span>{new Date(err.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-900 dark:text-slate-200 font-medium mt-1">{err.error_message}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold text-center">
                ✅ Zero validation errors recorded for this Excel file.
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Confirm Delete Excel File"
        >
          <div className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2">
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                Are you sure you want to delete this Excel file?
              </p>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                File: <span className="font-bold font-mono text-rose-600 dark:text-rose-400">{deleteTarget.original_name}</span> (Upload #{deleteTarget.id})
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed">
                Deletes uploaded file metadata and storage file. Already imported recovery cases in database will be preserved.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl">
              <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-800 dark:text-slate-200 select-none">
                <input
                  type="checkbox"
                  checked={deleteCasesAlso}
                  onChange={(e) => setDeleteCasesAlso(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-rose-700 dark:text-rose-400">Also delete imported recovery cases from database (Dangerous Action)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => { setDeleteTarget(null); setDeleteCasesAlso(false); }}
                className="min-h-[42px] px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExcel}
                disabled={isDeleting}
                className="min-h-[42px] px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
