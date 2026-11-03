import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 64px - 140px)', paddingBottom: '3rem' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}

