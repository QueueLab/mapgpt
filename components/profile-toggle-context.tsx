'use client'

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { getAuth, signOut } from 'firebase/auth'; // Import Firebase auth
import { useTheme } from 'next-themes'; // Import useTheme from next-themes

export enum ProfileActionEnum {
  AccountSettings,
  SignOut,
}

interface ProfileActionsContextType {
  handleAction: (action: ProfileActionEnum) => void;
}

const ProfileActionsContext = createContext<ProfileActionsContextType | undefined>(undefined);

interface ProfileActionsProviderProps {
  children: ReactNode;
}

export const ProfileActionsProvider: React.FC<ProfileActionsProviderProps> = ({ children }) => {
  const router = useRouter(); // Initialize Next.js router
  const { theme, setTheme } = useTheme(); // Initialize theme context

  useEffect(() => {
    // Handle theme context retention
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, [setTheme]);

  const handleAction = async (action: ProfileActionEnum) => {
    switch (action) {
      case ProfileActionEnum.AccountSettings:
        localStorage.setItem('theme', theme); // Store the current theme in localStorage
        router.push('/settings'); // Navigate to the settings page
        break;
      case ProfileActionEnum.SignOut:
        try {
          await signOut(auth); // Firebase sign out
          localStorage.setItem('theme', theme); // Store the current theme in localStorage
          router.push('/'); // Redirect to home or login page after sign-out
        } catch (error) {
          console.error('Error signing out: ', error);
        }
        break;
      default:
        throw new Error('Unknown action');
    }
  };

  return (
    <ProfileActionsContext.Provider value={{ handleAction }}>
      {children}
    </ProfileActionsContext.Provider>
  );
};

export const useProfileActions = () => {
  const context = useContext(ProfileActionsContext);
  if (context === undefined) {
    throw new Error('Profile actions context must be used within a ProfileActionsProvider');
  }
  return context;
};
