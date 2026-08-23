const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Category {
  id: number;
  name: string;
}

export interface RelatedSystem {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

export interface DevelopmentRequester {
  id: number;
  name: string;
  email: string;
  department: string;
  isActive: boolean;
}

export interface CreateTicketInput {
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  requestedPriority: string;
  summary: string;
  description: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  category?: { id: number; name: string };
  relatedSystem?: { id: number; name: string };
  requestedPriority: string;
  itPriority: string;
  status: string;
  summary: string;
  description: string;
  itOwnerName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyTicketsQueryParams {
  requesterId: number;
  search?: string;
  category?: string;
  priority?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

export interface MyTicketsResponse {
  data: Ticket[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export async function checkSystem(): Promise<SystemStatus> {
  const healthRes = await fetch(`${API_URL}/api/health`).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  if (!healthRes.ok) {
    throw new Error("Unable to connect to TokTickIT API");
  }

  const categoriesRes = await fetch(`${API_URL}/api/categories`).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  if (!categoriesRes.ok) {
    throw new Error("Unable to connect to TokTickIT API");
  }

  const categories: Category[] = await categoriesRes.json();
  return { online: true, categories };
}

export async function fetchActiveRequesters(): Promise<DevelopmentRequester[]> {
  const res = await fetch(`${API_URL}/api/requesters`).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  if (!res.ok) {
    throw new Error("Failed to load Development Requesters");
  }

  const json = await res.json();
  return Array.isArray(json) ? json : json.data || [];
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/api/categories`).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  if (!res.ok) {
    throw new Error("Failed to load Category list");
  }

  const json = await res.json();
  return Array.isArray(json) ? json : json.data || [];
}

export async function fetchRelatedSystems(): Promise<RelatedSystem[]> {
  const res = await fetch(`${API_URL}/api/related-systems`).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  if (!res.ok) {
    throw new Error("Failed to load Related Systems list");
  }

  const json = await res.json();
  return Array.isArray(json) ? json : json.data || [];
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requester-Id": String(input.requesterId),
    },
    body: JSON.stringify(input),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to create ticket");
  }

  return json.data;
}

export async function uploadAttachment(
  ticketId: number,
  file: File,
  requesterId: number
): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("requesterId", String(requesterId));

  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/attachments`, {
    method: "POST",
    headers: {
      "X-Requester-Id": String(requesterId),
    },
    body: formData,
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to upload attachment");
  }

  return json.data;
}

export async function fetchMyTickets(
  params: MyTicketsQueryParams
): Promise<MyTicketsResponse> {
  const query = new URLSearchParams();
  query.set("requesterId", String(params.requesterId));
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.priority) query.set("priority", params.priority);
  if (params.status) query.set("status", params.status);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  const res = await fetch(`${API_URL}/api/tickets?${query.toString()}`, {
    headers: {
      "X-Requester-Id": String(params.requesterId),
    },
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to fetch tickets");
  }

  return json;
}
