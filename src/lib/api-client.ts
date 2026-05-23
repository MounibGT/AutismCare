/**
 * API Client Utility
 * Provides helper functions for making API calls with proper error handling
 */

import type { AppointmentResponse } from "@/types/api";

interface FetchOptions extends RequestInit {
  data?: any;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = "/api") {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {},
  ): Promise<T> {
    const { data, ...fetchOptions } = options;

    const config: RequestInit = {
      ...fetchOptions,
      credentials: 'include', // Include cookies for session authentication
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        let errorMessage = "An error occurred";
        try {
          const text = await response.text();
          if (text) {
            const error = JSON.parse(text);
            errorMessage = error.error || error.message || errorMessage;
          } else {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  }

  // GET request
  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", data });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", data });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: FetchOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", data });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Specific API functions for common operations

// Auth
export const authAPI = {
  signup: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    language?: string;
    location?: string;
    // Medical Profile fields
    concernedPerson?: string;
    medicalConditions?: string[];
    currentMedications?: string[];
    allergies?: string[];
    substanceUse?: string;
    previousTherapy?: boolean;
    previousTherapyDetails?: string;
    psychiatricHospitalization?: boolean;
    currentTreatment?: string;
    diagnosedConditions?: string[];
    primaryIssue?: string;
    secondaryIssues?: string[];
    issueDescription?: string;
    severity?: string;
    duration?: string;
    triggeringSituation?: string;
    symptoms?: string[];
    dailyLifeImpact?: string;
    sleepQuality?: string;
    appetiteChanges?: string;
    treatmentGoals?: string[];
    therapyApproach?: string[];
    concernsAboutTherapy?: string;
    availability?: string[];
    modality?: string;
    sessionFrequency?: string;
    notes?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    crisisPlan?: string;
    suicidalThoughts?: boolean;
    preferredGender?: string;
    preferredAge?: string;
    languagePreference?: string;
    culturalConsiderations?: string;
    // Professional fields
    professionalProfile?: {
      problematics?: string[];
      approaches?: string[];
      ageCategories?: string[];
      skills?: string[];
      bio?: string;
      yearsOfExperience?: number;
      specialty?: string;
      license?: string;
      certifications?: string[];
      availability?: {
        days: {
          day: string;
          isWorkDay: boolean;
          startTime: string;
          endTime: string;
        }[];
        sessionDurationMinutes?: number;
        breakDurationMinutes?: number;
        firstDayOfWeek?: string;
      };
      languages?: string[];
      sessionTypes?: string[];
      modalities?: string[];
      paymentAgreement?: string;
      pricing?: {
        individualSession?: number;
        coupleSession?: number;
        groupSession?: number;
      };
      education?: {
        degree: string;
        institution: string;
        year?: number;
      }[];
    };
  }) => apiClient.post("/auth/signup", data),
  verifyEmail: (code: string, email: string) =>
    apiClient.post("/auth/verify", { code, email }),
};

// Profile
export const profileAPI = {
  get: async () => {
    try {
      return await apiClient.get("/profile");
    } catch (error: any) {
      if (error.message === "Profile not found") {
        return null;
      }
      throw error;
    }
  },
  getById: (id: string) => apiClient.get(`/profile/${id}`),
  update: (data: any) => apiClient.put("/profile", data),
};

// Medical Profile
export const medicalProfileAPI = {
  get: () => apiClient.get("/medical-profile"),
  getByUserId: (userId: string) => apiClient.get(`/medical-profile/${userId}`),
  update: (data: any) => apiClient.put("/medical-profile", data),
};

// Appointments
export const appointmentsAPI = {
  list: (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    clientId?: string;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get<AppointmentResponse[]>(
      `/appointments${query ? `?${query}` : ""}`,
    );
  },
  create: (data: any) =>
    apiClient.post<AppointmentResponse>("/appointments", data),
  get: (id: string) =>
    apiClient.get<AppointmentResponse>(`/appointments/${id}`),
  update: (id: string, data: any) =>
    apiClient.patch<AppointmentResponse>(`/appointments/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/appointments/${id}`),
};

// Users
export const usersAPI = {
  get: () => apiClient.get("/users/me"),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  update: (data: any) => apiClient.patch("/users/me", data),
  updateById: (id: string, data: any) => apiClient.patch(`/users/${id}`, data),
  list: (params?: { role?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/users${query ? `?${query}` : ""}`);
  },
};

// Clients
export const clientsAPI = {
  list: (params?: { status?: string; issueType?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/clients${query ? `?${query}` : ""}`);
  },
};
