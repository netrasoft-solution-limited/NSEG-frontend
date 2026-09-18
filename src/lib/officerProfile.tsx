import React, { createContext, useContext, useMemo, useState } from 'react';

/**
 * Desk officers handle day-to-day qualification/verification work; the BRD's two-tier
 * incentive workflow (BR-P2-05.3) reserves final sign-off above a threshold for a
 * designated NATEP/NEPC Administrator. 'adspa-auditor' simulates BRD Module 2's
 * ROLE_ADSPA_OFFICER — technical/security audit access that can inspect everything but
 * "cannot modify database records, user permissions, or system configurations" — so the
 * console goes read-only across every mutating action under that role. This is a
 * client-side role switch for this demo — there's no backend to enforce it, so it shapes
 * what the UI offers, not a real permission boundary.
 */
export type OfficerRole =
'desk-officer' |
'administrator' |
'adspa-auditor' |
/** PRD v1.0 §3.2 / §4: writes regulatory content, which stays Draft. */
'content-drafter' |
/** PRD v1.0 §3.2 / §4: signs off content for one competent authority. */
'authority-focal';

interface OfficerProfile {
  name: string;
  title: string;
  role: OfficerRole;
  /** The competent authority a focal signs for. Ignored for other roles. */
  authority: string;
}

interface OfficerProfileContextValue {
  profile: OfficerProfile;
  setName: (name: string) => void;
  setRole: (role: OfficerRole) => void;
  setAuthority: (authority: string) => void;
}

const defaultProfile: OfficerProfile = { name: 'Ada Chukwu', title: 'NATEP Desk Officer', role: 'desk-officer', authority: 'Central Bank of Nigeria' };

const OfficerProfileContext = createContext<OfficerProfileContextValue | null>(null);

export function OfficerProfileProvider({ children }: {children: React.ReactNode;}) {
  const [profile, setProfile] = useState<OfficerProfile>(defaultProfile);

  const value = useMemo<OfficerProfileContextValue>(
    () => ({
      profile,
      setName: (name: string) => setProfile((current) => ({ ...current, name })),
      setRole: (role: OfficerRole) => setProfile((current) => ({ ...current, role })),
      setAuthority: (authority: string) => setProfile((current) => ({ ...current, authority }))
    }),
    [profile]
  );

  return <OfficerProfileContext.Provider value={value}>{children}</OfficerProfileContext.Provider>;
}

export function useOfficerProfile(): OfficerProfileContextValue {
  const context = useContext(OfficerProfileContext);
  if (!context) throw new Error('useOfficerProfile must be used within an OfficerProfileProvider');
  return context;
}
