import React, { useEffect } from 'react';
import type { Opportunity } from '../../data/opportunities';
import type { TrustTier } from '../../data/trustTiers';
import { OpportunityDetail } from './OpportunityDetail';

interface OpportunityModalProps {
  opportunity: Opportunity;
  viewerTier: TrustTier['id'];
  onClose: () => void;
}

export function OpportunityModal({ opportunity, viewerTier, onClose }: OpportunityModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-10 backdrop-blur-sm sm:items-center"
      onClick={onClose}>

      <div className="w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
        <OpportunityDetail opportunity={opportunity} viewerTier={viewerTier} onClose={onClose} />
      </div>
    </div>);

}
