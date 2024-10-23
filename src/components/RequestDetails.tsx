import React from 'react';
import { motion } from 'framer-motion';

interface RequestDetailsProps {
  request: NetworkRequest;
  position: { x: number; y: number };
  onClose: () => void;
}

export const RequestDetails: React.FC<RequestDetailsProps> = ({ request, position, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bg-gray-900 rounded-lg shadow-xl p-4 z-50"
      style={{
        left: position.x,
        top: position.y,
        maxWidth: '400px',
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px'
      }}
    >
      <div className="text-sm">
        <div className="font-bold mb-2">{request.method} {request.url}</div>
        <div>Start: {new Date(request.startTime).toLocaleTimeString()}</div>
        {request.endTime && (
          <>
            <div>End: {new Date(request.endTime).toLocaleTimeString()}</div>
            <div>Duration: {(request.endTime - request.startTime).toFixed(0)}ms</div>
          </>
        )}
        <div>Status: {request.state}</div>
      </div>
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
        onClick={onClose}
      >
        ×
      </button>
    </motion.div>
  );
};