import React, { useState } from 'react';
import { useSupervisory } from '@/context/SupervisoryContext';
import { AuditTrailPage } from '@/pages/Audit/AuditTrailPage';
import { AdministrationPage } from '@/pages/Administration/AdministrationPage';
import {
  PageContainer,
  PageHeader,
  Card,
  Tabs,
  DataTable,
  Column,
  StatusBadge
} from '@/components/common';
import { AuditTrailItem } from '@/data/mock/audit';

type GovernanceTab = 'audit' | 'admin' | 'controls' | 'versions';

interface ControlStandard {
  id: string;
  name: string;
  version: string;
  sector: string;
  status: string;
}

export const GovernanceHubPage: React.FC<{ initialTab?: GovernanceTab }> = ({ initialTab = 'audit' }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const { auditTrail } = useSupervisory();

  const controlLibrary: ControlStandard[] = [
    { id: 'CTRL-01', name: 'Boundary Telemetry Ingestion', version: 'v3.2', sector: 'All Sectors', status: 'ACTIVE' },
    { id: 'CTRL-04', name: 'Privileged Access & Hardware MFA', version: 'v2.4', sector: 'Banking / BFSI', status: 'ACTIVE' },
    { id: 'CTRL-07', name: 'Mandatory Tier-2 Regulatory Escalation', version: 'v3.2', sector: 'Energy / Power', status: 'ACTIVE' },
    { id: 'CTRL-09', name: 'Patch Verification on Relay Firewalls', version: 'v3.0', sector: 'Energy / Power', status: 'ACTIVE' },
    { id: 'CTRL-11', name: 'Continuous Telemetry Monitoring', version: 'v3.2', sector: 'Transport / Rail', status: 'ACTIVE' },
    { id: 'CTRL-12', name: 'Security Audit Log Cryptographic Integrity', version: 'v3.1', sector: 'All Sectors', status: 'ACTIVE' },
    { id: 'CTRL-15', name: 'Endpoint Detection & Containment Latency', version: 'v1.9', sector: 'Telecom', status: 'ACTIVE' }
  ];

  const tabs = [
    { 
      id: 'audit', 
      label: '1. Audit Ledger', 
      count: auditTrail.length, 
      icon: <span className="material-symbols-outlined text-[15px]">history_edu</span> 
    },
    { 
      id: 'admin', 
      label: '2. Administration', 
      icon: <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span> 
    },
    { 
      id: 'controls', 
      label: '3. Control Library', 
      count: controlLibrary.length,
      icon: <span className="material-symbols-outlined text-[15px]">library_books</span> 
    },
    { 
      id: 'versions', 
      label: '4. System Versions', 
      icon: <span className="material-symbols-outlined text-[15px]">info</span> 
    },
  ];

  const auditColumns: Column<AuditTrailItem>[] = [
    {
      header: 'Timestamp',
      width: '130px',
      cell: (ev) => <span className="font-mono text-[11px] text-[#8c90a0]">{ev.timestamp}</span>,
    },
    {
      header: 'User / Actor',
      width: '180px',
      cell: (ev) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[12px] text-[#dfe2eb]">{ev.actor}</span>
          <span className="text-[10px] text-[#8c90a0] font-mono">{ev.actorRole}</span>
        </div>
      ),
    },
    {
      header: 'Action',
      width: '170px',
      cell: (ev) => (
        <span className="font-medium text-[12px] text-[#afc6ff]">{ev.action}</span>
      ),
    },
    {
      header: 'Target Object',
      width: '140px',
      cell: (ev) => (
        <span className="font-mono text-[12px] text-[#dfe2eb]">{ev.targetObject}</span>
      ),
    },
    {
      header: 'Result',
      width: '110px',
      cell: (ev) => <StatusBadge status={ev.result} />,
    },
    {
      header: 'Control Ver.',
      width: '110px',
      cell: (ev) => (
        <span className="font-mono text-[11px] text-[#8c90a0]">{ev.controlVersion || 'CTRL-v3.2'}</span>
      ),
    },
    {
      header: 'Rule Ver.',
      width: '100px',
      cell: (ev) => (
        <span className="font-mono text-[11px] text-[#8c90a0]">{ev.ruleVersion || 'R-2.4'}</span>
      ),
    },
    {
      header: 'Evidence Ref',
      width: '120px',
      cell: (ev) => (
        <span className="font-mono text-[11px] text-[#c2c6d6]">{ev.evidenceRef || 'EVD-LINK'}</span>
      ),
    },
  ];

  const controlColumns: Column<ControlStandard>[] = [
    {
      header: 'Control ID',
      width: '120px',
      cell: (ctrl) => (
        <span className="font-mono font-bold text-[12px] text-[#afc6ff]">{ctrl.id}</span>
      ),
    },
    {
      header: 'Control Name',
      cell: (ctrl) => (
        <span className="font-semibold text-[13px] text-[#dfe2eb]">{ctrl.name}</span>
      ),
    },
    {
      header: 'Version',
      width: '110px',
      cell: (ctrl) => (
        <span className="font-mono text-[11px] text-[#8c90a0]">{ctrl.version}</span>
      ),
    },
    {
      header: 'Applicable Sector',
      width: '160px',
      cell: (ctrl) => (
        <span className="text-[12px] text-[#c2c6d6] font-mono">{ctrl.sector}</span>
      ),
    },
    {
      header: 'Status',
      width: '100px',
      cell: (ctrl) => <StatusBadge status={ctrl.status} />,
    },
  ];

  return (
    <PageContainer>
      {/* 1. STANDARD PAGE HEADER */}
      <PageHeader
        title="Supervisory Governance &amp; Administration"
        description="Immutable audit logging, enclave administration, statutory control libraries, and system manifests."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#7bdb80] bg-[#7bdb80]/10 px-2.5 py-1 rounded-md border border-[#7bdb80]/20">
              FIPS-140-2 LEVEL 3 SIGNED
            </span>
          </div>
        }
      />

      {/* 2. TABS */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
      />

      {/* TAB 1: AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-3 min-w-0">
          <div className="p-3 rounded-lg bg-[#181c22] border border-[#262a31] flex items-center justify-between text-[12px]">
            <span className="text-[#8c90a0] font-mono">Immutable Statutory Adjudication Ledger:</span>
            <span className="text-[#7bdb80] font-mono text-[11px] font-semibold">ALL CHECKSUMS VERIFIED</span>
          </div>
          <DataTable<AuditTrailItem>
            columns={auditColumns}
            data={auditTrail}
            keyExtractor={(ev) => ev.id}
          />
        </div>
      )}

      {/* TAB 2: ADMIN */}
      {activeTab === 'admin' && <AdministrationPage />}

      {/* TAB 3: CONTROLS */}
      {activeTab === 'controls' && (
        <div className="space-y-3 min-w-0">
          <div className="p-3 rounded-lg bg-[#181c22] border border-[#262a31] text-[12px] font-mono text-[#8c90a0]">
            Statutory Control Standard Catalog (NCIIPC CSF v3.2):
          </div>
          <DataTable<ControlStandard>
            columns={controlColumns}
            data={controlLibrary}
            keyExtractor={(ctrl) => ctrl.id}
          />
        </div>
      )}

      {/* TAB 4: VERSIONS */}
      {activeTab === 'versions' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#262a31]/60">
            <h3 className="text-[14px] font-semibold text-[#dfe2eb] font-mono uppercase">
              System Version Manifest
            </h3>
            <span className="text-[11px] font-mono text-[#7bdb80]">HARDENED BUILD</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-[12px]">
            <div className="p-3.5 rounded-lg bg-[#14181f] border border-[#262a31] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8c90a0]">Framework Version:</span>
                <span className="text-[#afc6ff] font-bold">NCIIPC-CSF-v3.2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c90a0]">Rule Engine:</span>
                <span className="text-[#7bdb80] font-bold">R-2.4-STABLE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c90a0]">Analytics Engine:</span>
                <span className="text-[#dfe2eb] font-bold">SAT-AN-1.8.4</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#14181f] border border-[#262a31] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8c90a0]">Deployment Mode:</span>
                <span className="text-[#7bdb80] font-bold">AIR-GAPPED FIPS-140-2 L3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c90a0]">PKI &amp; TLS:</span>
                <span className="text-[#dfe2eb] font-bold">TLS 1.3 / Hardware HSM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c90a0]">Audit Engine:</span>
                <span className="text-[#7bdb80] font-bold">IMMUTABLE_SYNCED</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
};
