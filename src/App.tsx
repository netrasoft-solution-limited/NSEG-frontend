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

interface AppProps {
  heroVariant?: 'stacked' | 'split';
  liveDemos?: boolean;
}

export function App({ heroVariant = 'stacked', liveDemos = true }: AppProps) {
  return (
    <Routes>
      <Route path="/" element={<Landing heroVariant={heroVariant} liveDemos={liveDemos} />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/console" element={<ConsoleDashboard />} />
      <Route path="/console/exporters" element={<ConsoleExporters />} />
      <Route path="/console/opportunities" element={<ConsoleOpportunities />} />
      <Route path="/console/readiness" element={<ConsoleReadiness />} />
      <Route path="/console/compliance" element={<ConsoleCompliance />} />
      <Route path="/console/observatory" element={<ConsoleObservatory />} />
    </Routes>
  );
}