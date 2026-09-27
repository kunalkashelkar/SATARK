import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Info, 
  Server, 
  FileSearch,
  LayoutDashboard,
  AlertCircle
} from 'lucide-react';

import { Navigate, useNavigate } from 'react-router-dom';
import { useSupervisory } from '@/context/SupervisoryContext';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, loginWithCredentials } = useSupervisory();
  const [role, setRole] = useState<'supervisor' | 'examiner'>('supervisor');
  const [userId, setUserId] = useState('lead_supervisor');
  const [password, setPassword] = useState('Supervisor@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // If already authenticated, redirect to overview
  if (isAuthenticated) {
    return <Navigate to="/overview" replace />;
  }

  const handleRoleChange = (selectedRole: 'supervisor' | 'examiner') => {
    setRole(selectedRole);
    setErrorMessage(null);
    if (selectedRole === 'supervisor') {
      setUserId('lead_supervisor');
      setPassword('Supervisor@2026!');
    } else {
      setUserId('lead_examiner');
      setPassword('Examiner@2026!');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await loginWithCredentials(userId, password);
      navigate('/overview');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090D] flex flex-col justify-between selection:bg-[#58A6FF]/20 selection:text-[#58A6FF] text-[#E6EDF3] font-sans">
      {/* Top Security Classification Bar */}
      <header className="w-full border-b border-[#1E2635] bg-[#0A0D13]/90 backdrop-blur px-6 py-2.5 flex items-center justify-between text-xs tracking-wider z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#161B22] border border-[#30363D] text-[#8B949E] text-[11px] font-mono">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3FB950] animate-pulse"></span>
            AIR-GAPPED NODE
          </div>
          <span className="text-[#6E7681]">|</span>
          <span className="text-[#8B949E] uppercase font-medium text-[11px] tracking-widest hidden sm:inline">
            Restricted Critical Infrastructure Environment
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-[#8B949E]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#58A6FF]" />
            TLS 1.3 / FIPS-140-2
          </span>
          <span className="text-[#30363D]">•</span>
          <span className="text-[#6E7681]">NODE-DEL-04</span>
        </div>
      </header>

      {/* Main Login Workspace Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative">
        <div className="w-full max-w-[460px] mx-auto flex flex-col items-center">
          {/* Institutional Identity Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-[6px] bg-[#111620] border border-[#232B3B] flex items-center justify-center shadow-inner">
                <Shield className="w-5 h-5 text-[#58A6FF]" />
              </div>
            </div>
            
            <p className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-[0.2em] mb-0.5">
              Government of India
            </p>
            <p className="text-[11px] font-medium text-[#7D8590] uppercase tracking-[0.14em]">
              National Critical Information Infrastructure Protection Centre
            </p>
            
            <div className="mt-3 inline-flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#F0F6FC] font-mono">SAT-SA</h1>
              <span className="text-xs px-2 py-0.5 rounded-[4px] bg-[#161B22] border border-[#30363D] text-[#8B949E] font-mono font-medium">
                v1.0.0
              </span>
            </div>
            <p className="text-[12px] text-[#8B949E] mt-0.5">
              Supervisory Analytics Tool for SOC Assessment
            </p>
          </div>

          {/* Secure Internal Access Card */}
          <div className="w-full bg-[#0E131C] border border-[#232B3B] rounded-[8px] p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1D2533] pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#58A6FF]"></span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C9D1D9]">
                  Secure Internal Access
                </span>
              </div>
              <span className="text-[11px] text-[#7D8590] font-mono">ENCLAVE-AUTH</span>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSignIn}>
              {/* Role Routing Selector */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium uppercase tracking-wider text-[#8B949E] flex items-center justify-between">
                  <span>Target Workspace</span>
                  <span className="text-[10px] text-[#58A6FF] font-mono font-normal">Select Workspace</span>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-[#090C12] p-1 rounded-[6px] border border-[#1E2635]">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('supervisor')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-[4px] text-[12px] font-medium transition-all cursor-pointer ${
                      role === 'supervisor'
                        ? 'bg-[#171E2B] text-[#58A6FF] border border-[#303E54] shadow-sm font-semibold'
                        : 'text-[#8B949E] hover:text-[#C9D1D9]'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Supervisor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('examiner')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-[4px] text-[12px] font-medium transition-all cursor-pointer ${
                      role === 'examiner'
                        ? 'bg-[#171E2B] text-[#58A6FF] border border-[#303E54] shadow-sm font-semibold'
                        : 'text-[#8B949E] hover:text-[#C9D1D9]'
                    }`}
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>Examiner</span>
                  </button>
                </div>
                <div className="text-[11px] text-[#6E7681] pt-0.5 flex items-center gap-1.5 font-mono">
                  <Info className="w-3 h-3 text-[#58A6FF] shrink-0" />
                  <span className="truncate">
                    {role === 'supervisor'
                      ? 'Supervisor: Cross-CSE Overview, Assessments & Sampling'
                      : 'Examiner: Review Queue, Expected vs Observed & Adjudication'}
                  </span>
                </div>
              </div>

              {/* User ID Field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-[#8B949E]">
                  User ID / Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    className="w-full h-9 rounded-[6px] border border-[#232B3B] bg-[#070A0F] px-3 text-xs text-[#F0F6FC] placeholder:text-[#484F58] focus:border-[#58A6FF] focus:outline-none focus:ring-1 focus:ring-[#58A6FF] font-mono transition-colors"
                  />
                  <div className="absolute right-2.5 top-2.5 text-[#484F58] font-mono text-[10px]">AUTH-ID</div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#8B949E]">
                    Password
                  </label>
                  <span className="text-[10px] text-[#6E7681] font-mono">HW KEY ENABLED</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-9 rounded-[6px] border border-[#232B3B] bg-[#070A0F] px-3 pr-9 text-xs text-[#F0F6FC] placeholder:text-[#484F58] focus:border-[#58A6FF] focus:outline-none focus:ring-1 focus:ring-[#58A6FF] font-mono transition-colors tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-[#6E7681] hover:text-[#C9D1D9] transition-colors focus:outline-none cursor-pointer"
                    title="Toggle visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* MFA Indicator */}
              <div className="py-1 px-2.5 rounded-[5px] bg-[#090D14] border border-[#1B2230] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950]"></span>
                  <span className="text-[#8B949E]">MFA Token Verification</span>
                </div>
                <span className="text-[#3FB950] font-mono font-medium text-[10px] tracking-wide">
                  ● SYNCED (STEP 2 READY)
                </span>
              </div>

              {/* Sign In CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-9 rounded-[6px] bg-[#238636] hover:bg-[#2EA043] disabled:opacity-50 text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors border border-[rgba(240,246,252,0.1)] shadow-sm group cursor-pointer"
                >
                  <span>
                    {isSubmitting
                      ? 'Authenticating Enclave...'
                      : role === 'supervisor' ? 'Sign In as Supervisor (Overview)' : 'Sign In as Examiner (Overview)'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </form>

            {/* System Audit & Status Telemetry */}
            <div className="mt-5 pt-4 border-t border-[#1D2533] space-y-3">
              <div className="flex items-center justify-center gap-4 text-[10px] font-mono tracking-wider">
                <span className="flex items-center gap-1.5 text-[#7EE787]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#238636]"></span>
                  INTERNAL NETWORK
                </span>
                <span className="text-[#30363D]">|</span>
                <span className="flex items-center gap-1.5 text-[#58A6FF]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F6FEB]"></span>
                  AUDIT ENABLED
                </span>
                <span className="text-[#30363D]">|</span>
                <span className="text-[#8B949E]">
                  SEC-ZONE 4
                </span>
              </div>

              {/* Statutory Warning Notice */}
              <div className="rounded-[5px] bg-[#0A0D13] p-2.5 border border-[#1A2230] text-center">
                <p className="text-[10px] font-semibold text-[#8B949E] tracking-wider uppercase">
                  Authorized Access Only
                </p>
                <p className="text-[10px] text-[#545D68] mt-0.5 leading-relaxed">
                  Security-relevant activities, supervisory actions, and examination records are logged and audited in accordance with NCIIPC Information Security Guidelines.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#484F58] pt-1">
                <span>ENCLAVE: NCIIPC-70B</span>
                <span>BUILD: 2026.09.27-PROD</span>
              </div>
            </div>
          </div>

          {/* Quick Nav Guidance Note */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-[#6E7681]">
              Switching roles routes between <span className="text-[#8B949E]">Supervisory Overview</span> and <span className="text-[#8B949E]">Examiner Workspace</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#1E2635] bg-[#0A0D13] px-6 py-2.5 flex items-center justify-between text-[11px] text-[#8B949E] font-mono">
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-[#58A6FF]" />
          <span>NCIIPC SAT-SA PROTOCOL ENGINE</span>
        </div>
        <div>
          <span>UNCLASSIFIED // FOUO</span>
        </div>
      </footer>
    </div>
  );
};
