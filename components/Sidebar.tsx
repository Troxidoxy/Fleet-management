
import React, { useState } from 'react';
import { MiningState, Device, CoinType } from '../types';

interface Props {
  state: MiningState;
  onToggle: () => void;
  onAddDevice: (model: Device['model']) => void;
  onRemoveDevice: (id: string) => void;
  onUpdateState: (update: Partial<MiningState>) => void;
}

const Sidebar: React.FC<Props> = ({ state, onToggle, onAddDevice, onRemoveDevice, onUpdateState }) => {
  const coins: CoinType[] = ['BTC', 'BCH', 'DGB'];
  const [showNetworkConfig, setShowNetworkConfig] = useState(false);

  const updateUrl = (coin: CoinType, url: string) => {
    onUpdateState({
      poolUrls: {
        ...state.poolUrls,
        [coin]: url
      }
    });
  };

  return (
    <div className="w-80 bg-[#111] border-r border-gray-800 p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl text-white">Σ</div>
        <div>
          <h2 className="font-bold text-white">CryptoPulse</h2>
          <p className="text-[10px] text-gray-500 tracking-widest uppercase">Fleet Engine</p>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={onToggle}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all duration-200 ${
            state.isMining 
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
          }`}
        >
          {state.isMining ? 'HALT FLEET' : 'START MINING'}
        </button>

        {/* Coin Selection & URL Toggle */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-500 uppercase font-bold">Network Assets</label>
            <button 
              onClick={() => setShowNetworkConfig(!showNetworkConfig)}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors uppercase font-bold flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {showNetworkConfig ? 'Hide Config' : 'Configure Ports'}
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {coins.map(coin => (
              <button
                key={coin}
                onClick={() => onUpdateState({ activeCoin: coin })}
                className={`py-2 rounded border text-xs font-bold transition-all ${
                  state.activeCoin === coin 
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.2)]' 
                    : 'border-gray-800 bg-black/30 text-gray-500 hover:border-gray-700'
                }`}
              >
                {coin}
              </button>
            ))}
          </div>

          {showNetworkConfig && (
            <div className="p-3 bg-black/40 border border-indigo-900/30 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {coins.map(coin => (
                <div key={`${coin}-config`} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{coin} Stratum URL</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${state.activeCoin === coin ? 'bg-indigo-500' : 'bg-gray-800'}`}></span>
                  </div>
                  <input 
                    type="text"
                    value={state.poolUrls[coin]}
                    onChange={(e) => updateUrl(coin, e.target.value)}
                    className="w-full bg-black/60 border border-gray-800 rounded px-2 py-1.5 text-[10px] text-indigo-300 font-mono focus:border-indigo-500/50 outline-none transition-colors"
                    placeholder={`stratum+tcp://${coin.toLowerCase()}.pool:port`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Solo Mining Toggle */}
        <div className="bg-black/50 border border-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400 uppercase font-bold">Solo Mode</label>
            <button 
              onClick={() => onUpdateState({ isSolo: !state.isSolo })}
              className={`w-12 h-6 rounded-full relative transition-colors ${state.isSolo ? 'bg-yellow-600' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${state.isSolo ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          <p className="text-[10px] text-gray-500 italic">Enable for direct block discovery rewards.</p>
        </div>

        {/* Hardware Fleet Management */}
        <div className="p-4 bg-black/50 border border-gray-800 rounded-xl space-y-3">
          <label className="text-xs text-gray-500 uppercase font-bold block">Deployment</label>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={() => onAddDevice('NerdAxe')} className="text-left text-[11px] bg-gray-800/40 hover:bg-gray-800 px-3 py-2 rounded border border-gray-700 text-gray-300 flex justify-between items-center transition-colors">
              <span>NerdAxe <span className="opacity-40">(500 GH)</span></span>
              <span className="text-indigo-400 font-bold">+</span>
            </button>
            <button onClick={() => onAddDevice('Supra 702')} className="text-left text-[11px] bg-gray-800/40 hover:bg-gray-800 px-3 py-2 rounded border border-gray-700 text-gray-300 flex justify-between items-center transition-colors">
              <span>Supra 702 <span className="opacity-40">(700 GH)</span></span>
              <span className="text-indigo-400 font-bold">+</span>
            </button>
            <button onClick={() => onAddDevice('Avalon Nano 3')} className="text-left text-[11px] bg-gray-800/40 hover:bg-gray-800 px-3 py-2 rounded border border-gray-700 text-gray-300 flex justify-between items-center transition-colors">
              <span>Avalon Nano 3 <span className="opacity-40">(4 TH)</span></span>
              <span className="text-indigo-400 font-bold">+</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Payout Address</label>
            <input 
              type="text" 
              value={state.payoutAddress}
              onChange={(e) => onUpdateState({ payoutAddress: e.target.value })}
              className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-[10px] text-yellow-500 font-mono focus:border-yellow-500/50 focus:outline-none transition-colors"
              placeholder="Enter Payout Address"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Worker ID</label>
            <input 
              type="text" 
              value={state.workerName}
              onChange={(e) => onUpdateState({ workerName: e.target.value })}
              className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-[10px] text-blue-400 font-mono focus:border-blue-500/50 focus:outline-none transition-colors"
              placeholder="worker.01"
            />
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        {state.devices.length > 0 && (
          <div className="max-h-32 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-800">
             <label className="text-[10px] text-gray-600 uppercase font-bold sticky top-0 bg-[#111] py-1">Active Hardware</label>
             {state.devices.map(d => (
               <div key={d.id} className="flex items-center justify-between text-[11px] bg-black/30 p-2 rounded border border-gray-800">
                 <span className="text-gray-400 truncate w-32">{d.name}</span>
                 <button onClick={() => onRemoveDevice(d.id)} className="text-red-900 hover:text-red-500 transition-colors">
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
             ))}
          </div>
        )}
        
        <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500 uppercase">VarDiff Engine:</span>
            <span className="text-indigo-400 font-bold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between text-[10px] mt-1">
            <span className="text-gray-500 uppercase">Target:</span>
            <span className="text-green-400 font-bold truncate max-w-[120px]">{state.poolUrls[state.activeCoin].replace('stratum+tcp://', '')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
