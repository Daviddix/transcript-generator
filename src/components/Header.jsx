import React, { useRef } from 'react';
import { Upload, Settings, ShieldCheck, RefreshCw, Layers, Sparkles, ChevronDown } from 'lucide-react';

export function Header({ 
  institution, 
  onUploadExcel, 
  onOpenSettings, 
  onResetToDefault, 
  isLoading, 
  cohorts = [],
  selectedCohort,
  onSelectCohort,
  totalStudents = 0
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadExcel(file);
      e.target.value = '';
    }
  };

  return (
    <header className="no-print sticky top-0 z-40 w-full max-w-full bg-white/90 backdrop-blur-md border-b border-[#ebebeb] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all">
      {/* Top 2px decorative multi-stop Vercel mesh gradient line */}
      <div className="h-[2px] w-full vercel-mesh-bar" />

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity & Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0 w-9 h-9 rounded-lg bg-white border border-[#ebebeb] p-1 flex items-center justify-center shadow-sm">
            <img 
              src={institution.crest || '/logo.svg'} 
              alt="College Crest" 
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = '/logo.svg'; }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-[#171717] tracking-tight truncate">
                {institution.name}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium font-mono text-[#0070f3] bg-[#d3e5ff]/50 border border-[#0070f3]/20 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            </div>
            <p className="text-xs text-[#888888] font-normal truncate hidden md:block">
              Examination Records & Academic Transcript Engine &bull; <span className="font-mono text-[#171717] font-medium">{totalStudents} records</span>
            </p>
          </div>
        </div>

        {/* Right: Actions Cluster */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          
          {/* Cohort Selector Pill */}
          {cohorts.length > 0 && (
            <div className="relative flex items-center bg-[#fafafa] hover:bg-[#f5f5f5] border border-[#ebebeb] rounded-full px-3 py-1.5 text-xs text-[#4d4d4d] transition-colors">
              <Layers className="w-3.5 h-3.5 text-[#888888] mr-1.5 flex-shrink-0" />
              <select
                value={selectedCohort}
                onChange={(e) => onSelectCohort(e.target.value)}
                className="bg-transparent text-[#171717] font-medium focus:outline-none cursor-pointer pr-4 appearance-none text-xs"
              >
                <option value="ALL">All Cohorts ({cohorts.length})</option>
                {cohorts.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.studentCount})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#888888] absolute right-2.5 pointer-events-none" />
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            className="hidden"
          />

          {/* Primary CTA: Upload Excel */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full bg-[#171717] hover:bg-[#333333] text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            title="Import Excel ledger spreadsheet (.xlsx)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import Ledger</span>
            <span className="sm:hidden">Import</span>
          </button>

          {/* Secondary CTA: Reload Default */}
          <button
            onClick={onResetToDefault}
            disabled={isLoading}
            className="p-2 rounded-full bg-white hover:bg-[#f5f5f5] text-[#4d4d4d] hover:text-[#171717] border border-[#ebebeb] transition-all active:scale-[0.95] cursor-pointer shadow-sm disabled:opacity-40"
            title="Reload default workbook"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0070f3]' : ''}`} />
          </button>

          {/* Secondary CTA: Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-white hover:bg-[#f5f5f5] text-[#4d4d4d] hover:text-[#171717] border border-[#ebebeb] transition-all active:scale-[0.95] cursor-pointer shadow-sm"
            title="Configure institution details, signatures and courses"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </header>
  );
}
