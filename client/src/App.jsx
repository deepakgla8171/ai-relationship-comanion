import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ImportChatPage } from './pages/ImportChatPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { CompanionChatPage } from './pages/CompanionChatPage';
import { MemoryManagerPage } from './pages/MemoryManagerPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/import" element={<ImportChatPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/chat" element={<CompanionChatPage />} />
              <Route path="/memories" element={<MemoryManagerPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
