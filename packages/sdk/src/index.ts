/**
 * Canonical LMS Typed SDK Client (PRD §6, BRAIN.md §4)
 */

export interface SdkConfig {
  baseUrl: string;
  organizationId?: string;
  token?: string;
}

export class LmsClient {
  private baseUrl: string;
  private organizationId?: string;
  private token?: string;

  constructor(config: SdkConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.organizationId = config.organizationId;
    this.token = config.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (this.organizationId) {
      headers.set('x-organization-id', this.organizationId);
    }
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => ({}))) as Record<string, any>;
      throw new Error(errorBody['detail'] || `Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ accessToken: string; refreshToken: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Organization endpoints
  async getCurrentOrganization() {
    return this.request<any>('/api/v1/organizations/current');
  }

  // Course endpoints
  async listCourses(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<any[]>(`/api/v1/courses${query}`);
  }

  // Enrollment & Progress endpoints
  async enroll(courseId: string) {
    return this.request<any>('/api/v1/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  }

  async updateProgress(lessonId: string, status: string, score?: number) {
    return this.request<any>(`/api/v1/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ status, score }),
    });
  }
}
