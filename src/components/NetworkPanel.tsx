import React, { useState, useEffect } from 'react';
import { NetworkRequest } from '../types';
import { Clock, FileJson, Globe, XCircle } from 'lucide-react';
import NetworkWaterfall from './NetworkWaterfall';
import { motion, AnimatePresence } from 'framer-motion';

function NetworkPanel() {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [containerWidth, setContainerWidth] = useState(800);

  // Simulate network requests for demo
  useEffect(() => {
    const createRequest = () => {
      const id = Math.random().toString(36).substring(7);
      const duration = 500 + Math.random() * 3000;
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      const types = ['fetch', 'xhr', 'document', 'stylesheet', 'script'];
      const startTime = Date.now();
      
      const newRequest: NetworkRequest = {
        id,
        url: `https://api.example.com/endpoint/${id}`,
        method: methods[Math.floor(Math.random() * methods.length)],
        status: 200,
        startTime,
        endTime: null,
        size: Math.floor(Math.random() * 1000000),
        type: types[Math.floor(Math.random() * types.length)],
        state: 'pending'
      };

      setRequests(prev => [...prev.slice(-50), newRequest]); // Keep last 50 requests

      // Complete the request after the duration
      setTimeout(() => {
        setRequests(prev => 
          prev.map(req => 
            req.id === id 
              ? { 
                  ...req, 
                  endTime: startTime + duration,
                  state: Math.random() > 0.1 ? 'complete' : 'error',
                  status: Math.random() > 0.1 ? 200 : 500
                }
              : req
          )
        );
      }, duration);
    };

    const interval = setInterval(createRequest, 2000);
    createRequest(); // Create first request immediately

    return () => clearInterval(interval);
  }, []);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.network-container');
      if (container) {
        setContainerWidth(container.clientWidth);
      }
    };

    window.addEventListener('resize', updateWidth);
    updateWidth();

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (start: number, end: number | null) => {
    if (!end) return '...';
    return `${(end - start).toFixed(0)}ms`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-semibold">Network Panel</h1>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-3 bg-gray-700 text-sm font-medium">
            <div className="col-span-5">Name</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Method</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-1">Size</div>
            <div className="col-span-2">Time</div>
          </div>

          <div className="divide-y divide-gray-700 max-h-[300px] overflow-y-auto">
            <AnimatePresence>
              {[...requests].reverse().map((request) => (
                <motion.div 
                  key={request.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-12 gap-4 p-3 text-sm hover:bg-gray-750"
                >
                  <div className="col-span-5 flex items-center gap-2 truncate">
                    <FileJson className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{request.url}</span>
                  </div>

                  <div className="col-span-1">
                    {request.state === 'pending' ? (
                      <motion.span 
                        className="text-yellow-400"
                        animate={{ opacity: [0.5, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                      >
                        Pending
                      </motion.span>
                    ) : request.state === 'error' ? (
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Error
                      </span>
                    ) : (
                      <span className="text-green-400">{request.status}</span>
                    )}
                  </div>

                  <div className="col-span-1">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${request.method === 'GET' ? 'bg-blue-500/20 text-blue-300' :
                        request.method === 'POST' ? 'bg-green-500/20 text-green-300' :
                        request.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'}
                    `}>
                      {request.method}
                    </span>
                  </div>

                  <div className="col-span-2 text-gray-400">{request.type}</div>
                  <div className="col-span-1 text-gray-400">{formatSize(request.size)}</div>
                  <div className="col-span-2 flex items-center gap-1 text-gray-400">
                    <Clock className="w-4 h-4" />
                    {formatDuration(request.startTime, request.endTime)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="border-t border-gray-700 p-4 network-container">
            <h2 className="text-sm font-medium mb-4">Waterfall View</h2>
            <NetworkWaterfall 
              requests={requests} 
              width={containerWidth - 32} 
              height={Math.max(100, requests.length * 24)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkPanel;