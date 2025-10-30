"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleSelection from './RoleSelection';
import OrganizerSignUp from './OrganizerSignUp';
import StreamerSignUp from './StreamerSignUp';
import LoginForm from './LoginForm';

type AuthView = 'role-selection' | 'organizer-signup' | 'streamer-signup' | 'login';
type UserType = 'organizer' | 'streamer' | null;

interface AuthLayoutProps {
  onAuthenticate: (provider: string, userType: UserType) => Promise<void>;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ onAuthenticate }) => {
  const [currentView, setCurrentView] = useState<AuthView>('role-selection');
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);

  const handleRoleSelect = (role: UserType) => {
    setSelectedUserType(role);
    if (role === 'organizer') {
      setCurrentView('organizer-signup');
    } else if (role === 'streamer') {
      setCurrentView('streamer-signup');
    }
  };

  const handleBackToRoleSelection = () => {
    setCurrentView('role-selection');
    setSelectedUserType(null);
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToSignUp = () => {
    setCurrentView('role-selection');
    setSelectedUserType(null);
  };

  const handleOrganizerSignIn = async (provider: 'google' | 'discord') => {
    await onAuthenticate(provider, 'organizer');
  };

  const handleStreamerSignIn = async (provider: 'twitch' | 'youtube' | 'kick') => {
    await onAuthenticate(provider, 'streamer');
  };

  const handleLoginSignIn = async (provider: string) => {
    // For login, we don't specify user type - it's determined by their existing account
    await onAuthenticate(provider, null);
  };

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <AnimatePresence mode="wait">
      {currentView === 'role-selection' && (
        <motion.div
          key="role-selection"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <RoleSelection onRoleSelect={handleRoleSelect} />
        </motion.div>
      )}

      {currentView === 'organizer-signup' && (
        <motion.div
          key="organizer-signup"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <OrganizerSignUp
            onBack={handleBackToRoleSelection}
            onSignIn={handleOrganizerSignIn}
            onSwitchToLogin={handleSwitchToLogin}
          />
        </motion.div>
      )}

      {currentView === 'streamer-signup' && (
        <motion.div
          key="streamer-signup"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <StreamerSignUp
            onBack={handleBackToRoleSelection}
            onSignIn={handleStreamerSignIn}
            onSwitchToLogin={handleSwitchToLogin}
          />
        </motion.div>
      )}

      {currentView === 'login' && (
        <motion.div
          key="login"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <LoginForm
            onSignIn={handleLoginSignIn}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthLayout;
