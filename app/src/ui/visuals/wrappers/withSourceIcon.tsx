import React from 'react';
import { Printer, Folder } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const withSourceIcon = (WrappedComponent, source) => {
  return function SourceIconWrapper(props) {
    const getSourceIcon = () => {
      switch (source) {
        case '3DPOS':
          return <Printer className="w-4 h-4 text-gray-500" />;
        case 'SUMS':
          return <Folder className="w-4 h-4 text-gray-500" />;
        default:
          return null;
      }
    };

    const getSourceName = () => {
      switch (source) {
        case '3DPOS':
          return '3DPrinterOS';
        case 'SUMS':
          return 'Shared User Management System';
        default:
          return 'Unknown Source';
      }
    };

    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-20">
          <Tooltip>
            <TooltipTrigger>
              {getSourceIcon()}
            </TooltipTrigger>
            <TooltipContent>
              <p>Data Source: {getSourceName()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <WrappedComponent {...props} />
      </div>
    );
  };
};

export default withSourceIcon;