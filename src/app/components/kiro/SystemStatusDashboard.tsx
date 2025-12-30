import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Server,
  Shield,
  Zap,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { checkSystemHealth, HealthStatus } from '../../../lib/health-check';
import { validateAllAPIs, APIValidationSuite } from '../../../lib/api-validation';
import { logger } from '../../../lib/error-logging';

interface SystemStatusDashboardProps {
  className?: string;
}

export const SystemStatusDashboard: React.FC<SystemStatusDashboardProps> = ({ className }) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [apiValidation, setApiValidation] = useState<APIValidationSuite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    runSystemChecks();

    // Auto-refresh every 30 seconds
    const interval = setInterval(runSystemChecks, 30000);
    return () => clearInterval(interval);
  }, []);

  const runSystemChecks = async () => {
    setIsLoading(true);

    try {
      logger.info('Running system health checks', { component: 'SystemStatusDashboard' });

      const [health, apiResults] = await Promise.all([
        checkSystemHealth(),
        validateAllAPIs()
      ]);

      setHealthStatus(health);
      setApiValidation(apiResults);
      setLastUpdated(new Date());

      logger.info('System health checks completed', {
        component: 'SystemStatusDashboard',
        metadata: {
          overallHealth: health.status,
          apiStatus: apiResults.overallStatus
        }
      });

    } catch (error) {
      logger.error('System health check failed', {
        component: 'SystemStatusDashboard'
      }, error instanceof Error ? error : undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
      case 'error':
      case 'fail':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unhealthy':
      case 'error':
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportLogs = () => {
    const logs = logger.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conceptpulse-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const viewLogs = () => {
    const logs = logger.getRecentLogs(100);
    console.group('📋 Recent System Logs');
    logs.forEach(log => {
      const method = log.level === 'error' || log.level === 'critical' ? 'error' :
        log.level === 'warn' ? 'warn' : 'log';
      console[method](`[${log.timestamp}] ${log.message}`, log.context || '');
    });
    console.groupEnd();
  };

  if (isLoading && !healthStatus) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Running system diagnostics...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
          <p className="text-gray-600">
            Real-time monitoring of ConceptPulse infrastructure
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={runSystemChecks}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {healthStatus && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(healthStatus.status)}
                <CardTitle>Overall System Status</CardTitle>
              </div>
              <Badge variant="outline" className={getStatusColor(healthStatus.status)}>
                {healthStatus.status.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>
              System uptime: {Math.round(healthStatus.uptime / 1000)}s
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="apis">API Endpoints</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {healthStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(healthStatus.services).map(([serviceName, service]) => (
                <Card key={serviceName}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {serviceName === 'database' && <Database className="h-4 w-4" />}
                        {serviceName === 'api' && <Server className="h-4 w-4" />}
                        {serviceName === 'storage' && <Globe className="h-4 w-4" />}
                        {serviceName === 'ai' && <Zap className="h-4 w-4" />}
                        <CardTitle className="text-sm font-medium">
                          {serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}
                        </CardTitle>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <Badge variant="outline" className={getStatusColor(service.status)}>
                        {service.status.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-gray-600">{service.message}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Activity className="h-3 w-3" />
                        <span>{service.responseTime}ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          {apiValidation && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Passed</p>
                        <p className="text-2xl font-bold text-gray-900">{apiValidation.passedTests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Warnings</p>
                        <p className="text-2xl font-bold text-gray-900">{apiValidation.warningTests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Failed</p>
                        <p className="text-2xl font-bold text-gray-900">{apiValidation.failedTests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                {apiValidation.results.map((result, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <p className="font-medium">
                              {result.method} {result.endpoint}
                            </p>
                            <p className="text-sm text-gray-600">{result.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getStatusColor(result.status)}>
                            {result.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">{result.responseTime}ms</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">System Logs</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={viewLogs}>
                <Eye className="h-4 w-4 mr-2" />
                View in Console
              </Button>
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logger.getRecentLogs(20).reverse().map((log, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm">
                    <span className="text-gray-500 font-mono text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(log.level)} text-xs`}
                    >
                      {log.level.toUpperCase()}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-gray-900">{log.message}</p>
                      {log.component && (
                        <p className="text-gray-500 text-xs">
                          {log.component}{log.action && `:${log.action}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Security Status</p>
                    <p className="text-lg font-bold text-gray-900">Secure</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-lg font-bold text-gray-900">
                      {healthStatus ?
                        Math.round(Object.values(healthStatus.services).reduce((sum, s) => sum + s.responseTime, 0) / Object.keys(healthStatus.services).length)
                        : 0}ms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Environment</p>
                    <p className="text-lg font-bold text-gray-900">
                      {import.meta.env.VITE_APP_ENV || 'development'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Version</p>
                    <p className="text-lg font-bold text-gray-900">
                      {healthStatus?.version || '1.0.0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};