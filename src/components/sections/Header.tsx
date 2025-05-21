import React from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import SelectCampaignDropdown from '../ui/SelectCampaignDropdown';
import { Campaign } from '../../types/campaign';
import { useCampaign } from '../../hooks/useCampaign';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { campaigns, selectedCampaign, selectCampaign, isLoading } = useCampaign();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-gray-800 z-20 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          className="p-2 rounded-md hover:bg-card mr-4 lg:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex items-center">
          <h1 className="text-xl font-heading font-bold text-white mr-8">
            MDMC <span className="text-primary">Music Ads</span>
          </h1>
          
          <div className="hidden md:block w-64">
            <SelectCampaignDropdown
              campaigns={campaigns}
              selectedCampaign={selectedCampaign}
              onSelectCampaign={selectCampaign}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="mr-2 text-sm text-gray-400">
          <span className="hidden md:inline">Dernière analyse: </span>
          <span className="font-semibold">21 mai 2025</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary"></span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center"
          aria-label="User profile"
        >
          <User className="h-5 w-5 mr-2" />
          <span className="hidden md:inline">Denis</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="ml-2"
          leftIcon={<LogOut className="h-4 w-4" />}
          aria-label="Logout"
        >
          <span className="hidden md:inline">Déconnexion</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;