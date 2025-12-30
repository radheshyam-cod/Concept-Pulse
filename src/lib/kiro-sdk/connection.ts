/**
 * Kiro SDK Connection Manager
 * Handles connections, retries, and connection pooling
 */

import { KiroSDKConfig, ConnectionStatus, RetryPolicy, HealthStatus } from './types';
import { KiroSDKError, isRetryableError } from './errors';

export class ConnectionManager {
  private config: KiroSDKConfig;
  private connectionStatus: ConnectionStatus;
  private retryPolicy: RetryPolicy;
  private connectionPool: Map<string, AbortController> = new Map();

  constructor(config: KiroSDKConfig) {
    this.config = config;
    this.retryPolicy = config.retryPolicy || {
      maxAttempts: 3,
      backoffStrategy: 'exponential',
      initialDelay: 1000,
      maxDelay: 10000
    };
    this.connectionStatus = {
      connected: false,
      servicesAvailable: [],
      errors: []
    };
  }

  async connect(): Promise<void> {
    try {
      console.log('🔌 Connecting to Kiro server:', this.config.apiUrl);
      
      // Test connection with health check
      const health = await this.checkHealth();
      
      this.connectionStatus = {
        connected: true,
        lastConnected: new Date(),
        servicesAvailable: health.services,
        errors: []
      };

      console.log('✅ Connected to Kiro server successfully');
      console.log('📊 Available services:', health.services);
    } catch (error) {
      console.error('❌ Failed to connect to Kiro server:', error);
      this.connectionStatus = {
        connected: false,
        servicesAvailable: [],
        errors: [
          {
            code: 'CONNECTION_FAILED',
            message: error instanceof Error ? error.message : 'Unknown connection error',
            timestamp: new Date(),
            retryable: true
          }
        ]
      };
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // Cancel all active requests
    for (const [, controller] of this.connectionPool) {
      controller.abort();
    }
    this.connectionPool.clear();

    this.connectionStatus = {
      connected: false,
      servicesAvailable: [],
      errors: []
    };

    console.log('🔌 Disconnected from Kiro server');
  }

  isConnected(): boolean {
    return this.connectionStatus.connected;
  }

  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  async checkHealth(): Promise<HealthStatus> {
    const response = await this.makeRequest('/kiro/health', {
      method: 'GET'
    });

    if (!response.ok) {
      throw KiroSDKError.fromResponse(response, 'health');
    }

    return await response.json();
  }

  async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    retries = 0
  ): Promise<Response> {
    const url = `${this.config.apiUrl}${endpoint}`;
    const timeout = this.config.timeout || 10000;

    // Create abort controller for this request
    const controller = new AbortController();
    const requestId = `${Date.now()}-${Math.random()}`;
    this.connectionPool.set(requestId, controller);

    // Set up timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);
      this.connectionPool.delete(requestId);

      // Handle non-2xx responses
      if (!response.ok) {
        const error = KiroSDKError.fromResponse(response);
        
        // Retry if retryable and we haven't exceeded max attempts
        if (error.retryable && retries < this.retryPolicy.maxAttempts) {
          const delay = this.calculateDelay(retries);
          console.warn(`⚠️ Request failed, retrying in ${delay}ms (attempt ${retries + 1}/${this.retryPolicy.maxAttempts})`);
          
          await this.sleep(delay);
          return this.makeRequest(endpoint, options, retries + 1);
        }

        throw error;
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      this.connectionPool.delete(requestId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw KiroSDKError.timeoutError(`Request timeout after ${timeout}ms`, timeout);
      }

      // Retry if retryable error and we haven't exceeded max attempts
      if (isRetryableError(error as Error) && retries < this.retryPolicy.maxAttempts) {
        const delay = this.calculateDelay(retries);
        console.warn(`⚠️ Request failed, retrying in ${delay}ms (attempt ${retries + 1}/${this.retryPolicy.maxAttempts})`);
        
        await this.sleep(delay);
        return this.makeRequest(endpoint, options, retries + 1);
      }

      throw error;
    }
  }

  private calculateDelay(attempt: number): number {
    const { backoffStrategy, initialDelay, maxDelay } = this.retryPolicy;

    let delay: number;
    switch (backoffStrategy) {
      case 'linear':
        delay = initialDelay * (attempt + 1);
        break;
      case 'exponential':
        delay = initialDelay * Math.pow(2, attempt);
        break;
      case 'fixed':
      default:
        delay = initialDelay;
        break;
    }

    return Math.min(delay, maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}