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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-[#D1D1D1] w-full ${maxWidth} max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {customHeader ? (
          <div className="shrink-0">{customHeader}</div>
        ) : !hideHeader ? (
          <div className="px-5 sm:px-6 py-4 border-b border-[#E8E8E8] flex items-center justify-between bg-[#F7F7F7] shrink-0">
            <h3 className="text-base sm:text-lg font-black text-[#111111]">{title}</h3>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#666666] hover:text-[#000000] hover:bg-[#E8E8E8] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : null}
        <div className="p-4 sm:p-6 text-[#111111] overflow-y-auto flex-1 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
};

