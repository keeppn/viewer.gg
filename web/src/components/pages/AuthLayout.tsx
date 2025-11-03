"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoginPage from './LoginPage';

type UserType = 'organizer' | null;

interface AuthLayoutProps {
  onAuthenticate: (provider: string, userType: UserType) => Promise<void>;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ onAuthenticate }) => {
  const handleSignIn = async (provider: 'google' | 'discord') => {
    // All signups are now for organizers
    await onAuthenticate(provider, 'organizer');
  };

  return <LoginPage onSignIn={handleSignIn} />;
};

export default AuthLayout;
