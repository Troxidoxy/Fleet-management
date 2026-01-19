
import React, { useRef, useEffect } from 'react';
import { MiningLog } from '../types';

interface Props {
  logs: MiningLog[];
}

const MiningTerminal: React.FC<Props> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div className="bg-black border border-gray-800 rounded-xl flex flex-col h-[350px]">
      <div className="px-4 py-2 border-b border-gray-800 flex justify-between items-center bg-[#0d0d0d] rounded-t-xl">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-[10px] text-gray-500 uppercase font-mono">Stratum V1 Engine</span>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 scrollbar-thin scrollbar-thumb-gray-800"
      >
        {logs.length === 0 ? (
          <div className="text-gray-600 animate-pulse italic">Waiting for activity...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-3">
              <span className="text-gray-600 min-w-[85px]">
                [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]
              </span>
              <span className={
                log.type === 'success' ? 'text-green-400' :
                log.type === 'error' ? 'text-red-400' :
                log.type === 'warning' ? 'text-yellow-400' :
                'text-blue-300'
              }>
                {log.type === 'success' && '✓ '}
                {log.type === 'error' && '✗ '}
                {log.type === 'warning' && '! '}
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MiningTerminal;
