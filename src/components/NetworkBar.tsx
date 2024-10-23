import React, { useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import type { NetworkRequest } from './types';

interface NetworkBarProps {
  request: NetworkRequest;
  index: number;
  minTime: number;
  pixelsPerMs: number;
  barHeight: number;
  barPadding: number;
  now: number;
  onClick: (e: React.MouseEvent, request: NetworkRequest) => void;
}

const COLORS = {
  GET: '#4ade80',
  POST: '#60a5fa',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
  pending: '#94a3b8',
  error: '#dc2626'
};

export const NetworkBar: React.FC<NetworkBarProps> = ({
  request,
  index,
  minTime,
  pixelsPerMs,
  barHeight,
  barPadding,
  now,
  onClick
}) => {
  const startX = (request.startTime - minTime) * pixelsPerMs;
  const currentEndTime = request.endTime || now;
  const duration = currentEndTime - request.startTime;
  const y = index * (barHeight + barPadding) + 24;
  
  const color = request.state === 'error' ? COLORS.error : 
                request.state === 'pending' ? COLORS.pending :
                COLORS[request.method as keyof typeof COLORS];

  const barWidth = useMotionValue(2);

  useEffect(() => {
    const updateWidth = () => {
      if (request.endTime) {
        animate(barWidth, Math.max(2, (request.endTime - request.startTime) * pixelsPerMs), {
          duration: 0.3,
          ease: "easeOut"
        });
      } else {
        barWidth.set(Math.max(2, (now - request.startTime) * pixelsPerMs));
        requestAnimationFrame(updateWidth);
      }
    };
    requestAnimationFrame(updateWidth);

    return () => {
      barWidth.stop();
    };
  }, [request.endTime, request.startTime, pixelsPerMs, now, barWidth]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: y,
        height: barHeight,
        backgroundColor: color,
        borderRadius: '2px',
        width: barWidth,
        x: startX,
      }}
      transition={{ 
        x: { duration: 0.3, ease: "easeOut" }
      }}
      className="relative overflow-hidden group cursor-pointer hover:brightness-110"
      onClick={(e) => onClick(e, request)}
    >
      {request.state === 'pending' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          }}
        />
      )}
      
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-10">
        {request.method} {request.url.split('/').pop()}
        <br />
        {request.endTime ? 
          `Duration: ${duration.toFixed(0)}ms` : 
          `Elapsed: ${duration.toFixed(0)}ms...`
        }
      </div>
    </motion.div>
  );
};