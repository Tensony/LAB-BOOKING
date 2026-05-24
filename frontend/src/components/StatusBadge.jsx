import { CheckCircle, Clock, XCircle } from 'lucide-react';

const config = {
  approved: { label: 'Approved', Icon: CheckCircle, className: 'badge-approved' },
  pending: { label: 'Pending', Icon: Clock, className: 'badge-pending' },
  rejected: { label: 'Rejected', Icon: XCircle, className: 'badge-rejected' },
};

const StatusBadge = ({ status, showIcon = true }) => {
  const item = config[status] || { label: status, Icon: null, className: 'badge-pending' };
  const Icon = item.Icon;

  return (
    <span className={`${item.className} capitalize`}>
      {showIcon && Icon && <Icon size={11} className="mr-1" />}
      {item.label}
    </span>
  );
};

export default StatusBadge;
