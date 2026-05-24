import { useState } from 'react';
import { FlaskConical } from 'lucide-react';

const LabImage = ({ src, name, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        className={`object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 ${className}`}>
      <FlaskConical size={28} className="text-brand-600/70" />
    </div>
  );
};

export default LabImage;
