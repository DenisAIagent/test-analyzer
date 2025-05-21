import React, { useState } from 'react';
import Header from '../components/sections/Header';
import Sidebar from '../components/sections/Sidebar';
import KPISection from '../components/sections/KPISection';
import { useCampaign } from '../hooks/useCampaign';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedCampaign, isLoading } = useCampaign();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="pt-20 lg:pl-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-3/4 bg-card rounded mb-6"></div>
              <div className="h-32 bg-card rounded mb-6"></div>
              <div className="h-64 bg-card rounded"></div>
            </div>
          ) : selectedCampaign ? (
            <>
              <div className="flex flex-col mb-6">
                <h1 className="text-2xl font-heading font-bold">
                  {selectedCampaign.name}
                </h1>
                <div className="flex items-center mt-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      selectedCampaign.status === 'ENABLED'
                        ? 'bg-green-600'
                        : selectedCampaign.status === 'PAUSED'
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                  ></span>
                  <span className="text-sm text-gray-400">
                    {selectedCampaign.status === 'ENABLED'
                      ? 'Actif'
                      : selectedCampaign.status === 'PAUSED'
                      ? 'En pause'
                      : 'Supprimé'}
                  </span>
                  <span className="ml-4 px-2 py-0.5 bg-gray-800 rounded text-xs">
                    {selectedCampaign.type === 'PERFORMANCE_MAX'
                      ? 'Performance Max'
                      : selectedCampaign.type === 'VIDEO'
                      ? 'Vidéo'
                      : selectedCampaign.type === 'SEARCH'
                      ? 'Search'
                      : 'Display'}
                  </span>
                </div>
              </div>
              
              <div className="grid gap-6">
                <KPISection />
                
                {/* En construction */}
                <div className="bg-card p-4 rounded-md flex flex-col items-center justify-center h-64">
                  <h2 className="text-xl font-bold mb-2">En construction</h2>
                  <p className="text-gray-400 text-center">
                    Les modules Graphiques et Analyse IA seront bientôt disponibles.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <h2 className="text-xl font-bold mb-4">Aucune campagne sélectionnée</h2>
              <p className="text-gray-400 text-center mb-8">
                Veuillez sélectionner une campagne dans le menu pour afficher son tableau de bord.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;