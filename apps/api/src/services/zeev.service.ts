import axios, { AxiosError } from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ZeevApiError } from '../utils/errors.js';
import { mapToZeevCreateInstance } from '../config/zeev.mapping.js';
import type { User, Category, Priority, Ticket } from '../models/types.js';

export interface CreateTicketPayload {
  requester: User;
  category: Category;
  priority: Priority;
  urgency?: string;
  description: string;
  channel: string;
  metadata?: Record<string, unknown>;
}

export class ZeevService {
  async createTicket(payload: CreateTicketPayload): Promise<Ticket> {
    if (env.MOCK_MODE) {
      return this.createMockTicket();
    }
    
    return this.createRealTicket(payload);
  }

  private createMockTicket(): Ticket {
    const protocol = `ZEEV-MOCK-${Date.now().toString().padStart(6, '0')}`;
    const id = `mock-${Date.now()}`;
    
    logger.info('Creating mock ticket', { protocol, id });
    
    return {
      protocol,
      id,
      rawResponse: { mock: true, protocol, id },
    };
  }

  private async createRealTicket(payload: CreateTicketPayload): Promise<Ticket> {
    if (!env.ZEEV_BASE_URL || !env.ZEEV_TOKEN || !env.ZEEV_PROCESS_ID) {
      throw new ZeevApiError(
        'Zeev configuration incomplete. ZEEV_BASE_URL, ZEEV_TOKEN, and ZEEV_PROCESS_ID are required when MOCK_MODE=false'
      );
    }

    try {
      // Map payload to Zeev format
      const zeevPayload = mapToZeevCreateInstance(payload);
      
      // Build endpoint URL
      const endpoint = env.ZEEV_ENDPOINT_CREATE_INSTANCE.replace(
        '{processId}',
        env.ZEEV_PROCESS_ID!
      );
      const url = `${env.ZEEV_BASE_URL}${endpoint}`;
      
      logger.info('Creating ticket in Zeev', { url, processId: env.ZEEV_PROCESS_ID });
      
      // Make request
      const response = await axios.post(url, zeevPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': env.ZEEV_TOKEN,
        },
        timeout: env.ZEEV_TIMEOUT_MS,
      });
      
      // Extract protocol and id from response
      // TODO: Adjust based on actual Zeev API response structure
      const protocol = response.data?.protocol || response.data?.id || `ZEEV-${Date.now()}`;
      const id = response.data?.id || response.data?.instanceId || String(Date.now());
      
      logger.info('Ticket created successfully', { protocol, id });
      
      return {
        protocol,
        id,
        rawResponse: response.data,
      };
    } catch (error) {
      logger.error('Error creating ticket in Zeev', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status || 500;
        const message = axiosError.response?.data 
          ? JSON.stringify(axiosError.response.data)
          : axiosError.message;
        
        throw new ZeevApiError(
          `Zeev API error (${status}): ${message}`,
          error
        );
      }
      
      throw new ZeevApiError('Unknown error creating ticket in Zeev', error);
    }
  }
}
