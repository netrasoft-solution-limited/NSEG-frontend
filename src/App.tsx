import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Marketplace } from './pages/Marketplace';
import { ConsoleDashboard } from './pages/ConsoleDashboard';
import { ConsoleExporters } from './pages/ConsoleExporters';
import { ConsoleOpportunities } from './pages/ConsoleOpportunities';
import { ConsoleReadiness } from './pages/ConsoleReadiness';
import { ConsoleCompliance } from './pages/ConsoleCompliance';
import { ConsoleObservatory } from './pages/ConsoleObservatory';
import { ConsoleSettings } from './pages/ConsoleSettings';
import { OfficerProfileProvider } from './lib/officerProfile';

interface AppProps {
  heroVariant?: 'stacked' | 'split';
  liveDemos?: boolean;
}

function Console() {
  return (
    <OfficerProfileProvider>
      <Routes>
        <Route index element={<ConsoleDashboard />} />
        <Route path="exporters" element={<ConsoleExporters />} />
        <Route path="opportunities" element={<ConsoleOpportunities />} />
        <Route path="readiness" element={<ConsoleReadiness />} />
        <Route path="compliance" element={<ConsoleCompliance />} />
        <Route path="observatory" element={<ConsoleObservatory />} />
        <Route path="settings" element={<ConsoleSettings />} />
      </Routes>
    </OfficerProfileProvider>);

}

export function App({ heroVariant = 'stacked', liveDemos = true }: AppProps) {
  return (
    <Routes>
      <Route path="/" element={<Landing heroVariant={heroVariant} liveDemos={liveDemos} />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/console/*" element={<Console />} />
    </Routes>);

}
