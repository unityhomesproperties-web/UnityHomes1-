// @ts-nocheck
import React, { useState } from 'react';
import { 
  FileSpreadsheet, FileText, Download, Printer, X 
} from 'lucide-react';

interface ColumnConfig<T> {
  header: string;
  accessor: (item: T) => string | number;
}

interface ExportCenterProps<T> {
  title: string;
  data: T[];
  columns: ColumnConfig<T>[];
  activeFiltersDesc?: string;
  isOpen: boolean;
  onClose: () => void;
  triggerSuccess: (msg: string) => void;
}

export default function ExportCenter<T>({
  title,
  data,
  columns,
  activeFiltersDesc = 'None / Complete List',
  isOpen,
  onClose,
  triggerSuccess
}: ExportCenterProps<T>) {
  if (!isOpen) return null;

  const getHeaderMetadataString = () => {
    return `Lagos Realty Partners - PMC managed by Unity Homes and Properties Ltd
Report: ${title}
Generated On: ${new Date().toLocaleDateString('en-NG')} ${new Date().toLocaleTimeString('en-NG')}
Applied Filters: ${activeFiltersDesc}
--------------------------------------------------------------------------------`;
  };

  const handleExportCSV = () => {
    if (data.length === 0) {
      alert('No data records available to export.');
      return;
    }

    try {
      const headerRow = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');
      const rows = data.map(item => 
        columns.map(col => {
          const val = String(col.accessor(item));
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
      );

      const metadata = getHeaderMetadataString();
      const csvContent = `${metadata}\n\n${headerRow}\n${rows.join('\n')}`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerSuccess(`Successfully generated and downloaded CSV ledger file for: ${title}`);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportExcel = () => {
    if (data.length === 0) {
      alert('No data records available to export.');
      return;
    }

    try {
      // Excel-friendly XML template
      let xml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
          <style>
            table { border-collapse:collapse; font-family: 'Inter', sans-serif; }
            th { background-color: #0f766e; color: #ffffff; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
            td { padding: 6px; border: 1px solid #ddd; }
            .header-info { font-weight: bold; color: #1e3a8a; }
          </style>
        </head>
        <body>
          <h2>Lagos Realty Partners</h2>
          <h4>PMC managed by Unity Homes and Properties Ltd</h4>
          <p><b>Report:</b> ${title}</p>
          <p><b>Date:</b> ${new Date().toLocaleDateString('en-NG')} ${new Date().toLocaleTimeString('en-NG')}</p>
          <p><b>Filters:</b> ${activeFiltersDesc}</p>
          <br/>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  ${columns.map(col => `<td>${col.accessor(item)}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_spreadsheet_${Date.now()}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerSuccess(`Successfully generated and downloaded Excel spreadsheet file for: ${title}`);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportPDF = () => {
    if (data.length === 0) {
      alert('No data records available to export.');
      return;
    }

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Pop-up blocked. Kindly enable pop-ups in your browser to download PDF ledgers.');
        return;
      }

      const rowsHtml = data.map((item, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
          ${columns.map(col => `<td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151;">${col.accessor(item)}</td>`).join('')}
        </tr>
      `).join('');

      const content = `
        <html>
        <head>
          <title>${title} - Certified Ledger Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #111827; background-color: #ffffff; }
            .badge { display: inline-block; padding: 4px 12px; background-color: #f0fdfa; color: #0f766e; border: 1px solid #ccfbf1; font-size: 10px; font-weight: 700; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 24px; }
            .header-container { border-bottom: 3px double #0f766e; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
            .brand-h1 { font-size: 26px; font-weight: 900; color: #042f2e; text-transform: uppercase; letter-spacing: -0.02em; margin: 0 0 4px 0; }
            .brand-sub { font-size: 13px; font-weight: 500; color: #0d9488; margin: 0; }
            .meta-section { text-align: right; font-size: 11px; color: #4b5563; font-family: monospace; line-height: 1.6; }
            .title-h2 { font-size: 18px; font-weight: 700; color: #111827; text-transform: uppercase; margin: 0 0 10px 0; border-left: 4px solid #0f766e; padding-left: 12px; }
            .filters-desc { font-size: 12px; color: #6b7280; font-weight: 400; margin: 0 0 24px 0; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 11px; margin-top: 10px; }
            th { padding: 12px 10px; background-color: #0f766e; color: #ffffff; font-weight: 700; border-bottom: 2px solid #042f2e; text-transform: uppercase; letter-spacing: 0.05em; }
            .footer { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 40px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <span class="badge">Official PMC System Certified Extract</span>
          
          <div class="header-container">
            <div>
              <h1 class="brand-h1">Lagos Realty Partners</h1>
              <h4 class="brand-sub">Property Management Company • Managed via Unity Homes ERP</h4>
            </div>
            <div class="meta-section">
              <b>System Code:</b> LRP-PMC-991A<br/>
              <b>Report Date:</b> ${new Date().toLocaleDateString('en-NG')} ${new Date().toLocaleTimeString('en-NG')}<br/>
              <b>License Status:</b> Active Professional Suite
            </div>
          </div>

          <h2 class="title-h2">${title}</h2>
          <p class="filters-desc"><b>Active Segment Filter Scope:</b> ${activeFiltersDesc}</p>

          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>Powered by Unity Homes and Properties Ltd • Cloud Run Certified Signature</span>
            <span>Page 1 of 1</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(content);
      printWindow.document.close();

      triggerSuccess(`Dispatched certified PDF ledger compilation for: ${title}`);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
      <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full border border-stone-200 shadow-sm relative p-6 space-y-5 animate-scale-up">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-stone-200 pb-3">
          <div>
            <h3 className="font-display font-semibold text-teal-950 text-sm uppercase">PMC Export Docket Center</h3>
            <span className="text-[10px] text-stone-400 font-mono mt-1 block">Certified Report Source Ledger Extraction</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-#6B7280 hover:bg-stone-50 rounded-full cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 space-y-2">
          <span className="block text-[9px] font-mono font-semibold uppercase tracking-wider text-teal-850">REPORT PARAMETERS</span>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-#6B7280">Report Segment:</span>
              <strong className="text-teal-950 font-semibold">{title}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-#6B7280">Records Count:</span>
              <strong className="text-teal-950 font-semibold font-mono">{data.length} records</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-#6B7280">Filter Conditions:</span>
              <strong className="text-teal-950 font-semibold max-w-[200px] text-right truncate" title={activeFiltersDesc}>{activeFiltersDesc}</strong>
            </div>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-1 gap-3">
          
          <button
            onClick={handleExportCSV}
            className="p-3.5 border border-stone-200 hover:border-teal-300 hover:bg-teal-50/20 rounded-2xl flex items-center space-x-3 transition cursor-pointer text-left font-semibold text-teal-950 uppercase text-[10px]"
          >
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Download className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="block font-semibold">Export Filtered CSV Ledger</span>
              <span className="block text-[9px] font-mono font-medium text-stone-400 lowercase">Plain-text comma-separated database format</span>
            </div>
          </button>

          <button
            onClick={handleExportExcel}
            className="p-3.5 border border-stone-200 hover:border-teal-300 hover:bg-teal-50/20 rounded-2xl flex items-center space-x-3 transition cursor-pointer text-left font-semibold text-teal-950 uppercase text-[10px]"
          >
            <div className="p-2 bg-teal-50 text-teal-800 rounded-xl">
              <FileSpreadsheet className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="block font-semibold">Export Filtered Excel Sheet</span>
              <span className="block text-[9px] font-mono font-medium text-stone-400 lowercase">Formatted spreadsheet XML grid file</span>
            </div>
          </button>

          <button
            onClick={handleExportPDF}
            className="p-3.5 border border-stone-200 hover:border-teal-300 hover:bg-teal-50/20 rounded-2xl flex items-center space-x-3 transition cursor-pointer text-left font-semibold text-teal-950 uppercase text-[10px]"
          >
            <div className="p-2 bg-purple-50 text-purple-800 rounded-xl">
              <Printer className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="block font-semibold">Generate Branded PDF Report</span>
              <span className="block text-[9px] font-mono font-medium text-stone-400 lowercase">Corporate layout with Unity Homes Properties digital watermark signatures</span>
            </div>
          </button>

        </div>

        {/* Certification Tag */}
        <div className="text-center pt-2 border-t">
          <span className="text-[9px] text-stone-400 font-mono">
            System Certified Signature • ID: decf453b-e376-444d
          </span>
        </div>

      </div>
    </div>
  );
}
