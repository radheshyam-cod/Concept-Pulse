/**
 * Kiro SDK Error Handling
 * Centralized error management for Kiro server integration
 */

import { KiroError, KiroErrorType } from './types';

export class KiroSDKError extends Error {
  public readonly type: KiroErrorType;
  public readonly code: string;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  public readonly service?: string;
  public readonly retryable: boolean;

  constructor(error: KiroError) {
    super(error.message);
    this.name = 'KiroSDKError';
    this.type = error.type;
    this.code = error.code;
    this.details = error.details;
    this.timestamp = error.timestamp;
    this.requestId = error.requestId;
    this.service = error.service;
    this.retryable = error.retryable;
  }

  static fromResponse(response: Response, service?: string): KiroSDKError {
    const error: KiroError = {
      type: KiroErrorType.API_ERROR,
      message: `API Error: ${response.status} ${response.statusText}`,
      code: `HTTP_${response.status}`,
      timestamp: new Date(),
      service,
      retryable: response.status >= 500 || response.status === 429
    };

    return new KiroSDKError(error);
  }

  static connectionError(message: string, details?: any): KiroSDKError {
    const error: KiroError = {
      type: KiroErrorType.CONNECTION_ERROR,
      message,
      code: 'CONNECTION_FAILED',
      details,
      timestamp: new Date(),
      retryable: true
    };

    return new KiroSDKError(error);
  }

  static authenticationError(message: string, details?: any): KiroSDKError {
    const error: KiroError = {
      type: KiroErrorType.AUTHENTICATION_ERROR,
      message,
      code: 'AUTH_FAILED',
      details,
      timestamp: new Date(),
      retryable: false
    };

    return new KiroSDKError(error);
  }

  static timeoutError(message: string, timeout: number): KiroSDKError {
    const error: KiroError = {
      type: KiroErrorType.TIMEOUT_ERROR,
      message,
      code: 'REQUEST_TIMEOUT',
      details: { timeout },
      timestamp: new Date(),
      retryable: true
    };

    return new KiroSDKError(error);
  }

  static serviceUnavailable(service: string): KiroSDKError {
    const error: KiroError = {
      type: KiroErrorType.SERVICE_UNAVAILABLE,
      message: `Service ${service} is currently unavailable`,
      code: 'SERVICE_UNAVAILABLE',
      service,
      timestamp: new Date(),
      retryable: true
    };

    return new KiroSDKError(error);
  }
}

export const isRetryableError = (error: Error): boolean => {
  if (error instanceof KiroSDKError) {
    return error.retryable;
  }
  return false;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof KiroSDKError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};