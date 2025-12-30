/**
 * Core Kiro SDK Type Definitions
 * TypeScript interfaces for Kiro server integration
 */

// Configuration Types
export interface KiroSDKConfig {
  apiUrl: string;
  wsUrl: string;
  projectId: string;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  authentication?: AuthConfig;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay: number;
}

export interface AuthConfig {
  method: 'oauth' | 'jwt' | 'api-key';
  clientId?: string;
  clientSecret?: string;
  scope?: string[];
  tokenEndpoint?: string;
}

// Connection Types
export interface ConnectionStatus {
  connected: boolean;
  lastConnected?: Date;
  latency?: number;
  servicesAvailable: string[];
  errors?: ConnectionError[];
}

export interface ConnectionError {
  code: string;
  message: string;
  timestamp: Date;
  retryable: boolean;
}

export interface ServiceInfo {
  name: string;
  version: string;
  status: 'available' | 'degraded' | 'unavailable';
  endpoints: string[];
  capabilities: string[];
}

// Authentication Types
export interface Credentials {
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: KiroUser;
}

export interface KiroUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

// Event Types
export interface KiroEvent {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface EventCallback {
  (event: KiroEvent): void;
}

export interface Subscription {
  id: string;
  eventType: string;
  callback: EventCallback;
  unsubscribe(): void;
}

// Error Types
export enum KiroErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

export interface KiroError {
  type: KiroErrorType;
  message: string;
  code: string;
  details?: any;
  timestamp: Date;
  requestId?: string;
  service?: string;
  retryable: boolean;
}

// Health Types
export interface HealthStatus {
  server: string;
  database: string;
  services: string[];
  timestamp: string;
  uptime?: number;
}