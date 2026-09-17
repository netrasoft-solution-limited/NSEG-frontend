import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Marketplace } from './pages/Marketplace';
import { ConsoleDashboard } from './pages/ConsoleDashboard';
import { ConsoleExporters } from './pages/ConsoleExporters';
import { ConsoleOpportunities } from './pages/ConsoleOpportunities';
import { ConsoleMarketIntelligence } from './pages/ConsoleMarketIntelligence';
import { ConsoleTrustBadging } from './pages/ConsoleTrustBadging';
import { ConsoleEngagements } from './pages/ConsoleEngagements';
import { ConsoleOutcomes } from './pages/ConsoleOutcomes';
import { ConsoleCertifications } from './pages/ConsoleCertifications';
import { ConsoleReadiness } from './pages/ConsoleReadiness';
import { ConsoleCompliance } from './pages/ConsoleCompliance';
import { ConsoleObservatory } from './pages/ConsoleObservatory';
import { ConsoleIncentives } from './pages/ConsoleIncentives';
import { ConsoleBuyers } from './pages/ConsoleBuyers';
import { ConsoleVault } from './pages/ConsoleVault';
import { ConsoleConsent } from './pages/ConsoleConsent';
import { ConsoleDelegations } from './pages/ConsoleDelegations';
import { ConsoleTaxonomies } from './pages/ConsoleTaxonomies';
import { ConsoleAudit } from './pages/ConsoleAudit';
import { ConsoleSettings } from './pages/ConsoleSettings';
import { WorkspaceStanding } from './pages/WorkspaceStanding';
import { WorkspaceRequirements } from './pages/WorkspaceRequirements';
import { WorkspaceReadiness } from './pages/WorkspaceReadiness';
import { ExporterSessionProvider } from './lib/exporterSession';
import { BuyerOverview } from './pages/BuyerOverview';
import { BuyerRequests } from './pages/BuyerRequests';
import { BuyerShortlists } from './pages/BuyerShortlists';
import { BuyerEngagements } from './pages/BuyerEngagements';
import { BuyerSessionProvider } from './lib/buyerSession';
import { OfficerProfileProvider } from './lib/officerProfile';
import { AuditLogProvider } from './lib/auditLog';

interface AppProps {
  heroVariant?: 'stacked' | 'split';
  liveDemos?: boolean;
}

function Console() {
  return (
    <Routes>
      <Route index element={<ConsoleDashboard />} />
      <Route path="exporters" element={<ConsoleExporters />} />
      <Route path="buyers" element={<ConsoleBuyers />} />
      <Route path="trust-badging" element={<ConsoleTrustBadging />} />
      <Route path="opportunities" element={<ConsoleOpportunities />} />
      <Route path="market-intelligence" element={<ConsoleMarketIntelligence />} />
      <Route path="engagements" element={<ConsoleEngagements />} />
      <Route path="outcomes" element={<ConsoleOutcomes />} />
      <Route path="readiness" element={<ConsoleReadiness />} />
      <Route path="certifications" element={<ConsoleCertifications />} />
      <Route path="compliance" element={<ConsoleCompliance />} />
      <Route path="observatory" element={<ConsoleObservatory />} />
      <Route path="incentives" element={<ConsoleIncentives />} />
      <Route path="vault" element={<ConsoleVault />} />
      <Route path="consent" element={<ConsoleConsent />} />
      <Route path="delegations" element={<ConsoleDelegations />} />
      <Route path="taxonomies" element={<ConsoleTaxonomies />} />
      <Route path="audit" element={<ConsoleAudit />} />
      <Route path="settings" element={<ConsoleSettings />} />
    </Routes>);

}

function Workspace() {
  return (
    <ExporterSessionProvider>
      <Routes>
        <Route index element={<WorkspaceStanding />} />
        <Route path="requirements" element={<WorkspaceRequirements />} />
        <Route path="readiness" element={<WorkspaceReadiness />} />
      </Routes>
    </ExporterSessionProvider>);

}

function BuyerWorkspace() {
  return (
    <BuyerSessionProvider>
      <Routes>
        <Route index element={<BuyerOverview />} />
        <Route path="requests" element={<BuyerRequests />} />
        <Route path="shortlists" element={<BuyerShortlists />} />
        <Route path="engagements" element={<BuyerEngagements />} />
      </Routes>
    </BuyerSessionProvider>);

}

export function App({ heroVariant = 'stacked', liveDemos = true }: AppProps) {
  return (
    <OfficerProfileProvider>
      <AuditLogProvider>
        <Routes>
          <Route path="/" element={<Landing heroVariant={heroVariant} liveDemos={liveDemos} />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/console/*" element={<Console />} />
          <Route path="/workspace/*" element={<Workspace />} />
          <Route path="/buyer/*" element={<BuyerWorkspace />} />
        </Routes>
      </AuditLogProvider>
    </OfficerProfileProvider>);

}
