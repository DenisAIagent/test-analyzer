import React from 'react';
import { RefreshCw } from 'lucide-react';
import KPIBlock from '../ui/KPIBlock';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { useCampaign } from '../../hooks/useCampaign';
import { KPIData } from '../../types/kpi';
import { TimeRange } from '../../types/campaign';
import Button from '../ui/Button';

const KPISection: React.FC = () => {
  const {
    selectedCampaign,
    kpiData,
    selectedTimeRange,
    setSelectedTimeRange,
    isLoading,
    refreshData
  } = useCampaign();

  const handleRefresh = () => {
    refreshData();
  };

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '30d', label: '30 jours' },
    { value: '14d', label: '14 jours' },
    { value: '7d', label: '7 jours' },
    { value: '3d', label: '3 jours' },
    { value: '24h', label: '24h' },
  ];

  const currentKpiData = kpiData[selectedTimeRange];

  return (
    <div className="p-4 rounded-md animate-in fade-in-50" style={{ backgroundColor: '#000000' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-heading font-bold">Performance KPI</h2>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={handleRefresh}
          isLoading={isLoading}
        >
          Rafraîchir
        </Button>
      </div>

      <Tabs
        value={selectedTimeRange}
        onValueChange={(value) => setSelectedTimeRange(value as TimeRange)}
        className="w-full"
      >
        <TabsList className="w-full flex mb-4">
          {timeRanges.map((range) => (
            <TabsTrigger
              key={range.value}
              value={range.value}
              className="flex-1"
            >
              {range.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {timeRanges.map((range) => (
          <TabsContent key={range.value} value={range.value} className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <KPIBlock
                    key={i}
                    data={{ type: 'cost', value: 0, timeRange: range.value }}
                    isLoading={true}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {kpiData[range.value].map((data: KPIData) => (
                  <KPIBlock
                    key={data.type}
                    data={data}
                    size="md"
                    className="h-full"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {!isLoading && currentKpiData.length === 0 && selectedCampaign && (
        <div className="py-8 text-center text-gray-400">
          <p>Aucune donnée disponible pour cette période.</p>
          <p className="text-sm mt-2">
            Les KPI disponibles dépendent du type de campagne ({selectedCampaign.type}).
          </p>
        </div>
      )}
    </div>
  );
};

export default KPISection;