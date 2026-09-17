import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
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
import { WorkspaceIntroductions } from './pages/WorkspaceIntroductions';
import { ExporterSessionProvider } from './lib/exporterSession';
import { BuyerOverview } from './pages/BuyerOverview';
import { BuyerRequests } from './pages/BuyerRequests';
import { BuyerShortlists } from './pages/BuyerShortlists';
import { BuyerEngagements } from './pages/BuyerEngagements';
import { BuyerSessionProvider } from './lib/buyerSession';
import { OfficerProfileProvider } from './lib/officerProfile';
import { AuditLogProvider } from './lib/auditLog';
import { GatewayExchangeProvider } from './lib/gatewayExchange';
import { RegulatoryRegisterProvider } from './lib/regulatoryRegister';
import { AccountsProvider, useAccounts } from './lib/accounts';
import { ExporterSignIn } from './pages/ExporterSignIn';
import { ExporterRegister } from './pages/ExporterRegister';
import { BuyerSignIn } from './pages/BuyerSignIn';
import { BuyerRegister } from './pages/BuyerRegister';

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

/** Workspace pages need a signed-in account; anyone else goes to sign in, then comes back. */
function RequireAccount({ signedIn, signInPath, children }: {signedIn: boolean;signInPath: string;children: React.ReactElement;}) {
  const location = useLocation();
  if (!signedIn) return <Navigate to={signInPath} replace state={{ from: location.pathname }} />;
  return children;
}

function Workspace() {
  const { signedInExporterId } = useAccounts();
  const guard = (element: React.ReactElement) =>
  <RequireAccount signedIn={Boolean(signedInExporterId)} signInPath="/workspace/sign-in">
      {element}
    </RequireAccount>;


  return (
    <Routes>
      <Route path="sign-in" element={<ExporterSignIn />} />
      <Route path="register" element={<ExporterRegister />} />
      <Route index element={guard(<WorkspaceStanding />)} />
      <Route path="requirements" element={guard(<WorkspaceRequirements />)} />
      <Route path="readiness" element={guard(<WorkspaceReadiness />)} />
      <Route path="introductions" element={guard(<WorkspaceIntroductions />)} />
    </Routes>);

}

function BuyerWorkspace() {
  const { signedInBuyerId } = useAccounts();
  const guard = (element: React.ReactElement) =>
  <RequireAccount signedIn={Boolean(signedInBuyerId)} signInPath="/buyer/sign-in">
      {element}
    </RequireAccount>;


  return (
    <Routes>
      <Route path="sign-in" element={<BuyerSignIn />} />
      <Route path="register" element={<BuyerRegister />} />
      <Route index element={guard(<BuyerOverview />)} />
      <Route path="requests" element={guard(<BuyerRequests />)} />
      <Route path="shortlists" element={guard(<BuyerShortlists />)} />
      <Route path="engagements" element={guard(<BuyerEngagements />)} />
    </Routes>);

}

export function App({ heroVariant = 'stacked', liveDemos = true }: AppProps) {
  return (
    <OfficerProfileProvider>
      <AuditLogProvider>
        <GatewayExchangeProvider>
        <RegulatoryRegisterProvider>
        <AccountsProvider>
        <ExporterSessionProvider>
        <BuyerSessionProvider>
        <Routes>
          <Route path="/" element={<Landing heroVariant={heroVariant} liveDemos={liveDemos} />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/console/*" element={<Console />} />
          <Route path="/workspace/*" element={<Workspace />} />
          <Route path="/buyer/*" element={<BuyerWorkspace />} />
        </Routes>
        </BuyerSessionProvider>
        </ExporterSessionProvider>
        </AccountsProvider>
        </RegulatoryRegisterProvider>
        </GatewayExchangeProvider>
      </AuditLogProvider>
    </OfficerProfileProvider>);

}
