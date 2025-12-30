/**
 * Kiro SDK WebSocket Manager
 * Handles real-time communication with Kiro server
 */

import { KiroEvent, EventCallback, Subscription } from './types';
import { KiroSDKError } from './errors';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private subscriptions: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private shouldReconnect = true;

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
  }

  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;

    try {
      console.log('🔌 Connecting to Kiro WebSocket:', this.wsUrl);
      
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected to Kiro server');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        
        // Dispatch connection event
        this.dispatchEvent({
          id: `ws-${Date.now()}`,
          type: 'kiro:connected',
          source: 'websocket',
          timestamp: new Date().toISOString(),
          data: { status: 'connected' }
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);
          
          // Convert to KiroEvent format
          const kiroEvent: KiroEvent = {
            id: data.id || `ws-${Date.now()}`,
            type: data.type || 'unknown',
            source: 'kiro-server',
            timestamp: data.timestamp || new Date().toISOString(),
            data: data.data || data
          };

          this.dispatchEvent(kiroEvent);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        this.isConnecting = false;
        
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      this.isConnecting = false;
      console.error('❌ Failed to create WebSocket connection:', error);
      throw KiroSDKError.connectionError('Failed to establish WebSocket connection', error);
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.subscriptions.clear();
    console.log('🔌 WebSocket disconnected');
  }

  subscribe(eventType: string, callback: EventCallback): Subscription {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    
    this.subscriptions.get(eventType)!.add(callback);
    
    const subscriptionId = `${eventType}-${Date.now()}-${Math.random()}`;
    
    return {
      id: subscriptionId,
      eventType,
      callback,
      unsubscribe: () => {
        const callbacks = this.subscriptions.get(eventType);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            this.subscriptions.delete(eventType);
          }
        }
      }
    };
  }

  unsubscribe(subscription: Subscription): void {
    subscription.unsubscribe();
  }

  send(data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, cannot send message');
      return;
    }

    try {
      this.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('❌ Failed to send WebSocket message:', error);
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private dispatchEvent(event: KiroEvent): void {
    // Dispatch to specific event type subscribers
    const callbacks = this.subscriptions.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`❌ Error in event callback for ${event.type}:`, error);
        }
      });
    }

    // Dispatch to wildcard subscribers
    const wildcardCallbacks = this.subscriptions.get('*');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`❌ Error in wildcard event callback:`, error);
        }
      });
    }

    // Also dispatch as custom DOM event for compatibility
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kiro-update', { detail: event }));
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect().catch(error => {
          console.error('❌ WebSocket reconnect failed:', error);
        });
      }
    }, delay);
  }
}