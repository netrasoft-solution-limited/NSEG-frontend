import React from 'react';
import { AuthLayout } from '../components/workspace/AuthLayout';
import { SignInCard } from '../components/workspace/SignInCard';
import { BuyerTierBadge } from '../components/workspace/TierBadge';
import { buyerTiers } from '../data/buyerTiers';
import { useAccounts } from '../lib/accounts';

export function BuyerSignIn() {
  const accounts = useAccounts();

  return (
    <AuthLayout audience="buyer" switchLink={{ label: 'Exporting services? Exporter sign in', to: '/workspace/sign-in' }}>
      <SignInCard
        heading="Welcome back"
        intro="Sign in to your buyer workspace."
        registerHref="/buyer/register"
        registerLabel="Create a buyer account"
        homeHref="/buyer"
        findByEmail={accounts.findBuyerByEmail}
        signIn={accounts.signInBuyer}
        demoAccounts={accounts.buyers.map((buyer) => ({
          id: buyer.id,
          email: buyer.email,
          name: buyer.name,
          detail: `${buyer.contactName ? `${buyer.contactName} · ` : ''}${buyer.region}`,
          badge: <BuyerTierBadge tier={buyerTiers.find((tier) => tier.id === buyer.tier)!} />
        }))} />

    </AuthLayout>);

}
