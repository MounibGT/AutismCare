"use client";

import React from 'react';
import AutismChatbot from '../../components/AutismChatbot';
import { Header } from '@/components/layout/Header';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      {/* Autism Chatbot Component */}
      <AutismChatbot />
    </>
  );
}
