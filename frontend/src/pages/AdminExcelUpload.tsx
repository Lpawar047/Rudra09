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
  const [autoImporting, setAutoImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [importedRows, setImportedRows] = useState<any[] | null>(null);
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
      setImportedRows(null);
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
      setImportedRows(null);
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
    setImportedRows(null);

    // Step 3 FormData Creation
    const formData = new FormData();
    formData.append('file', selectedFile);

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

  const handleUploadAndAutoImport = async () => {
    if (!selectedFile) return;

    setAutoImporting(true);
    setErrorMsg('');
    setSuccessMsg('');
    setImportSummary(null);
    setValidationResult(null);
    setImportedRows(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Step 1: Upload and validate spreadsheet
      const uploadRes = await api.post('/excel/upload', formData);
      const valData = uploadRes.data;

      if (!valData.preview_rows || valData.preview_rows.length === 0) {
        setValidationResult(valData);
        setErrorMsg('No valid rows found in Excel sheet. Please review errors below.');
        return;
      }

      // Step 2: Automatically import all records into database via server-side batch processing
      const importRes = await api.post('/excel/import', {
        upload_id: valData.upload_id,
      });

      // Retain preview records to display on screen
      setImportedRows(importRes.data.preview_rows || valData.preview_rows || []);
      setImportSummary({
        imported_new: importRes.data.imported_new_records ?? 0,
        updated_existing: importRes.data.updated_existing_records ?? 0,
        duplicate_rows: importRes.data.updated_existing_records ?? valData.duplicate_rows ?? 0,
        total_rows: importRes.data.total_rows ?? valData.total_rows ?? 0,
      });

      setSuccessMsg(`Excel data imported successfully! ${importRes.data.imported_new_records ?? 0} new recovery cases added, ${importRes.data.updated_existing_records ?? 0} updated.`);
      setSelectedFile(null);
      fetchRecentUploads();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to auto-import Excel data.');
    } finally {
      setAutoImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationResult || !validationResult.upload_id) return;

    setImporting(true);
    setErrorMsg('');

    try {
      const res = await api.post('/excel/import', {
        upload_id: validationResult.upload_id,
      });

      // Retain imported records in state so they are automatically displayed on screen
      setImportedRows(res.data.preview_rows || validationResult.preview_rows || []);

      setImportSummary({
        imported_new: res.data.imported_new_records ?? 0,
        updated_existing: res.data.updated_existing_records ?? 0,
        duplicate_rows: res.data.updated_existing_records ?? validationResult.duplicate_rows ?? 0,
        total_rows: res.data.total_rows ?? validationResult.total_rows ?? 0,
      });

      setSuccessMsg(`Excel data imported successfully! ${res.data.imported_new_records ?? 0} new records added, ${res.data.updated_existing_records ?? 0} updated.`);
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
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#111111] tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-[#EAB308]" />
            Excel Import & History
          </h1>
          <p className="text-sm text-[#666666] font-normal mt-1">
            Upload recovery cases from Excel and track import history.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/cases')}
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-white rounded-xl text-[13px] sm:text-[14px] font-semibold shadow-xs transition-colors shrink-0"
        >
          <FolderOpen className="w-4 h-4 text-[#FACC15]" />
          View Cases Page
        </button>
      </div>

      {/* Upload History High-Level Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D6D6D6] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-[12px] font-semibold uppercase tracking-wider">Total Excel Uploads</span>
            <Hash className="w-5 h-5 text-[#EAB308]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-heading tabular-nums text-[#111111]">
            {summaryStats?.total_uploads || recentUploads.length || 0}
          </p>
          <p className="text-[12px] text-[#666666] font-normal">Permanent database audit log count</p>
        </div>

        <div className="bg-white border border-[#D6D6D6] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-[12px] font-semibold uppercase tracking-wider">Total Rows Processed</span>
            <Layers className="w-5 h-5 text-[#EAB308]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-heading tabular-nums text-[#111111]">
            {(summaryStats?.total_rows_processed || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[12px] text-[#333333] font-medium">Accumulated across all uploads</p>
        </div>

        <div className="bg-white border border-[#D6D6D6] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-[12px] font-semibold uppercase tracking-wider">Successful Records</span>
            <CheckCircle2 className="w-5 h-5 text-[#EAB308]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-heading tabular-nums text-[#111111]">
            {(summaryStats?.successful_rows || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[12px] text-[#333333] font-medium">Validly synchronized to database</p>
        </div>

        <div className="bg-white border border-[#D6D6D6] rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-[12px] font-semibold uppercase tracking-wider">Last Excel Upload</span>
            <Clock className="w-5 h-5 text-[#EAB308]" />
          </div>
          <p className="text-sm font-semibold text-[#111111] truncate">
            {summaryStats?.last_upload?.original_name || 'No uploads yet'}
          </p>
          <p className="text-[12px] text-[#666666] font-normal tabular-nums">
            {summaryStats?.last_upload?.created_at ? new Date(summaryStats.last_upload.created_at).toLocaleString('en-IN') : 'N/A'}
          </p>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-[#FEF9C3] border border-[#EAB308] rounded-xl text-[#000000] text-xs font-bold flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0 text-[#EAB308]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-[#FEF9C3] border border-[#EAB308] rounded-xl text-[#000000] text-xs font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#EAB308]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Post-Import Detailed Notification Toast */}
      {importSummary && (
        <div className="p-5 bg-[#111111] border border-[#333333] rounded-2xl text-white space-y-3 shadow-md">
          <h4 className="font-bold text-base flex items-center gap-2 text-[#FACC15]">
            <CheckCircle2 className="w-5 h-5 text-[#FACC15]" />
            Automatic Data Synchronization Complete
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
            <div className="bg-[#1F1F1F] p-3 rounded-xl border border-[#333333]">
              <span className="text-[#D6D6D6] block text-[10px] uppercase font-sans font-bold">New Records Inserted</span>
              <span className="text-xl font-black text-white">{importSummary.imported_new}</span>
            </div>
            <div className="bg-[#1F1F1F] p-3 rounded-xl border border-[#333333]">
              <span className="text-[#D6D6D6] block text-[10px] uppercase font-sans font-bold">Existing Records Updated</span>
              <span className="text-xl font-black text-white">{importSummary.updated_existing}</span>
            </div>
            <div className="bg-[#1F1F1F] p-3 rounded-xl border border-[#333333]">
              <span className="text-[#D6D6D6] block text-[10px] uppercase font-sans font-bold">Total Rows Processed</span>
              <span className="text-xl font-black text-white">{importSummary.total_rows}</span>
            </div>
            <div className="bg-[#1F1F1F] p-3 rounded-xl border border-[#333333] flex items-center justify-center">
              <button
                onClick={() => navigate('/admin/cases')}
                className="min-h-[44px] w-full py-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#000000] font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs uppercase tracking-wider cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 text-[#000000]" />
                View Cases →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Format Requirements Card */}
      <div className="bg-white border border-[#D1D1D1] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E5E5]">
          <FileText className="w-4 h-4 text-[#000000]" />
          <h4 className="text-xs font-black uppercase tracking-wider text-[#111111]">
            Excel Format Requirements (13 Core Columns)
          </h4>
        </div>
        <p className="text-xs text-[#666666] font-medium mb-3">
          Your spreadsheet may use standard names or bank format headers. All 13 fields are automatically recognized and mapped:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">1. Proposal No</span>
          </div>
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">2. Customer Name</span>
          </div>
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">3. BOM Bucket</span>
          </div>
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">4. POS</span>
          </div>
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">5. EMI Amount</span>
          </div>
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">6. Total Due</span>
          </div>
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">7. Residence Address</span>
          </div>
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">8. Registration Number</span>
          </div>
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">9. Engine No</span>
          </div>
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">10. Chassis No</span>
          </div>
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">11. Asset Desc</span>
          </div>
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">12. MO NO</span>
          </div>
          <div className="p-2 bg-[#F8F8F8] rounded-lg border border-[#E5E5E5] flex items-center gap-2 col-span-1 sm:col-span-2 lg:col-span-4">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]"></span>
            <span className="font-bold text-[#111111]">13. PAID / UNPAID Status</span>
          </div>
        </div>
      </div>

      {/* Main Upload Box */}
      <div className="bg-white border border-[#D6D6D6] rounded-2xl p-6 shadow-xs space-y-6">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#D6D6D6] hover:border-[#FACC15] rounded-2xl p-8 text-center transition-all bg-[#FAFAFA]/60 cursor-pointer"
        >
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
            id="excel-file-input"
          />
          <label htmlFor="excel-file-input" className="cursor-pointer space-y-3 block">
            <Upload className="w-12 h-12 text-[#111111] mx-auto" />
            <div>
              <p className="text-base font-black text-[#111111]">
                {selectedFile ? selectedFile.name : 'Click to upload or drag & drop Excel file'}
              </p>
              <p className="text-xs text-[#666666] font-medium mt-1">
                Supports .xlsx and .xls formats (Maximum file size: 10MB)
              </p>
            </div>
          </label>
        </div>

        {selectedFile && !validationResult && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <button
              onClick={handleUploadAndValidate}
              disabled={uploading || autoImporting}
              className="min-h-[44px] px-5 py-2.5 bg-white hover:bg-[#F2F2F2] text-[#111111] border border-[#D6D6D6] disabled:opacity-50 font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#111111]" />
                  <span>Parsing & Validating...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-[#666666]" />
                  <span>Preview & Validate First</span>
                </>
              )}
            </button>

            <button
              onClick={handleUploadAndAutoImport}
              disabled={uploading || autoImporting}
              className="min-h-[44px] px-6 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] active:scale-[0.99] text-[#000000] border border-[#EAB308] disabled:opacity-50 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {autoImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#000000]" />
                  <span>Auto-Importing to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#000000]" />
                  <span>⚡ Upload & Auto-Import Directly</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Validation & Preview Section */}
      {validationResult && (
        <div className="bg-white border border-[#D6D6D6] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D6D6D6]">
            <div>
              <h3 className="text-lg font-black text-[#111111] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#FACC15]" />
                Sheet Validation Summary: {validationResult.filename}
              </h3>
              <p className="text-xs text-[#666666] font-medium mt-1">
                Parsed file data verified against system schema & database UPSERT rules
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#111111] text-white font-mono text-xs font-bold rounded-xl border border-[#333333]">
                Total Rows: {validationResult.total_rows}
              </span>
              <span className="px-3 py-1 bg-[#FEF9C3] text-[#000000] font-mono text-xs font-black rounded-xl border border-[#EAB308]">
                Valid: {validationResult.successful_rows}
              </span>
              <span className="px-3 py-1 bg-[#F2F2F2] text-[#111111] font-mono text-xs font-bold rounded-xl border border-[#D6D6D6]">
                Updates: {validationResult.duplicate_rows}
              </span>
              <span className="px-3 py-1 bg-[#111111] text-white font-mono text-xs font-bold rounded-xl border border-[#333333]">
                Failed: {validationResult.failed_rows}
              </span>
            </div>
          </div>

          {/* Validated Data Preview Table */}
          {validationResult.preview_rows && validationResult.preview_rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="text-xs font-black uppercase text-[#666666]">
                  Confirmed Valid Records Ready for Database UPSERT ({validationResult.preview_rows.length} Rows)
                </h4>

                <button
                  onClick={handleConfirmImport}
                  disabled={importing}
                  className="min-h-[44px] px-6 py-3 bg-[#FACC15] hover:bg-[#EAB308] text-[#000000] disabled:opacity-50 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
                >
                  {importing ? (
                    <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                      Importing to Database...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#000000]" />
                      Confirm & Import Valid Records
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto w-full rounded-xl border border-[#D6D6D6]">
                <table className="w-full text-xs text-left text-[#111111]">
                  <thead className="bg-[#111111] text-white font-black uppercase text-[11px] tracking-wider">
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
                  <tbody className="divide-y divide-[#D6D6D6] font-medium">
                    {validationResult.preview_rows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#FFFBE6] transition-colors">
                        <td className="p-3 font-mono font-bold text-[#111111]">
                          {row.loan_account_number}
                        </td>
                        <td className="p-3 font-bold text-[#111111]">{row.customer_name}</td>
                        <td className="p-3 font-mono">{row.phone}</td>
                        <td className="p-3">
                          <span className="font-bold text-[#111111] block">{row.vehicle_number}</span>
                          <span className="text-[11px] text-[#666666] font-medium">{row.vehicle_model}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-[#111111]">
                          ₹{row.outstanding_amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 font-mono font-black text-[#111111]">
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

      {/* Newly Imported Recovery Records (Active in System) */}
      {importedRows && importedRows.length > 0 && (
        <div className="bg-white border border-[#D6D6D6] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D6D6D6]">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FEF9C3] border border-[#EAB308] text-[#000000] font-black text-xs">
                  ✓
                </span>
                <h3 className="text-lg font-black text-[#111111]">
                  Imported Recovery Records (Active in System — {importedRows.length} Cases)
                </h3>
              </div>
              <p className="text-xs text-[#666666] font-medium mt-1">
                These recovery cases have been committed to the database and are now actively visible in the Recovery Cases table.
              </p>
            </div>

            <button
              onClick={() => navigate('/admin/cases')}
              className="min-h-[44px] px-5 py-2.5 bg-[#FACC15] hover:bg-[#FFD600] active:scale-[0.99] text-[#000000] font-black text-xs uppercase tracking-wider rounded-xl shadow-xs border border-[#EAB308] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-[#000000]" />
              <span>Open in Recovery Cases Table →</span>
            </button>
          </div>

          <div className="overflow-x-auto w-full rounded-xl border border-[#D6D6D6]">
            <table className="w-full text-xs text-left text-[#111111]">
              <thead className="bg-[#111111] text-white font-black uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Proposal / Loan Acc</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">MO NO</th>
                  <th className="p-3">Vehicle Number</th>
                  <th className="p-3">Asset Desc</th>
                  <th className="p-3">POS Balance</th>
                  <th className="p-3">EMI Amount</th>
                  <th className="p-3">Total Due</th>
                  <th className="p-3">BOM Bucket</th>
                  <th className="p-3">Residence Address</th>
                  <th className="p-3">PAID/UNPAID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6D6D6] font-medium">
                {importedRows.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#FFFBE6] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#666666]">{idx + 1}</td>
                    <td className="p-3 font-mono font-black text-[#111111]">
                      {row.loan_account_number}
                    </td>
                    <td className="p-3 font-bold text-[#111111]">{row.customer_name}</td>
                    <td className="p-3 font-mono text-[#111111]">{row.phone || 'N/A'}</td>
                    <td className="p-3 font-mono font-bold text-[#111111]">
                      {row.vehicle_number || 'N/A'}
                    </td>
                    <td className="p-3 text-[#111111]">{row.vehicle_model || row.asset_desc || 'N/A'}</td>
                    <td className="p-3 font-mono font-bold text-[#111111]">
                      ₹{Number(row.outstanding_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#111111]">
                      ₹{Number(row.emi_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono font-black text-[#111111]">
                      ₹{Number(row.total_overdue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#111111]">
                      {row.bom_bucket || (row.dpd ? `${row.dpd} DPD` : 'BOM 1')}
                    </td>
                    <td className="p-3 text-[#111111] max-w-[200px] truncate" title={row.address}>
                      {row.address || 'N/A'}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={row.recovery_status || 'PENDING'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => navigate('/admin/cases')}
              className="min-h-[40px] px-5 py-2 bg-[#111111] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>View All Cases in Recovery Table</span>
            </button>
          </div>
        </div>
      )}

      {/* Excel Upload History Section */}
      <div className="bg-white border border-[#D6D6D6] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#111111] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FACC15]" />
            Excel Upload Management & History Audit ({recentUploads.length} Files)
          </h3>
          <button
            onClick={fetchRecentUploads}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#666666] hover:text-[#111111] hover:bg-[#F2F2F2] rounded-xl transition-colors border border-[#D6D6D6] cursor-pointer"
            title="Refresh Upload History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {recentUploads.length === 0 ? (
          <p className="text-sm text-[#666666] font-medium text-center py-6">No previous Excel upload audit records found.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left text-[#111111]">
              <thead className="bg-[#111111] text-white uppercase font-black text-[11px] tracking-wider">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Upload Date & Time</th>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Uploaded By</th>
                  <th className="p-3 text-center">Total Rows</th>
                  <th className="p-3 text-center">Validated Rows</th>
                  <th className="p-3 text-center">Imported Rows</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6D6D6] font-medium">
                {recentUploads.map((up, idx) => {
                  const uploadNum = recentUploads.length - idx;
                  const validatedRows = (up.total_rows || 0) - (up.failed_rows || 0);
                  const isCompleted = up.status === 'COMPLETED' || (up.status === 'IMPORTED' && (up.successful_rows || 0) > 0);
                  return (
                    <tr key={up.id} className="hover:bg-[#FFFBE6] transition-colors">
                      <td className="p-3 font-mono font-bold text-[#111111]">
                        #{uploadNum}
                      </td>
                      <td className="p-3 font-mono text-[#666666]">
                        {up.created_at ? new Date(up.created_at).toLocaleString('en-IN') : 'N/A'}
                      </td>
                      <td className="p-3 font-bold text-[#111111]">{up.original_name}</td>
                      <td className="p-3 font-semibold text-[#666666]">{up.uploaded_by_name || 'Admin'}</td>
                      <td className="p-3 text-center font-bold text-[#111111]">{up.total_rows}</td>
                      <td className="p-3 text-center font-bold text-[#111111]">{validatedRows}</td>
                      <td className="p-3 text-center text-[#111111] font-black">{up.successful_rows}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 font-black rounded-full text-[10px] border ${
                          isCompleted
                            ? 'bg-[#111111] text-white border-[#333333]'
                            : up.status === 'VALIDATED'
                            ? 'bg-[#FFF8CC] text-[#000000] border-[#EAB308]'
                            : 'bg-[#F2F2F2] text-[#111111] border-[#D1D1D1]'
                        }`}>
                          {isCompleted ? 'COMPLETED' : up.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => viewUploadDetailsModal(up.id)}
                            className="min-h-[38px] px-3 py-1.5 bg-[#FEF9C3] hover:bg-[#FACC15] text-[#000000] font-black rounded-xl text-xs transition-colors inline-flex items-center gap-1 border border-[#EAB308]/40"
                            title="View Upload Details"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setDeleteTarget(up)}
                            className="min-h-[38px] px-3 py-1.5 bg-[#1F1F1F] hover:bg-[#333333] text-[#D6D6D6] hover:text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1 border border-[#333333]"
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
          <div className="space-y-4 text-xs text-[#111111]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8F8F8] p-4 rounded-xl border border-[#D6D6D6] font-mono">
              <div>
                <span className="text-[10px] text-[#666666] font-sans block uppercase font-bold">Upload Date</span>
                <span className="font-bold text-[#111111]">{new Date(selectedUploadDetail.upload?.created_at).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] font-sans block uppercase font-bold">Uploaded By</span>
                <span className="font-bold text-[#111111]">{selectedUploadDetail.upload?.uploaded_by_name || 'Admin'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] font-sans block uppercase font-bold">Total Rows</span>
                <span className="font-bold text-[#111111]">{selectedUploadDetail.upload?.total_rows}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] font-sans block uppercase font-bold">Status</span>
                <span className="font-black text-[#111111]">{selectedUploadDetail.upload?.status}</span>
              </div>
            </div>

            {selectedUploadDetail.errors && selectedUploadDetail.errors.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-black text-[#111111] text-xs">Logged Validation Errors ({selectedUploadDetail.errors.length}):</h4>
                <div className="max-h-60 overflow-y-auto border border-[#D6D6D6] rounded-xl p-2 bg-[#FAFAFA] space-y-2">
                  {selectedUploadDetail.errors.map((err: any) => (
                    <div key={err.id} className="p-2.5 bg-white border border-[#D6D6D6] rounded-lg font-mono text-[11px]">
                      <div className="flex justify-between text-[#111111] font-bold">
                        <span className="text-[#000000] font-black">Row #{err.row_number} - Proposal: {err.loan_account_number}</span>
                        <span className="text-[#666666] text-[10px]">{new Date(err.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[#EAB308] font-bold mt-1">{err.error_message}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#FEF9C3] border border-[#EAB308] rounded-xl text-[#000000] font-black text-center">
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
          <div className="space-y-4 text-xs text-[#111111]">
            <div className="p-4 bg-[#F8F8F8] border border-[#D6D6D6] rounded-xl space-y-2">
              <p className="font-extrabold text-[#111111] text-sm">
                Are you sure you want to delete this Excel file?
              </p>
              <p className="text-[#333333] font-medium">
                File: <span className="font-bold font-mono text-[#000000] bg-[#FEF9C3] px-1.5 py-0.5 rounded border border-[#EAB308]/30">{deleteTarget.original_name}</span> (Upload #{deleteTarget.id})
              </p>
              <p className="text-[#666666] text-xs font-medium leading-relaxed">
                Deletes uploaded file metadata and storage file. Already imported recovery cases in database will be preserved.
              </p>
            </div>

            <div className="p-3.5 bg-white border border-[#D6D6D6] rounded-xl">
              <label className="flex items-center gap-2.5 cursor-pointer font-bold text-[#111111] select-none">
                <input
                  type="checkbox"
                  checked={deleteCasesAlso}
                  onChange={(e) => setDeleteCasesAlso(e.target.checked)}
                  className="rounded border-[#D6D6D6] bg-white text-[#111111] focus:ring-[#FACC15] w-4 h-4"
                />
                <span className="text-[#111111] font-semibold">Also delete imported recovery cases from database (Dangerous Action)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => { setDeleteTarget(null); setDeleteCasesAlso(false); }}
                className="min-h-[42px] px-4 py-2.5 bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#111111] font-bold rounded-xl border border-[#D6D6D6] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExcel}
                disabled={isDeleting}
                className="min-h-[42px] px-5 py-2.5 bg-[#111111] hover:bg-black text-[#FACC15] hover:text-[#FFD600] font-extrabold rounded-xl border border-[#FACC15]/40 hover:border-[#FACC15] shadow-xs transition-colors flex items-center gap-1.5"
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
