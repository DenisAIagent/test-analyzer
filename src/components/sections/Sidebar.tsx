import React from 'react';
import { BarChart2, Settings, HelpCircle, FileText, DownloadCloud } from 'lucide-react';
import { cn } from '../../lib/utils';
import SelectCampaignDropdown from '../ui/SelectCampaignDropdown';
import { useCampaign } from '../../hooks/useCampaign';
import Button from '../ui/Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { campaigns, selectedCampaign, selectCampaign, isLoading } = useCampaign();

  const sidebarItems = [
    { icon: <BarChart2 />, label: 'Dashboard', isActive: true },
    { icon: <FileText />, label: 'Rapports', isActive: false },
    { icon: <Settings />, label: 'Paramètres', isActive: false },
    { icon: <HelpCircle />, label: 'Aide', isActive: false },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-gray-800 pt-16 flex flex-col transition-transform duration-300 ease-in-out z-20',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ backgroundColor: '#2E2E2E' }}
      >
        <div className="p-4 border-b border-gray-800">
          <SelectCampaignDropdown
            campaigns={campaigns}
            selectedCampaign={selectedCampaign}
            onSelectCampaign={selectCampaign}
            isLoading={isLoading}
            className="w-full"
          />
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <a
                  href="#"
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-none border-l-2',
                    item.isActive
                      ? 'text-white border-primary bg-primary bg-opacity-10'
                      : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-800'
                  )}
                >
                  <span className="mr-3 h-5 w-5">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 mt-auto border-t border-gray-800">
          <Button
            className="w-full"
            leftIcon={<DownloadCloud className="h-4 w-4" />}
          >
            Exporter en PDF
          </Button>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>MDMC Music Ads Analyzer</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;