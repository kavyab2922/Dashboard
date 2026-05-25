import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative overflow-x-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/*
        Desktop: offset by 64px (collapsed rail width).
        The sidebar expands ON TOP of content (overflow:hidden on sidebar + fixed positioning),
        so content doesn't jump when sidebar opens.
      */}
      <div className="flex-1 lg:ml-16 flex flex-col min-h-screen relative z-10">
        <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 p-4 sm:p-5 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
