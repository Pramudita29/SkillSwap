import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === 'success' ? 'bg-green-500/20 border-green-500/50' :
    type === 'error' ? 'bg-red-500/20 border-red-500/50' :
    'bg-blue-500/20 border-blue-500/50';

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl backdrop-blur-xl border ${bgColor} text-white animate-slide-in`}>
      <div className="flex items-center gap-2">
        {type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
        {type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
