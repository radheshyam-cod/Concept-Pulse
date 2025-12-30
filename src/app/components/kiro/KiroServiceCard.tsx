import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  PlayCircle, 
  PauseCircle, 
  Settings, 
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface KiroServiceCardProps {
  service: {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'error';
    lastUpdated: string;
    metrics?: {
      tasksCompleted?: number;
      uptime?: string;
      lastActivity?: string;
    };
  };
  onStart: (serviceId: string) => void;
  onStop: (serviceId: string) => void;
  onConfigure: (serviceId: string) => void;
  onViewDetails: (serviceId: string) => void;
}

export const KiroServiceCard: React.FC<KiroServiceCardProps> = ({
  service,
  onStart,
  onStop,
  onConfigure,
  onViewDetails
}) => {
  const getStatusIcon = () => {
    switch (service.status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <PauseCircle className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (service.status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-lg font-semibold">
              {service.name}
            </CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={`${getStatusColor()} font-medium`}
          >
            {service.status}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-600">
          {service.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics */}
        {service.metrics && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {service.metrics.tasksCompleted !== undefined && (
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">
                  {service.metrics.tasksCompleted} tasks
                </span>
              </div>
            )}
            {service.metrics.uptime && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-gray-600">
                  {service.metrics.uptime} uptime
                </span>
              </div>
            )}
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500">
          Last updated: {new Date(service.lastUpdated).toLocaleString()}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          {service.status === 'active' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStop(service.id)}
              className="flex items-center space-x-1"
            >
              <PauseCircle className="h-4 w-4" />
              <span>Stop</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStart(service.id)}
              className="flex items-center space-x-1"
            >
              <PlayCircle className="h-4 w-4" />
              <span>Start</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigure(service.id)}
            className="flex items-center space-x-1"
          >
            <Settings className="h-4 w-4" />
            <span>Config</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => onViewDetails(service.id)}
            className="flex-1"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};