import { WebSocket } from 'ws';
import crypto from 'crypto';

export interface ResidentialAgent {
  id: string;
  ws: WebSocket;
  ip: string;
  country?: string;
  latency: number;
  lastSeen: Date;
}

class ResidentialMesh {
  private agents: Map<string, ResidentialAgent> = new Map();

  registerAgent(ws: WebSocket, ip: string): string {
    const id = crypto.randomUUID();
    const agent: ResidentialAgent = {
      id,
      ws,
      ip,
      latency: 0,
      lastSeen: new Date(),
    };
    
    this.agents.set(id, agent);
    console.log(`🏠 New Residential Agent registered: ${id} from ${ip}`);
    
    ws.on('close', () => {
      this.agents.delete(id);
      console.log(`🏠 Residential Agent disconnected: ${id}`);
    });

    ws.on('pong', () => {
      agent.lastSeen = new Date();
    });

    return id;
  }

  getAgents(): ResidentialAgent[] {
    return Array.from(this.agents.values());
  }

  getStats() {
    return {
      totalAgents: this.agents.size,
      online: Array.from(this.agents.values()).filter(a => a.ws.readyState === WebSocket.OPEN).length
    };
  }

  getRandomAgent(): ResidentialAgent | null {
    const agents = this.getAgents();
    if (agents.length === 0) return null;
    return agents[Math.floor(Math.random() * agents.length)];
  }

  async relayRequest(agent: ResidentialAgent, options: { url: string; method: string; headers: any; body?: any }): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();
      
      const timeout = setTimeout(() => {
        agent.ws.removeEventListener('message', handleResponse);
        reject(new Error('Proxy request timed out'));
      }, 30000);

      const handleResponse = (event: any) => {
        try {
          const data = JSON.parse(event.data.toString());
          if (data.type === 'proxy_response' && data.requestId === requestId) {
            clearTimeout(timeout);
            agent.ws.removeEventListener('message', handleResponse);
            resolve(data);
          }
        } catch (e) {}
      };

      agent.ws.addEventListener('message', handleResponse);

      agent.ws.send(JSON.stringify({
        type: 'proxy_request',
        requestId,
        ...options
      }));
    });
  }

  // Heartbeat to keep connections alive
  startHeartbeat() {
    setInterval(() => {
      this.agents.forEach((agent) => {
        if (agent.ws.readyState === WebSocket.OPEN) {
          agent.ws.ping();
        } else {
          this.agents.delete(agent.id);
        }
      });
    }, 30000);
  }
}

export const residentialMesh = new ResidentialMesh();
residentialMesh.startHeartbeat();
