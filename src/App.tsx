import React, { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { ExporterSessionProvider } from './lib/exporterSession';
import { BuyerSessionProvider } from './lib/buyerSession';
import { OfficerProfileProvider } from './lib/officerProfile';
import { AuditLogProvider } from './lib/auditLog';
import { GatewayExchangeProvider } from './lib/gatewayExchange';
import { RegulatoryRegisterProvider } from './lib/regulatoryRegister';
import { AccountsProvider, useAccounts } from './lib/accounts';
import { DocumentVerificationProvider } from './lib/documentVerification';
import { EngagementLedgerProvider } from './lib/engagementLedger';

import { PageLoader } from './components/common/PageLoader';
import { RouteProgressFinisher, RouteProgressProvider, RouteProgressStarter } from './components/common/RouteProgress';

/** Each area downloads on first visit; the landing page stays in the main bundle so the
 * homepage paints immediately. */
function lazyPage<K extends string>(load: () => Promise<Record<K, React.ComponentType>>, name: K) {
  const component = lazy(() => load().then((module) => ({ default: module[name] }))) as
  React.LazyExoticComponent<React.ComponentType> & {preload: () => void;};
  component.preload = () => {
    void load();
  };
  return component;
}

/** Downloads the other pages of an area while the browser is idle, so moving between its
 * sections is instant instead of showing the loading screen. */
function usePreload(pages: {preload: () => void;}[]) {
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 400));
    const handle = idle(() => pages.forEach((page) => page.preload()));
    return () => {
      if (window.cancelIdleCallback && typeof handle === 'number') window.cancelIdleCallback(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

const Marketplace = lazyPage(() => import('./pages/Marketplace'), 'Marketplace');
const ConsoleDashboard = lazyPage(() => import('./pages/ConsoleDashboard'), 'ConsoleDashboard');
const ConsoleExporters = lazyPage(() => import('./pages/ConsoleExporters'), 'ConsoleExporters');
const ConsoleOpportunities = lazyPage(() => import('./pages/ConsoleOpportunities'), 'ConsoleOpportunities');
const ConsoleMarketIntelligence = lazyPage(() => import('./pages/ConsoleMarketIntelligence'), 'ConsoleMarketIntelligence');
const ConsoleTrustBadging = lazyPage(() => import('./pages/ConsoleTrustBadging'), 'ConsoleTrustBadging');
const ConsoleEngagements = lazyPage(() => import('./pages/ConsoleEngagements'), 'ConsoleEngagements');
const ConsoleOutcomes = lazyPage(() => import('./pages/ConsoleOutcomes'), 'ConsoleOutcomes');
const ConsoleCertifications = lazyPage(() => import('./pages/ConsoleCertifications'), 'ConsoleCertifications');
const ConsoleReadiness = lazyPage(() => import('./pages/ConsoleReadiness'), 'ConsoleReadiness');
const ConsoleCompliance = lazyPage(() => import('./pages/ConsoleCompliance'), 'ConsoleCompliance');
const ConsoleObservatory = lazyPage(() => import('./pages/ConsoleObservatory'), 'ConsoleObservatory');
const ConsoleIncentives = lazyPage(() => import('./pages/ConsoleIncentives'), 'ConsoleIncentives');
const ConsoleBuyers = lazyPage(() => import('./pages/ConsoleBuyers'), 'ConsoleBuyers');
const ConsoleVault = lazyPage(() => import('./pages/ConsoleVault'), 'ConsoleVault');
const ConsoleConsent = lazyPage(() => import('./pages/ConsoleConsent'), 'ConsoleConsent');
const ConsoleDelegations = lazyPage(() => import('./pages/ConsoleDelegations'), 'ConsoleDelegations');
const ConsoleTaxonomies = lazyPage(() => import('./pages/ConsoleTaxonomies'), 'ConsoleTaxonomies');
const ConsoleAudit = lazyPage(() => import('./pages/ConsoleAudit'), 'ConsoleAudit');
const ConsoleSettings = lazyPage(() => import('./pages/ConsoleSettings'), 'ConsoleSettings');
const WorkspaceStanding = lazyPage(() => import('./pages/WorkspaceStanding'), 'WorkspaceStanding');
const WorkspaceRequirements = lazyPage(() => import('./pages/WorkspaceRequirements'), 'WorkspaceRequirements');
const WorkspaceReadiness = lazyPage(() => import('./pages/WorkspaceReadiness'), 'WorkspaceReadiness');
const WorkspaceIntroductions = lazyPage(() => import('./pages/WorkspaceIntroductions'), 'WorkspaceIntroductions');
const BuyerOverview = lazyPage(() => import('./pages/BuyerOverview'), 'BuyerOverview');
const BuyerPlaceRequirement = lazyPage(() => import('./pages/BuyerRequests'), 'BuyerPlaceRequirement');
const BuyerMyRequirements = lazyPage(() => import('./pages/BuyerRequests'), 'BuyerMyRequirements');
const ExporterOverview = lazyPage(() => import('./pages/ExporterOverview'), 'ExporterOverview');
const ExporterProfile = lazyPage(() => import('./pages/ExporterProfile'), 'ExporterProfile');
const ExporterContracts = lazyPage(() => import('./pages/ExporterContracts'), 'ExporterContracts');
const ExporterShared = lazyPage(() => import('./pages/ExporterShared'), 'ExporterShared');
const ExporterRequirementsRegister = lazyPage(() => import('./pages/RequirementsRegisterPage'), 'ExporterRequirementsRegister');
const BuyerRequirementsRegister = lazyPage(() => import('./pages/RequirementsRegisterPage'), 'BuyerRequirementsRegister');
const BuyerShortlists = lazyPage(() => import('./pages/BuyerShortlists'), 'BuyerShortlists');
const BuyerEngagements = lazyPage(() => import('./pages/BuyerEngagements'), 'BuyerEngagements');
const ExporterSignIn = lazyPage(() => import('./pages/ExporterSignIn'), 'ExporterSignIn');
const ExporterRegister = lazyPage(() => import('./pages/ExporterRegister'), 'ExporterRegister');
const BuyerSignIn = lazyPage(() => import('./pages/BuyerSignIn'), 'BuyerSignIn');
const BuyerRegister = lazyPage(() => import('./pages/BuyerRegister'), 'BuyerRegister');

interface AppProps {
  heroVariant?: 'stacked' | 'split';
  liveDemos?: boolean;
}

function Console() {
  usePreload([ConsoleDashboard, ConsoleExporters, ConsoleOpportunities, ConsoleEngagements, ConsoleOutcomes, ConsoleReadiness, ConsoleCompliance, ConsoleObservatory, ConsoleBuyers, ConsoleConsent, ConsoleAudit, ConsoleSettings]);
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

/** Client-side navigation keeps the previous page's scroll position; start each new page at
 * the top unless the link targets an in-page section (#hash), which Landing handles itself. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

/** Workspace pages need a signed-in account; anyone else goes to sign in, then comes back. */
function RequireAccount({ signedIn, signInPath, children }: {signedIn: boolean;signInPath: string;children: React.ReactElement;}) {
  const location = useLocation();
  if (!signedIn) return <Navigate to={signInPath} replace state={{ from: location.pathname }} />;
  return children;
}

function Workspace() {
  const { signedInExporterId } = useAccounts();
  usePreload([ExporterOverview, ExporterProfile, WorkspaceReadiness, WorkspaceStanding, WorkspaceIntroductions, ExporterContracts, ExporterShared, ExporterRequirementsRegister, WorkspaceRequirements]);
  const guard = (element: React.ReactElement) =>
  <RequireAccount signedIn={Boolean(signedInExporterId)} signInPath="/workspace/sign-in">
      {element}
    </RequireAccount>;


  return (
    <Routes>
      <Route path="sign-in" element={<ExporterSignIn />} />
      <Route path="register" element={<ExporterRegister />} />
      <Route index element={guard(<ExporterOverview />)} />
      <Route path="profile" element={guard(<ExporterProfile />)} />
      <Route path="profile/evidence" element={guard(<WorkspaceReadiness />)} />
      <Route path="profile/tier" element={guard(<WorkspaceStanding />)} />
      <Route path="consent" element={guard(<WorkspaceIntroductions />)} />
      <Route path="contracts" element={guard(<ExporterContracts />)} />
      <Route path="shared" element={guard(<ExporterShared />)} />
      <Route path="requirements" element={guard(<ExporterRequirementsRegister />)} />
      <Route path="requirements/pathway" element={guard(<WorkspaceRequirements />)} />
      {/* Earlier addresses, kept so saved links still land in the right place. */}
      <Route path="readiness" element={<Navigate to="/workspace/profile/evidence" replace />} />
      <Route path="introductions" element={<Navigate to="/workspace/consent" replace />} />
    </Routes>);

}

function BuyerWorkspace() {
  const { signedInBuyerId } = useAccounts();
  usePreload([BuyerOverview, BuyerPlaceRequirement, BuyerMyRequirements, BuyerShortlists, BuyerEngagements, BuyerRequirementsRegister]);
  const guard = (element: React.ReactElement) =>
  <RequireAccount signedIn={Boolean(signedInBuyerId)} signInPath="/buyer/sign-in">
      {element}
    </RequireAccount>;


  return (
    <Routes>
      <Route path="sign-in" element={<BuyerSignIn />} />
      <Route path="register" element={<BuyerRegister />} />
      <Route index element={guard(<BuyerOverview />)} />
      <Route path="requests/new" element={guard(<BuyerPlaceRequirement />)} />
      <Route path="requests" element={guard(<BuyerMyRequirements />)} />
      <Route path="introductions" element={guard(<BuyerShortlists />)} />
      <Route path="contracts" element={guard(<BuyerEngagements />)} />
      <Route path="requirements" element={guard(<BuyerRequirementsRegister />)} />
      {/* Earlier addresses, kept so saved links still land in the right place. */}
      <Route path="shortlists" element={<Navigate to="/buyer/introductions" replace />} />
      <Route path="engagements" element={<Navigate to="/buyer/contracts" replace />} />
    </Routes>);

}

export function App({ heroVariant = 'stacked', liveDemos = true }: AppProps) {
  return (
    <OfficerProfileProvider>
      <AuditLogProvider>
        <DocumentVerificationProvider>
        <EngagementLedgerProvider>
        <GatewayExchangeProvider>
        <RegulatoryRegisterProvider>
        <AccountsProvider>
        <ExporterSessionProvider>
        <BuyerSessionProvider>
        <RouteProgressProvider>
        <ScrollToTop />
        <RouteProgressStarter />
        <Suspense fallback={<PageLoader />}>
        <RouteProgressFinisher />
        <Routes>
          <Route path="/" element={<Landing heroVariant={heroVariant} liveDemos={liveDemos} />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/console/*" element={<Console />} />
          <Route path="/workspace/*" element={<Workspace />} />
          <Route path="/buyer/*" element={<BuyerWorkspace />} />
        </Routes>
        </Suspense>
        </RouteProgressProvider>
        </BuyerSessionProvider>
        </ExporterSessionProvider>
        </AccountsProvider>
        </RegulatoryRegisterProvider>
        </GatewayExchangeProvider>
        </EngagementLedgerProvider>
        </DocumentVerificationProvider>
      </AuditLogProvider>
    </OfficerProfileProvider>);

}
