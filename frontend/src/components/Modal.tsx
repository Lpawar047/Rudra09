import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  hideHeader?: boolean;
  customHeader?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title = '',
  children,
  maxWidth = 'max-w-xl',
  hideHeader = false,
  customHeader,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 dark:bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full ${maxWidth} max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {customHeader ? (
          <div className="shrink-0">{customHeader}</div>
        ) : !hideHeader ? (
          <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80 shrink-0">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : null}
        <div className="p-4 sm:p-6 text-slate-800 dark:text-slate-200 overflow-y-auto flex-1 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
};

