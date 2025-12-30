/**
 * Kiro SDK Core
 * Main SDK class for Kiro server integration
 */

import { 
  KiroSDKConfig, 
  ConnectionStatus, 
  ServiceInfo, 
  EventCallback, 
  Subscription,
  HealthStatus 
} from './types';
import { ConnectionManager } from './connection';
import { WebSocketManager } from './websocket';
import { KiroSDKError } from './errors';

export class KiroSDK {
  private config: KiroSDKConfig;
  private connectionManager: ConnectionManager;
  private webSocketManager: WebSocketManager;
  private services: Map<string, any> = new Map();
  private initialized = false;

  constructor(config: KiroSDKConfig) {
    this.config = config;
    this.connectionManager = new ConnectionManager(config);
    this.webSocketManager = new WebSocketManager(config.wsUrl);
  }

  async connect(): Promise<void> {
    if (this.initialized) {
      console.log('🔄 Kiro SDK already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Kiro SDK...');
      
      // Connect to HTTP API
      await this.connectionManager.connect();
      
      // Connect to WebSocket
      await this.webSocketManager.connect();
      
      this.initialized = true;
      console.log('✅ Kiro SDK initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Kiro SDK:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      await this.connectionManager.disconnect();
      this.webSocketManager.disconnect();
      this.services.clear();
      this.initialized = false;
      
      console.log('🔌 Kiro SDK disconnected');
    } catch (error) {
      console.error('❌ Error during Kiro SDK disconnect:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.initialized && this.connectionManager.isConnected();
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionManager.getConnectionStatus();
  }

  async getHealth(): Promise<HealthStatus> {
    if (!this.initialized) {
      throw new Error('Kiro SDK not initialized. Call connect() first.');
    }
    
    return await this.connectionManager.checkHealth();
  }

  // Service Management
  registerService<T>(serviceName: string, serviceInstance: T): void {
    this.services.set(serviceName, serviceInstance);
    console.log(`📦 Registered service: ${serviceName}`);
  }

  getService<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found. Make sure it's registered.`);
    }
    return service as T;
  }

  listAvailableServices(): ServiceInfo[] {
    const status = this.getConnectionStatus();
    return status.servicesAvailable.map(serviceName => ({
      name: serviceName,
      version: '1.0.0', // TODO: Get from server
      status: 'available' as const,
      endpoints: [], // TODO: Get from server
      capabilities: [] // TODO: Get from server
    }));
  }

  // Event Management
  subscribe(eventType: string, callback: EventCallback): Subscription {
    return this.webSocketManager.subscribe(eventType, callback);
  }

  unsubscribe(subscription: Subscription): void {
    this.webSocketManager.unsubscribe(subscription);
  }

  // HTTP API Methods
  async get(endpoint: string): Promise<any> {
    const response = await this.connectionManager.makeRequest(endpoint, {
      method: 'GET'
    });
    return await response.json();
  }

  async post(endpoint: string, data?: any): Promise<any> {
    const response = await this.connectionManager.makeRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
    return await response.json();
  }

  async put(endpoint: string, data?: any): Promise<any> {
    const response = await this.connectionManager.makeRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
    return await response.json();
  }

  async delete(endpoint: string): Promise<any> {
    const response = await this.connectionManager.makeRequest(endpoint, {
      method: 'DELETE'
    });
    return await response.json();
  }

  // WebSocket Methods
  sendMessage(data: any): void {
    this.webSocketManager.send(data);
  }

  isWebSocketConnected(): boolean {
    return this.webSocketManager.isConnected();
  }
}

// Default SDK instance
const defaultConfig: KiroSDKConfig = {
  apiUrl: import.meta.env.VITE_KIRO_API_URL || 'http://localhost:3001',
  wsUrl: import.meta.env.VITE_KIRO_WS_URL || 'ws://localhost:3001',
  projectId: import.meta.env.VITE_KIRO_PROJECT_ID || 'conceptpulse-mvp',
  timeout: 10000,
  retryPolicy: {
    maxAttempts: 3,
    backoffStrategy: 'exponential',
    initialDelay: 1000,
    maxDelay: 10000
  }
};

export const kiroSDK = new KiroSDK(defaultConfig);

// Auto-initialize if enabled
if (import.meta.env.VITE_KIRO_ENABLED === 'true') {
  kiroSDK.connect().catch(error => {
    console.error('❌ Failed to auto-initialize Kiro SDK:', error);
  });
}