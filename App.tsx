
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MiningState, MiningLog, HashStats, Device, CoinType } from './types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- Sub-Component: Metric Card ---
const MetricCard: React.FC<{ label: string; value: string; subValue: string; color: string }> = ({ 
  label, value, subValue, color 
}) => (
  <div className="bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-indigo-500/30 transition-all duration-300">
    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 truncate tracking-tighter">{label}</p>
    <p className={`text-xl font-mono font-bold ${color}`}>{value}</p>
    <p className="text-[10px] text-gray-500 mt-1 truncate">{subValue}</p>
  </div>
);

// --- Sub-Component: Dashboard ---
const Dashboard: React.FC<{ state: MiningState; history: HashStats[] }> = ({ state, history }) => {
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
          subValue={state.isSolo ? "Direct block discovery" : "Pool contribution"}
          color={state.isSolo ? "text-yellow-400" : "text-green-400"}
        />
        <MetricCard 
          label="Active Units" 
          value={state.devices.length.toString()} 
          subValue={`${state.devices.filter(d => d.status === 'online').length} online`}
          color="text-blue-400"
        />
        <MetricCard 
          label="Discovery Mode" 
          value={state.isSolo ? "Solo" : "PPLNS"} 
          subValue="Protocol active"
          color="text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.devices.map(device => (
          <div key={device.id} className="bg-[#151515] p-4 rounded-xl border border-gray-800 flex flex-col group hover:border-indigo-500/30 transition-all">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-white font-bold text-sm">{device.name}</h4>
                <p className="text-[10px] text-gray-500 uppercase font-mono">{device.model}</p>
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
          <div className="col-span-full py-12 text-center bg-black/20 rounded-xl border border-dashed border-gray-800 text-gray-500 italic text-sm">
            Fleet empty. Add hardware units from the sidebar to begin mining.
          </div>
        )}
      </div>

      <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Throughput Analytics</h3>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase" style={{ backgroundColor: `${getCoinColor()}20`, color: getCoinColor() }}>
            {state.activeCoin} {state.isSolo ? 'SOLO' : 'POOL'}
          </span>
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
              <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #374151', borderRadius: '8px' }} itemStyle={{ color: getCoinColor() }} />
              <Area type="monotone" dataKey="rate" stroke={getCoinColor()} fillOpacity={1} fill="url(#colorHash)" strokeWidth={2} animationDuration={500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Terminal ---
const MiningTerminal: React.FC<{ logs: MiningLog[] }> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [logs]);

  return (
    <div className="bg-black border border-gray-800 rounded-xl flex flex-col h-[350px] shadow-2xl">
      <div className="px-4 py-2 border-b border-gray-800 flex justify-between items-center bg-[#0d0d0d] rounded-t-xl">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
        <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest">Stratum V1 Engine Output</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
        {logs.length === 0 ? (
          <div className="text-gray-700 animate-pulse italic">Awaiting network connection...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-3 leading-relaxed">
              <span className="text-gray-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
              <span className={
                log.type === 'success' ? 'text-green-400' :
                log.type === 'error' ? 'text-red-400' :
                log.type === 'warning' ? 'text-yellow-400' :
                log.type === 'solo' ? 'text-yellow-300 font-bold' : 'text-blue-300'
              }>
                {log.type === 'solo' && '★ '}
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Main App Container ---
const App: React.FC = () => {
  const [miningState, setMiningState] = useState<MiningState>({
    isMining: false,
    isConnected: false,
    activeCoin: 'BTC',
    isSolo: false,
    payoutAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    totalHashRate: 0,
    acceptedShares: 0,
    blocksFound: 0,
    rejectedShares: 0,
    currentDifficulty: 1024,
    lastShareTime: null,
    poolUrls: {
      BTC: 'stratum+tcp://pool.braiins.com:3333',
      BCH: 'stratum+tcp://bch.slushpool.com:3333',
      DGB: 'stratum+tcp://dgb.multipool.us:3337'
    },
    workerName: 'fleet.01',
    devices: []
  });

  const [logs, setLogs] = useState<MiningLog[]>([]);
  const [statsHistory, setStatsHistory] = useState<HashStats[]>([]);
  const [showNetworkConfig, setShowNetworkConfig] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const statsIntervalRef = useRef<number | null>(null);

  const addLog = useCallback((message: string, type: MiningLog['type'] = 'info', deviceId?: string) => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      message,
      type,
      deviceId
    }, ...prev.slice(0, 49)]);
  }, []);

  const toggleMining = () => {
    if (miningState.isMining) {
      addLog("Halting fleet operations...", "warning");
      setMiningState(prev => ({ ...prev, isMining: false, totalHashRate: 0, devices: prev.devices.map(d => ({ ...d, currentHashrate: 0 })) }));
    } else {
      if (miningState.devices.length === 0) {
        addLog("Error: No hardware connected. Add devices to begin.", "error");
        return;
      }
      addLog(`Initializing ${miningState.activeCoin} fleet...`, "info");
      addLog(`Target: ${miningState.poolUrls[miningState.activeCoin]}`, "info");
      setMiningState(prev => ({ ...prev, isMining: true }));
    }
  };

  const addDevice = (model: Device['model']) => {
    const specs = { 'NerdAxe': 500, 'Supra 702': 700, 'Avalon Nano 3': 4000 };
    const newDevice: Device = {
      id: Math.random().toString(36).substr(2, 5),
      name: `${model} #${miningState.devices.filter(d => d.model === model).length + 1}`,
      model,
      nominalHashrate: specs[model],
      currentHashrate: 0,
      status: 'online',
      shares: 0
    };
    setMiningState(prev => ({ ...prev, devices: [...prev.devices, newDevice] }));
    addLog(`Hardware detected: ${newDevice.name}`, 'info');
  };

  const runAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Senior Bitcoin Mining Engineer Audit:
      Coin: ${miningState.activeCoin}
      Mode: ${miningState.isSolo ? 'Solo' : 'Pool'}
      URL: ${miningState.poolUrls[miningState.activeCoin]}
      Fleet: ${miningState.devices.map(d => `${d.model} (${d.nominalHashrate} GH/s)`).join(', ')}
      
      Tasks:
      1. Analyze fleet composition and power-to-hash ratio.
      2. Suggest one optimization for the Avalon Nano 3 units.
      3. Verify if the worker ID "${miningState.workerName}" is standardized.
      4. Comment on Solo mining viability with ${miningState.totalHashRate.toFixed(0)} GH/s.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiAnalysis(response.text || "Analysis failed.");
    } catch (e) {
      setAiAnalysis("Network error during AI audit.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  useEffect(() => {
    if (miningState.isMining && miningState.devices.length > 0) {
      statsIntervalRef.current = window.setInterval(() => {
        let totalRate = 0;
        const updatedDevices = miningState.devices.map(device => {
          const variance = 0.92 + Math.random() * 0.16; 
          const currentRate = device.nominalHashrate * variance;
          totalRate += currentRate;

          if (miningState.isSolo) {
            if (Math.random() > (miningState.activeCoin === 'DGB' ? 0.999 : 0.99999)) {
              setMiningState(prev => ({ ...prev, blocksFound: prev.blocksFound + 1, lastShareTime: Date.now() }));
              addLog(`!!! SOLO BLOCK DISCOVERED BY ${device.name} !!!`, "solo", device.id);
            }
          } else if (Math.random() > 0.95) {
            setMiningState(prev => ({ ...prev, acceptedShares: prev.acceptedShares + 1 }));
            addLog(`Share accepted on ${miningState.activeCoin} network`, "success", device.id);
          }
          return { ...device, currentHashrate: currentRate };
        });

        setMiningState(prev => ({ ...prev, totalHashRate: totalRate, devices: updatedDevices }));
        setStatsHistory(prev => [...prev.slice(-24), { time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }), rate: totalRate }]);
      }, 1000);
    } else if (statsIntervalRef.current) {
      window.clearInterval(statsIntervalRef.current);
    }
    return () => { if (statsIntervalRef.current) window.clearInterval(statsIntervalRef.current); };
  }, [miningState.isMining, miningState.devices.length, miningState.activeCoin, miningState.isSolo, addLog]);

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden text-gray-200">
      {/* SIDEBAR CONTAINER */}
      <aside className="w-80 bg-[#111] border-r border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl text-white">Σ</div>
          <div>
            <h2 className="font-bold text-white leading-tight">CryptoPulse</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Master Controller</p>
          </div>
        </div>

        <button onClick={toggleMining} className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all ${miningState.isMining ? 'bg-red-600 hover:bg-red-500 shadow-red-900/10' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/10'}`}>
          {miningState.isMining ? 'HALT FLEET' : 'START MINING'}
        </button>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Coin Selection</label>
            <button onClick={() => setShowNetworkConfig(!showNetworkConfig)} className="text-[10px] text-indigo-400 font-bold uppercase hover:text-indigo-300 transition-colors">
              {showNetworkConfig ? 'Close Ports' : 'Edit Ports'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['BTC', 'BCH', 'DGB'] as CoinType[]).map(c => (
              <button key={c} onClick={() => setMiningState(p => ({ ...p, activeCoin: c }))} className={`py-2 rounded border text-xs font-bold transition-all ${miningState.activeCoin === c ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-sm' : 'border-gray-800 bg-black/30 text-gray-500'}`}>
                {c}
              </button>
            ))}
          </div>

          {showNetworkConfig && (
            <div className="p-3 bg-black/40 border border-indigo-900/30 rounded-lg space-y-3">
              {(['BTC', 'BCH', 'DGB'] as CoinType[]).map(c => (
                <div key={`${c}-url`} className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-600 uppercase">{c} Stratum URL</span>
                  <input type="text" value={miningState.poolUrls[c]} onChange={(e) => setMiningState(p => ({ ...p, poolUrls: { ...p.poolUrls, [c]: e.target.value } }))} className="w-full bg-black/60 border border-gray-800 rounded px-2 py-1.5 text-[10px] text-indigo-300 font-mono outline-none" />
                </div>
              ))}
            </div>
          )}

          <div className="bg-black/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-tight">Solo Mode</label>
            <button onClick={() => setMiningState(p => ({ ...p, isSolo: !p.isSolo }))} className={`w-11 h-6 rounded-full relative transition-colors ${miningState.isSolo ? 'bg-yellow-600' : 'bg-gray-700'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${miningState.isSolo ? 'left-6' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 uppercase font-bold px-1">Add Hardware</label>
            <div className="grid grid-cols-1 gap-2">
              {(['NerdAxe', 'Supra 702', 'Avalon Nano 3'] as Device['model'][]).map(m => (
                <button key={m} onClick={() => addDevice(m)} className="text-left text-[11px] bg-gray-800/40 hover:bg-gray-800 px-3 py-2 rounded border border-gray-700 text-gray-300 flex justify-between items-center transition-colors">
                  <span>{m}</span>
                  <span className="text-indigo-400 font-bold">+</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1.5 block px-1">Payout Address</label>
              <input type="text" value={miningState.payoutAddress} onChange={(e) => setMiningState(p => ({ ...p, payoutAddress: e.target.value }))} className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-[10px] text-yellow-500 font-mono focus:border-yellow-500/30 outline-none" placeholder="Payout Addr" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1.5 block px-1">Worker ID</label>
              <input type="text" value={miningState.workerName} onChange={(e) => setMiningState(p => ({ ...p, workerName: e.target.value }))} className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-[10px] text-blue-400 font-mono focus:border-blue-500/30 outline-none" placeholder="fleet.01" />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-800/50">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-600 uppercase">
            <span>Core v2.6.4</span>
            <span className="text-indigo-500 font-bold">Stable</span>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="flex-1 flex flex-col overflow-y-auto p-8 space-y-8 bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]">
        <header className="flex justify-between items-center pb-6 border-b border-gray-800/50">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-2xl ${miningState.activeCoin === 'BTC' ? 'bg-orange-500/20 text-orange-500 shadow-orange-900/10' : miningState.activeCoin === 'BCH' ? 'bg-green-500/20 text-green-500 shadow-green-900/10' : 'bg-blue-500/20 text-blue-500 shadow-blue-900/10'}`}>
              {miningState.activeCoin.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                Fleet Management
                {miningState.isSolo && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest">Solo Ops</span>}
              </h1>
              <p className="text-gray-500 text-sm font-medium">Real-time Stratum telemetry for {miningState.activeCoin} network.</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Protocol</p>
              <p className="text-sm font-mono text-indigo-400 font-bold">V1/TCP over WS</p>
            </div>
            <div className="w-px h-10 bg-gray-800"></div>
            <div className="text-right">
              <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Active Units</p>
              <p className="text-2xl font-mono text-white font-bold">{miningState.devices.length}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <Dashboard state={miningState} history={statsHistory} />
            <MiningTerminal logs={logs} />
          </div>
          
          {/* AI CONTAINER PANEL */}
          <div className="xl:col-span-1 space-y-8">
            <div className="bg-[#111] rounded-2xl border border-gray-800 p-8 flex flex-col h-full shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-700">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-500">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white uppercase text-xs tracking-[0.2em]">Fleet Intelligence</h3>
              </div>

              <div className="flex-1 space-y-6">
                <p className="text-[11px] text-gray-500 leading-relaxed italic border-l-2 border-indigo-500/50 pl-4">
                  "Mining efficiency is directly proportional to localized difficulty tuning."
                </p>

                <div className="bg-black/60 border border-gray-800 rounded-xl p-5 min-h-[300px] flex flex-col">
                  {isAiAnalyzing ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest animate-pulse">Running Hardware Audit...</p>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="text-[11px] text-gray-400 whitespace-pre-line leading-relaxed font-sans">
                      {aiAnalysis}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-10 px-4">
                      <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800">
                        <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600 mb-6 leading-relaxed">Automated telemetry audit ready for {miningState.activeCoin} fleet.</p>
                      <button onClick={runAiAnalysis} className="px-8 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-[10px] font-bold transition-all border border-indigo-500/30 uppercase tracking-widest">
                        Run Audit
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between">
                <span className="text-[9px] text-gray-600 uppercase font-mono">Engine Version 4.1</span>
                <span className="text-[9px] text-indigo-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  READY
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
