
import React, { useState, useCallback } from 'react';
import { MiningState, MiningLog } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  miningState: MiningState;
  logs: MiningLog[];
}

const AiAssistant: React.FC<Props> = ({ miningState, logs }) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePerformance = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Act as a senior Bitcoin mining network engineer.
        Current Fleet Context:
        - Target Coin: ${miningState.activeCoin}
        - Mode: ${miningState.isSolo ? 'SOLO' : 'POOL'}
        - Target URL: ${miningState.poolUrls[miningState.activeCoin]}
        - Fleet Configuration: ${miningState.devices.map(d => `${d.model} (${d.currentHashrate.toFixed(0)} GH/s)`).join(', ')}
        - Total Hashrate: ${miningState.totalHashRate.toFixed(1)} GH/s

        Tasks:
        1. Evaluate if the configured Stratum URL (${miningState.poolUrls[miningState.activeCoin]}) is appropriate for this fleet's latency and hashrate.
        2. Specifically comment on whether the worker ID "${miningState.workerName}" follows standard naming conventions for the selected pool.
        3. For ${miningState.activeCoin}, suggest if any of the hardware units (NerdAxe vs Avalon Nano 3) should be pointed to a different diff-specific port.
        4. Provide a "Network Stability Score" based on the recent logs provided.
        
        Recent Logs: ${logs.slice(0, 5).map(l => l.message).join(' | ')}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            temperature: 0.7,
            topP: 0.95
        }
      });

      setAnalysis(response.text || "Unable to generate fleet analysis.");
    } catch (err) {
      setAnalysis("Error connecting to Gemini Mining Intel. Check network settings.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [miningState, logs]);

  return (
    <div className="bg-[#111] rounded-xl border border-gray-800 p-6 flex flex-col h-full shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="font-bold text-white uppercase text-xs tracking-widest">Stratum Auditor</h3>
      </div>

      <div className="flex-1 space-y-4">
        <p className="text-[11px] text-gray-400 leading-relaxed italic">
          "Proper port selection can reduce stale share rates by up to 15%."
        </p>

        <div className="bg-black/40 border border-gray-800 rounded-lg p-4 min-h-[220px]">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Auditing Network Path...</p>
            </div>
          ) : analysis ? (
            <div className="text-[11px] text-gray-300 whitespace-pre-line prose prose-invert font-sans leading-relaxed">
              {analysis}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <p className="text-xs text-gray-500 mb-6 max-w-[200px] mx-auto">Ready to audit your Stratum endpoints and port configuration.</p>
              <button 
                onClick={analyzePerformance}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-900/40 uppercase tracking-tighter"
              >
                Audit Network Ports
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-gray-600 uppercase">Stratum Protocol v1.4</span>
          <span className="text-[9px] text-indigo-400 font-bold flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse"></span>
            MONITORING
          </span>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
