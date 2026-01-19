
import React from 'react';
import { MiningState, HashStats, Device } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface Props {
  state: MiningState;
  history: HashStats[];
}

const Dashboard: React.FC<Props> = ({ state, history }) => {
  const formatHashrate = (ghs: number) => {
    if (ghs >= 1000) return `${(ghs / 1000).toFixed(2)} TH/s`;
    return `${ghs.toFixed(2)} GH/s`;
  };

  const getCoinColor = () => {
    switch (state.activeCoin) {
      case 'BTC': return '#f59e0b';
      case 'BCH': return '#10b981';
      case 'DGB': return '#3b82f6';
      default: return '#6366f1';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          label={`Total ${state.activeCoin} Hashrate`} 
          value={formatHashrate(state.totalHashRate)} 
          subValue="Aggregate performance"
          color="text-indigo-400"
        />
        <MetricCard 
          label={state.isSolo ? "Blocks Found" : "Shares Accepted"} 
          value={state.isSolo ? state.blocksFound.toString() : state.acceptedShares.toString()} 
          subValue={state.isSolo ? "Direct payouts" : "Pool contribution"}
          color={state.isSolo ? "text-yellow-400" : "text-green-400"}
        />
        <MetricCard 
          label="Active Units" 
          value={state.devices.length.toString()} 
          subValue={`${state.devices.filter(d => d.model === 'Avalon Nano 3').length} Avalon units`}
          color="text-blue-400"
        />
        <MetricCard 
          label="Discovery Probability" 
          value={state.isSolo ? "0.000001%" : "99.9%"} 
          subValue="Real-time diff check"
          color="text-purple-400"
        />
      </div>

      {/* Hardware Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.devices.map(device => (
          <div key={device.id} className="bg-[#151515] p-4 rounded-xl border border-gray-800 flex flex-col group hover:border-indigo-500/30 transition-all">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-white font-bold text-sm">{device.name}</h4>
                <p className="text-[10px] text-gray-500 uppercase">{device.model}</p>
              </div>
              <span className={`w-2 h-2 rounded-full ${device.currentHashrate > 0 ? 'bg-green-500' : 'bg-gray-600'}`}></span>
            </div>
            <div className="mt-auto">
              <p className="text-lg font-mono font-bold text-gray-200">
                {formatHashrate(device.currentHashrate)}
              </p>
              <div className="w-full bg-gray-900 h-1 mt-2 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000" 
                  style={{ 
                    width: `${Math.min(100, (device.currentHashrate / device.nominalHashrate) * 100)}%`,
                    backgroundColor: getCoinColor()
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
        {state.devices.length === 0 && (
          <div className="col-span-full py-8 text-center bg-black/20 rounded-xl border border-dashed border-gray-800 text-gray-500 italic text-sm">
            Fleet empty. Add hardware to begin mining {state.activeCoin}.
          </div>
        )}
      </div>

      {/* Hashrate Graph */}
      <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Fleet Throughput</h3>
          <div className="flex gap-2 text-[10px] uppercase font-bold">
            <span className="px-2 py-1 rounded" style={{ backgroundColor: `${getCoinColor()}20`, color: getCoinColor() }}>
              {state.activeCoin} {state.isSolo ? 'SOLO' : 'POOL'}
            </span>
          </div>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorHash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getCoinColor()} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={getCoinColor()} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
              <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #374151', borderRadius: '8px' }}
                itemStyle={{ color: getCoinColor() }}
              />
              <Area 
                type="monotone" 
                dataKey="rate" 
                stroke={getCoinColor()} 
                fillOpacity={1} 
                fill="url(#colorHash)" 
                strokeWidth={2}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; subValue: string; color: string }> = ({ 
  label, value, subValue, color 
}) => (
  <div className="bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 truncate">{label}</p>
    <p className={`text-xl font-mono font-bold ${color}`}>{value}</p>
    <p className="text-[10px] text-gray-500 mt-1">{subValue}</p>
  </div>
);

export default Dashboard;
