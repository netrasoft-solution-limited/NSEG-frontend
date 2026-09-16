import React, { createContext, useContext, useMemo, useState } from 'react';

interface OfficerProfile {
  name: string;
  title: string;
}

interface OfficerProfileContextValue {
  profile: OfficerProfile;
  setName: (name: string) => void;
}

const defaultProfile: OfficerProfile = { name: 'Ada Chukwu', title: 'NATEP Desk Officer' };

const OfficerProfileContext = createContext<OfficerProfileContextValue | null>(null);

export function OfficerProfileProvider({ children }: {children: React.ReactNode;}) {
  const [profile, setProfile] = useState<OfficerProfile>(defaultProfile);

  const value = useMemo<OfficerProfileContextValue>(
    () => ({
      profile,
      setName: (name: string) => setProfile((current) => ({ ...current, name }))
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
