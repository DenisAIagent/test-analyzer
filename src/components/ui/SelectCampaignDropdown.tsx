import React, { useState, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { Campaign } from '../../types/campaign';

interface SelectCampaignDropdownProps {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  onSelectCampaign: (campaign: Campaign) => void;
  isLoading?: boolean;
  className?: string;
}

const SelectCampaignDropdown: React.FC<SelectCampaignDropdownProps> = ({
  campaigns,
  selectedCampaign,
  onSelectCampaign,
  isLoading = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>(campaigns);

  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      setFilteredCampaigns(
        campaigns.filter(campaign => 
          campaign.name.toLowerCase().includes(lowercaseQuery) || 
          campaign.id.toLowerCase().includes(lowercaseQuery)
        )
      );
    } else {
      setFilteredCampaigns(campaigns);
    }
  }, [searchQuery, campaigns]);

  const getCampaignStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'ENABLED':
        return 'bg-green-600';
      case 'PAUSED':
        return 'bg-yellow-600';
      case 'REMOVED':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getCampaignTypeLabel = (type: Campaign['type']) => {
    switch (type) {
      case 'PERFORMANCE_MAX':
        return 'Perf Max';
      case 'VIDEO':
        return 'Vidéo';
      case 'SEARCH':
        return 'Search';
      case 'DISPLAY':
        return 'Display';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className={cn('h-10 w-full bg-card rounded-md animate-pulse', className)} />
    );
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center justify-between w-full px-3 py-2 text-sm bg-card border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50',
            className
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedCampaign ? (
              <>
                <span className={cn('w-2 h-2 rounded-full', getCampaignStatusColor(selectedCampaign.status))} />
                <span className="truncate">{selectedCampaign.name}</span>
                <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded">
                  {getCampaignTypeLabel(selectedCampaign.type)}
                </span>
              </>
            ) : (
              <span className="text-gray-400">Sélectionner une campagne</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[220px] max-w-[400px] overflow-hidden rounded-md border border-gray-700 bg-card shadow-md animate-in fade-in-80"
          sideOffset={5}
          align="start"
        >
          <div className="flex items-center border-b border-gray-700 px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
            <input
              className="flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu.Viewport className="p-1 max-h-[300px] overflow-y-auto">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-400">
                Aucune campagne trouvée
              </div>
            ) : (
              filteredCampaigns.map((campaign) => (
                <DropdownMenu.Item
                  key={campaign.id}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-gray-700 focus:bg-gray-700',
                    selectedCampaign?.id === campaign.id && 'bg-gray-700'
                  )}
                  onSelect={() => onSelectCampaign(campaign)}
                >
                  <div className="flex items-center gap-2 w-full overflow-hidden">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        getCampaignStatusColor(campaign.status)
                      )}
                    />
                    <span className="flex-1 truncate">{campaign.name}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-800 rounded ml-2">
                      {getCampaignTypeLabel(campaign.type)}
                    </span>
                  </div>
                  {selectedCampaign?.id === campaign.id && (
                    <Check className="h-4 w-4 text-primary ml-2" />
                  )}
                </DropdownMenu.Item>
              ))
            )}
          </DropdownMenu.Viewport>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SelectCampaignDropdown;