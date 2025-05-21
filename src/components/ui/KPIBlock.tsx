import React from 'react';
import { ArrowDown, ArrowUp, ArrowRight, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { KPIData, KPIType, kpiConfig } from '../../types/kpi';
import { formatValue } from '../../lib/utils';
import Card from './Card';

interface KPIBlockProps {
  data: KPIData;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showHelp?: boolean;
  showChange?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

const KPIBlock: React.FC<KPIBlockProps> = ({
  data,
  className,
  size = 'md',
  showHelp = true,
  showChange = true,
  onClick,
  isLoading = false,
}) => {
  const { type, value, previousValue, changePercentage, trend } = data;
  const config = kpiConfig[type];
  
  if (!config) {
    return null;
  }

  const formattedValue = formatValue(value, type);
  const formattedPrevValue = previousValue !== undefined ? formatValue(previousValue, type) : undefined;
  
  const getTrendIcon = () => {
    if (!trend || !showChange) return null;
    
    switch (trend) {
      case 'up':
        return <ArrowUp className={cn('h-4 w-4', config.trend === 'up-good' ? 'text-green-500' : 'text-red-500')} />;
      case 'down':
        return <ArrowDown className={cn('h-4 w-4', config.trend === 'down-good' ? 'text-green-500' : 'text-red-500')} />;
      case 'stable':
        return <ArrowRight className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };
  
  const getChangeColor = () => {
    if (!trend || !showChange) return 'text-gray-400';
    
    const isPositive = 
      (config.trend === 'up-good' && trend === 'up') ||
      (config.trend === 'down-good' && trend === 'down');
    
    return isPositive ? 'text-green-500' : trend === 'stable' ? 'text-gray-400' : 'text-red-500';
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          label: 'text-xs',
          value: 'text-xl font-bold',
          change: 'text-xs',
        };
      case 'md':
        return {
          card: 'p-4',
          label: 'text-sm',
          value: 'text-2xl font-bold',
          change: 'text-sm',
        };
      case 'lg':
        return {
          card: 'p-5',
          label: 'text-base',
          value: 'text-3xl font-bold',
          change: 'text-base',
        };
      default:
        return {
          card: 'p-4',
          label: 'text-sm',
          value: 'text-2xl font-bold',
          change: 'text-sm',
        };
    }
  };
  
  const sizeClasses = getSizeClasses();
  
  return (
    <Card
      className={cn(
        sizeClasses.card,
        'transition-all hover:bg-opacity-90',
        onClick && 'cursor-pointer hover:border-primary',
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={cn(sizeClasses.label, 'text-gray-300')}>{config.label}</span>
            {showHelp && (
              <div className="relative group ml-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-gray-500" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                  {config.description}
                  {config.benchmark && (
                    <div className="mt-1">
                      <span className="font-semibold">Benchmark:</span> {formatValue(config.benchmark, type)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {getTrendIcon()}
        </div>
        
        <div className={cn(sizeClasses.value)}>{formattedValue}</div>
        
        {showChange && changePercentage !== undefined && (
          <div className={cn(sizeClasses.change, getChangeColor(), 'flex items-center gap-1')}>
            {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(2)}%
            {formattedPrevValue && (
              <span className="text-gray-500 ml-1">({formattedPrevValue})</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default KPIBlock;