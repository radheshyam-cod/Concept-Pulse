/**
 * Real Kiro IDE Client
 * Connects to actual Kiro IDE services and APIs
 */

import { supabase } from './supabase';

// Kiro IDE Configuration
interface KiroConfig {
  apiUrl: string;
  wsUrl: string;
  projectId: string;
}

// Real Kiro IDE Client
export class KiroIDEClient {
  private config: KiroConfig;
  private ws: WebSocket | null = null;
  public authenticated = false; // Public for debugging

  constructor(config: KiroConfig) {
    this.config = config;
  }

  // Authentication (Simplified for MVP integration)
  async authenticate(token?: string): Promise<boolean> {
    try {
      // We are just verifying connectivity and "logging in"
      const response = await fetch(`${this.config.apiUrl}/kiro/health`);
      if (response.ok) {
        this.authenticated = true;
        this.connectWebSocket();
        console.log('✅ Connected to Kiro Server');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Kiro Connection Failed:', error);
      return false;
    }
  }

  // WebSocket connection
  private connectWebSocket(): void {
    try {
      this.ws = new WebSocket(this.config.wsUrl);
      this.ws.onopen = () => console.log('✅ WS Connected');
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        window.dispatchEvent(new CustomEvent('kiro-update', { detail: data }));
      };
    } catch (e) {
      console.error('WS Error', e);
    }
  }

  // Generic API call
  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.apiUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }

  // 🔹 Planning Service
  async getPlans() { return this.apiCall('/kiro/plans'); }
  async createPlan(data: any) { return this.apiCall('/kiro/plans', { method: 'POST', body: JSON.stringify(data) }); }
  async getPlan(id: string) { return this.apiCall(`/kiro/plans/${id}`); }
  async updatePlan(id: string, data: any) { return this.apiCall(`/kiro/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deletePlan(id: string) { return this.apiCall(`/kiro/plans/${id}`, { method: 'DELETE' }); }

  // 🔹 Workflow Service
  async createWorkflow(planId: string, tasks: any[]) {
    return this.apiCall('/kiro/workflows', { method: 'POST', body: JSON.stringify({ planId, tasks }) });
  }
  async getWorkflow(planId: string) { return this.apiCall(`/kiro/workflows/${planId}`); }
  async moveTask(taskId: string, status: string) {
    return this.apiCall(`/kiro/workflows/${taskId}/move`, { method: 'PUT', body: JSON.stringify({ status }) });
  }

  // 🔹 Prototyping Service
  async setPrototypeMode(enabled: boolean) {
    return this.apiCall('/kiro/prototype/session', { method: 'POST', body: JSON.stringify({ prototypeMode: enabled }) });
  }
  async getPrototypeStatus() { return this.apiCall('/kiro/prototype/status'); }

  // 🔹 Documentation Service
  async getArchitecture() { return fetch(`${this.config.apiUrl}/kiro/docs/architecture`).then(r => r.text()); }
  async getApis() { return fetch(`${this.config.apiUrl}/kiro/docs/apis`).then(r => r.text()); }
  async getStack() { return fetch(`${this.config.apiUrl}/kiro/docs/stack`).then(r => r.text()); }

  // 🔹 Health
  async getHealth() { return this.apiCall('/kiro/health'); }
  async getExecutionStatus() { return this.apiCall('/kiro/execution/status'); }
}

const defaultConfig: KiroConfig = {
  apiUrl: 'http://localhost:3001',
  wsUrl: 'ws://localhost:3001',
  projectId: 'conceptpulse-mvp'
};

export const kiroClient = new KiroIDEClient(defaultConfig);
export const initializeKiroIDE = async () => kiroClient.authenticate();