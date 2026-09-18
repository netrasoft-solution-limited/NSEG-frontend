import React from 'react';
import { AuthLayout } from '../components/workspace/AuthLayout';
import { SignInCard } from '../components/workspace/SignInCard';
import { TierBadge } from '../components/workspace/TierBadge';
import { trackLabels, trustTiers } from '../data/trustTiers';
import { useAccounts } from '../lib/accounts';

export function ExporterSignIn() {
  const accounts = useAccounts();

  return (
    <AuthLayout audience="exporter" switchLink={{ label: 'Buying services? Buyer sign in', to: '/buyer/sign-in' }}>
      <SignInCard
        heading="Welcome back"
        intro="Sign in to your exporter workspace."
        registerHref="/workspace/register"
        registerLabel="Create an exporter account"
        homeHref="/workspace"
        findByEmail={accounts.findExporterByEmail}
        signIn={accounts.signInExporter}
        demoAccounts={accounts.exporters.map((actor) => ({
          id: actor.id,
          email: actor.email,
          name: actor.name,
          detail: `${actor.contactName ? `${actor.contactName} · ` : ''}${trackLabels[actor.track]}`,
          badge: <TierBadge tier={trustTiers.find((tier) => tier.id === actor.tier)!} />
        }))} />

    </AuthLayout>);

}
