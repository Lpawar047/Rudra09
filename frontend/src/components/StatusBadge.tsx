import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = (s: string) => {
    const uppercaseStatus = (s || '').toUpperCase().trim();
    switch (uppercaseStatus) {
      case 'PAID':
      case 'RECOVERED':
      case 'CLOSED':
        return 'bg-[#111111] text-[#FFFFFF] border-[#111111]';
      case 'UNPAID':
      case 'OVERDUE':
      case 'LEGAL_ACTION':
        return 'bg-[#FFF8CC] text-[#000000] border-[#EAB308] font-black';
      case 'IN_PROGRESS':
      case 'UNDER_RECOVERY':
      case 'RECOVERY':
      case 'ASSIGNED':
      case 'CONTACTED':
      case 'PROMISE_TO_PAY':
        return 'bg-[#FFFFFF] text-[#111111] border-[#D6D6D6] font-semibold';
      case 'PENDING':
      case 'DISABLED':
      case 'INACTIVE':
      default:
        return 'bg-[#F2F2F2] text-[#111111] border-[#D6D6D6]';
    }
  };

  const uppercaseStatus = (status || '').toUpperCase().trim();
  const showYellowDot = [
    'IN_PROGRESS',
    'ASSIGNED',
    'CONTACTED',
    'PROMISE_TO_PAY',
    'UNDER_RECOVERY',
    'RECOVERY'
  ].includes(uppercaseStatus);

  const formattedStatus = status ? status.replace(/_/g, ' ') : 'N/A';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs border whitespace-nowrap select-none ${getStyle(
        status
      )}`}
    >
      {showYellowDot && (
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-[#FACC15] shrink-0"></span>
      )}
      <span>{formattedStatus}</span>
    </span>
  );
};
