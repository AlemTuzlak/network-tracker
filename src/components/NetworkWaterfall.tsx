import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { NetworkBar } from './NetworkBar';
import { RequestDetails } from './RequestDetails';
import type { NetworkRequest, Position } from './types';

interface Props {
  requests: NetworkRequest[];
  width: number;
}

const BAR_HEIGHT = 20;
const BAR_PADDING = 4;
const TIME_COLUMN_INTERVAL = 1000; // 1 second
const MIN_SCALE = 0.1;
const MAX_SCALE = 10;
const FUTURE_BUFFER = 5000; // 5 seconds ahead

const NetworkWaterfall: React.FC<Props> = ({ requests, width }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });
  const [selectedRequest, setSelectedRequest] = useState<{ request: NetworkRequest; position: Position } | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 16);
    return () => clearInterval(interval);
  }, []);

  const minTime = Math.min(...requests.map(r => r.startTime));
  const maxTime = now + FUTURE_BUFFER;
  const duration = maxTime - minTime;
  const pixelsPerMs = scale;
  const scaledWidth = Math.max(width, duration * pixelsPerMs);
  const timeColumns = Math.ceil(duration / TIME_COLUMN_INTERVAL);

  // Auto-scroll to keep the current time in view
  useEffect(() => {
    if (containerRef.current && !isDragging) {
      const currentTimePosition = (now - minTime) * pixelsPerMs;
      const containerWidth = containerRef.current.clientWidth;
      const targetScroll = Math.max(0, currentTimePosition - containerWidth * 0.8);
      
      containerRef.current.scrollLeft = targetScroll;
    }
  }, [now, minTime, pixelsPerMs, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.pageX - (containerRef.current?.offsetLeft || 0),
      scrollLeft: containerRef.current?.scrollLeft || 0
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - dragStart.x) * 2;
    if (containerRef.current) {
      containerRef.current.scrollLeft = dragStart.scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.1;
    setScale(s => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta)));
  };

  const handleBarClick = (e: React.MouseEvent, request: NetworkRequest) => {
    setSelectedRequest({
      request,
      position: { x: e.pageX, y: e.pageY }
    });
  };

  const handleReset = () => {
    setScale(0.1);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  };

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 bg-gray-900 p-2 border-b border-gray-700 flex items-center gap-2">
        <button
          className="p-1 hover:bg-gray-700 rounded"
          onClick={() => setScale(s => Math.min(MAX_SCALE, s + 0.1))}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          className="p-1 hover:bg-gray-700 rounded"
          onClick={() => setScale(s => Math.max(MIN_SCALE, s - 0.1))}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          className="p-1 hover:bg-gray-700 rounded"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="text-sm text-gray-400">
          Scale: {scale.toFixed(2)}x
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative overflow-x-auto scrollbar-hide"
        style={{ 
          height: Math.min(requests.length * (BAR_HEIGHT + BAR_PADDING) + 24, window.innerHeight - 200),
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div 
          className="relative"
          style={{ width: scaledWidth }}
        >
          <div className="absolute top-0 left-0 right-0 h-5 border-b border-gray-700">
            {Array.from({ length: timeColumns }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full border-l border-gray-700 text-xs text-gray-500"
                style={{
                  left: i * TIME_COLUMN_INTERVAL * pixelsPerMs,
                }}
              >
                <span className="ml-1">
                  {new Date(minTime + i * TIME_COLUMN_INTERVAL).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {requests.map((request, index) => (
              <NetworkBar
                key={request.id}
                request={request}
                index={index}
                minTime={minTime}
                pixelsPerMs={pixelsPerMs}
                barHeight={BAR_HEIGHT}
                barPadding={BAR_PADDING}
                now={now}
                onClick={handleBarClick}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <RequestDetails
            request={selectedRequest.request}
            position={selectedRequest.position}
            onClose={() => setSelectedRequest(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkWaterfall;