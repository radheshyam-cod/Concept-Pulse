/**
 * Kiro Status Component
 * Shows real-time connection status and health of Kiro server
 */

import React, { useState, useEffect } from 'react';
import { kiroSDK } from '../../../lib/kiro-sdk/core';
import { getKiroConnectionStatus } from '../../../lib/kiro-services';
import type { ConnectionStatus, HealthStatus } from '../../../lib/kiro-sdk/types';

interface KiroStatusProps {
  className?: string;
}

export const KiroStatus: React.FC<KiroStatusProps> = ({ className = '' }) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const updateStatus = async () => {
    try {
      const status = await getKiroConnectionStatus();
      
      if (status.connected) {
        const connStatus = kiroSDK.getConnectionStatus();
        const health = await kiroSDK.getHealth();
        
        setConnectionStatus(connStatus);
        setHealthStatus(health);
      } else {
        setConnectionStatus({
          connected: false,
          servicesAvailable: [],
          errors: []
        });
        setHealthStatus(null);
      }
    } catch (error) {
      console.error('Failed to get Kiro status:', error);
      setConnectionStatus({
        connected: false,
        servicesAvailable: [],
        errors: [
          {
            code: 'STATUS_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
            retryable: true
          }
        ]
      });
    } finally {
      setIsLoading(false);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => {
    updateStatus();
    
    // Update status every 30 seconds
    const interval = setInterval(updateStatus, 30000);
    
    // Listen for Kiro events
    const subscription = kiroSDK.subscribe('*', (event: any) => {
      console.log('Kiro event received:', event);
      updateStatus();
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  const getStatusColor = () => {
    if (isLoading) return 'bg-gray-500';
    if (!connectionStatus?.connected) return 'bg-red-500';
    if (connectionStatus.errors && connectionStatus.errors.length > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (!connectionStatus?.connected) return 'Disconnected';
    if (connectionStatus.errors && connectionStatus.errors.length > 0) return 'Issues';
    return 'Connected';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Kiro Server Status</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
        </div>
      </div>

      {/* Connection Details */}
      {connectionStatus && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-2 font-medium ${
                connectionStatus.connected ? 'text-green-600' : 'text-red-600'
              }`}>
                {connectionStatus.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {connectionStatus.lastConnected && (
              <div>
                <span className="text-gray-500">Last Connected:</span>
                <span className="ml-2 text-gray-700">
                  {connectionStatus.lastConnected.toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {connectionStatus.latency && (
              <div>
                <span className="text-gray-500">Latency:</span>
                <span className="ml-2 text-gray-700">{connectionStatus.latency}ms</span>
              </div>
            )}
          </div>

          {/* Services */}
          {connectionStatus.servicesAvailable.length > 0 && (
            <div>
              <span className="text-gray-500 text-sm">Available Services:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {connectionStatus.servicesAvailable.map((service: string) => (
                  <span
                    key={service}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Health Status */}
          {healthStatus && (
            <div className="border-t pt-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Server:</span>
                  <span className="ml-2 text-gray-700">{healthStatus.server}</span>
                </div>
                <div>
                  <span className="text-gray-500">Database:</span>
                  <span className="ml-2 text-gray-700">{healthStatus.database}</span>
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {connectionStatus.errors && connectionStatus.errors.length > 0 && (
            <div className="border-t pt-3">
              <span className="text-gray-500 text-sm">Recent Errors:</span>
              <div className="mt-1 space-y-1">
                {connectionStatus.errors.slice(0, 3).map((error: any, index: number) => (
                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    <div className="font-medium">{error.code}</div>
                    <div>{error.message}</div>
                    <div className="text-gray-500 mt-1">
                      {error.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <button
          onClick={updateStatus}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
        >
          {isLoading ? 'Checking...' : 'Refresh'}
        </button>
        
        <span className="text-xs text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};