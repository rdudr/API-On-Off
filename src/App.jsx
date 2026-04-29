import React, { useState, useEffect } from 'react';
import { Search, User, Menu, X, Play, ShieldCheck, ShieldAlert, Save, Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { testApiKey, PROVIDERS } from './utils/apiTester';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedKeys, setSavedKeys] = useState([]);
  
  // Form State
  const [provider, setProvider] = useState('OpenRouter');
  const [customUrl, setCustomUrl] = useState('');
  const [model, setModel] = useState('google/gemma-7b-it');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  // Test State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTestingAll, setIsTestingAll] = useState(false);

  // Load saved keys on mount
  useEffect(() => {
    const keys = localStorage.getItem('apiOnOff_savedKeys');
    if (keys) setSavedKeys(JSON.parse(keys));
  }, []);

  const saveToLocal = (keys) => {
    localStorage.setItem('apiOnOff_savedKeys', JSON.stringify(keys));
    setSavedKeys(keys);
  };

  const handleTest = async (e) => {
    e?.preventDefault();
    if (!apiKey) return;
    
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testApiKey(provider, customUrl, model, apiKey);
      setTestResult(result);
    } catch (err) {
      setTestResult({ isWorking: false, errorMsg: err.message, graphData: [], strength: 0, avgLatency: 0 });
    }
    setIsTesting(false);
  };

  const handleSaveWorkingKey = () => {
    if (!testResult?.isWorking) return;
    
    const newKey = {
      id: Date.now().toString(),
      provider,
      model,
      key: apiKey,
      status: 'working',
      lastTested: new Date().toISOString(),
      latency: testResult.avgLatency,
      strength: testResult.strength
    };

    const exists = savedKeys.some(k => k.key === apiKey);
    if (!exists) {
      saveToLocal([...savedKeys, newKey]);
    }
  };

  const handleTestAllSaved = async () => {
    setIsTestingAll(true);
    const updatedKeys = [...savedKeys];
    
    for (let i = 0; i < updatedKeys.length; i++) {
      const k = updatedKeys[i];
      try {
        const res = await testApiKey(k.provider, '', k.model, k.key);
        k.status = res.isWorking ? 'working' : 'failed';
        k.latency = res.avgLatency;
        k.strength = res.strength;
        k.lastTested = new Date().toISOString();
      } catch (e) {
        k.status = 'failed';
      }
      setSavedKeys([...updatedKeys]); // update UI progressively
    }
    
    saveToLocal(updatedKeys);
    setIsTestingAll(false);
  };

  const deleteKey = (id) => {
    saveToLocal(savedKeys.filter(k => k.id !== id));
  };

  const navLinks = [
    { name: "Dashboard", delay: "100ms" },
    { name: "Providers", delay: "150ms" },
    { name: "Analytics", delay: "200ms" },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden text-white bg-black flex flex-col font-sans">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
      />

      {/* Bottom Blur Overlay */}
      <div
        className="fixed inset-0 pointer-events-none backdrop-blur-xl"
        style={{
          zIndex: 1,
          maskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 45%)'
        }}
      />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6">
        <div className="h-8 md:h-10 flex items-center text-xl md:text-2xl font-bold tracking-wider animate-blur-fade-up" style={{ animationDelay: '0ms' }}>
          API ON OFF
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.name} href="#" className="text-sm font-medium text-white hover:text-gray-300 transition-colors animate-blur-fade-up" style={{ animationDelay: link.delay }}>
              {link.name}
            </a>
          ))}
          
          <button 
            onClick={handleTestAllSaved}
            disabled={isTestingAll || savedKeys.length === 0}
            className="text-sm font-medium flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors animate-blur-fade-up disabled:opacity-50"
            style={{ animationDelay: '250ms' }}
          >
            <RefreshCw size={16} className={isTestingAll ? "animate-spin" : ""} />
            Test All Saved
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-3">
            <button className="liquid-glass rounded-full w-10 h-10 flex items-center justify-center animate-blur-fade-up transition-colors hover:bg-white/10" style={{ animationDelay: '350ms' }}>
              <User size={18} />
            </button>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden liquid-glass w-10 h-10 rounded-full flex items-center justify-center animate-blur-fade-up" style={{ animationDelay: '350ms' }}>
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Hero Content / Dashboard */}
      <main className="relative z-10 flex-1 flex flex-col justify-end px-4 sm:px-6 md:px-12 pb-8 md:pb-12 h-full">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 h-full max-h-[80vh]">
          
          {/* Left Side: Tester Console & Graph */}
          <div className="flex-1 w-full max-w-3xl flex flex-col justify-end gap-6 h-full">
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal animate-blur-fade-up shrink-0" style={{ animationDelay: '200ms', letterSpacing: '-0.04em' }}>
              Test & Verify.
            </h1>

            {/* Main Console Layout */}
            <div className="flex flex-col md:flex-row gap-6 h-[400px]">
              {/* Form Input Area */}
              <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-4 animate-blur-fade-up w-full md:w-1/2 overflow-y-auto" style={{ animationDelay: '300ms' }}>
                <h2 className="text-lg font-medium flex items-center gap-2 mb-2"><Activity size={18}/> New Test</h2>
                
                <form onSubmit={handleTest} className="flex flex-col gap-4 flex-1 justify-center">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Provider</label>
                    <select 
                      value={provider} 
                      onChange={(e) => {
                        const p = e.target.value;
                        setProvider(p);
                        setIsCustomModel(false);
                        if (PROVIDERS[p]?.models?.length > 0) {
                          setModel(PROVIDERS[p].models[0]);
                        } else {
                          setModel('');
                        }
                      }}
                      className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                    >
                      {Object.keys(PROVIDERS).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  {PROVIDERS[provider]?.requiresCustomUrl && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400">Base URL</label>
                      <input 
                        type="url" required
                        value={customUrl} onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://api.custom.com/v1"
                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Model</label>
                    <select 
                      value={isCustomModel ? "custom" : model} 
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setIsCustomModel(true);
                          setModel('');
                        } else {
                          setIsCustomModel(false);
                          setModel(e.target.value);
                        }
                      }}
                      className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                    >
                      {PROVIDERS[provider]?.models?.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="custom">Custom Model...</option>
                    </select>
                    
                    {isCustomModel && (
                      <input 
                        type="text" required
                        value={model} onChange={(e) => setModel(e.target.value)}
                        placeholder="Type custom model name..."
                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50 mt-1"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">API Key</label>
                    <input 
                      type="password" required
                      value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <button 
                    type="submit" disabled={isTesting || !apiKey}
                    className="bg-white text-black rounded-lg font-medium py-2.5 mt-2 flex justify-center items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="animate-spin" size={18}/> : <Play size={18} className="fill-black" />}
                    Run Test
                  </button>
                </form>
              </div>

              {/* Results & Graph Area */}
              <div className="liquid-glass rounded-2xl p-6 flex flex-col gap-4 animate-blur-fade-up w-full md:w-1/2" style={{ animationDelay: '400ms' }}>
                <h2 className="text-lg font-medium flex items-center gap-2"><ShieldCheck size={18}/> Test Results</h2>
                
                {testResult ? (
                  <div className="flex flex-col h-full gap-4">
                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        {testResult.isWorking ? <CheckCircle className="text-green-400" size={20}/> : <XCircle className="text-red-400" size={20}/>}
                        <span className="font-medium text-sm">{testResult.isWorking ? 'API Key is Active' : 'Test Failed'}</span>
                      </div>
                      <div className="text-xs text-gray-400 text-right">
                        Strength<br/>
                        <span className="text-white font-bold text-lg">{testResult.strength}/100</span>
                      </div>
                    </div>

                    {!testResult.isWorking && (
                      <div className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg break-words">
                        {testResult.errorMsg}
                      </div>
                    )}

                    {testResult.isWorking && (
                      <>
                        <div className="flex-1 min-h-[120px] -ml-6 -mr-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={testResult.graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorAnswer" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorPush" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="ping" hide />
                              <YAxis hide />
                              <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                              <Area type="monotone" dataKey="answerTime" stroke="#06b6d4" fillOpacity={1} fill="url(#colorAnswer)" name="Answer Time (ms)" />
                              <Area type="monotone" dataKey="pushTime" stroke="#a855f7" fillOpacity={1} fill="url(#colorPush)" name="Push Time (ms)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <button onClick={handleSaveWorkingKey} className="liquid-glass rounded-lg font-medium py-2 flex justify-center items-center gap-2 hover:bg-white/10 transition-colors mt-auto">
                          <Save size={16} /> Save Key
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50 text-sm h-full text-center px-4">
                    <Activity size={32} className="mb-2 opacity-50" />
                    Enter your key and run a test to see depth and latency metrics.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side / Saved Keys */}
          <div className="w-full lg:w-80 liquid-glass rounded-2xl p-6 flex flex-col h-[400px] animate-blur-fade-up self-end" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-medium flex items-center gap-2"><Save size={18}/> Saved Keys</h2>
              <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{savedKeys.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar">
              {savedKeys.length === 0 ? (
                <p className="text-sm text-gray-500 text-center mt-10">No working keys saved yet.</p>
              ) : (
                savedKeys.map(k => (
                  <div key={k.id} className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col gap-2 relative group hover:border-white/20 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{k.provider}</span>
                        <span className="text-xs text-gray-400 font-mono mt-0.5">{k.key.substring(0, 8)}...</span>
                      </div>
                      {k.status === 'working' ? <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" title="Working" /> : <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" title="Failed" />}
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 border-t border-white/5 pt-2 mt-1">
                      <span>{k.latency || 0}ms avg</span>
                      <button onClick={() => deleteKey(k.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </main>

      {/* Global CSS adjustments for scrollbar inside the component just in case */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
      `}} />
    </div>
  );
}
