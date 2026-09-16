const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

let authToken: string | null = typeof localStorage !== "undefined" ? localStorage.getItem("toktickit_token") : null;

export function getAuthToken(): string | null {
  if (typeof localStorage !== "undefined") {
    return authToken || localStorage.getItem("toktickit_token");
  }
  return authToken;
}

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (typeof localStorage !== "undefined") {
    if (token) {
      localStorage.setItem("toktickit_token", token);
    } else {
      localStorage.removeItem("toktickit_token");
    }
  }
}

function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...customHeaders };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR";
  mustChangePassword: boolean;
  isActive: boolean;
  department?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

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
  requesterId?: number;
  categoryId: number;
  relatedSystemId: number;
  requestedPriority: string;
  summary: string;
  description: string;
}

export interface Attachment {
  id: number;
  ticketId: number;
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadedByRequesterId: number;
  isRemoved: boolean;
  createdAt: string;
  removedAt?: string | null;
  removalReason?: string | null;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  category?: { id: number; name: string; code?: string };
  relatedSystem?: { id: number; name: string; code?: string };
  requester?: { id: number; name: string; email: string; department?: string };
  owner?: { id: number; name: string; email: string };
  itOwnerName?: string | null;
  requestedPriority: string;
  itPriority: string;
  status: string;
  summary: string;
  description: string;
  resolutionSummary?: string | null;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
}

export interface MyTicketsQueryParams {
  requesterId?: number;
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

export interface PublicComment {
  id: number;
  ticketId: number;
  authorId: number;
  body: string;
  content?: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface InternalNote {
  id: number;
  ticketId: number;
  authorId: number;
  body: string;
  content?: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface StaffTicketsQueryParams {
  search?: string;
  category?: string | number;
  priority?: string;
  status?: string;
  ownerId?: string | number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

export interface StaffTicketsResponse {
  data: Ticket[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UpdateStaffTicketInput {
  ownerId?: number | string | null;
  itPriority?: string;
  status?: string;
  resolutionSummary?: string;
}

export interface AdminUsersQueryParams {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface AdminUsersResponse {
  data: User[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CreateAdminUserInput {
  name: string;
  email: string;
  role: "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR";
  department?: string;
  initialPassword?: string;
}

export interface UpdateAdminUserInput {
  name?: string;
  email?: string;
  role?: "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR";
  isActive?: boolean;
  department?: string;
}

// ---------------------------------------------------------------------------
// Auth API Functions
// ---------------------------------------------------------------------------

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Login failed");
  }

  setAuthToken(json.token);
  return json;
}

export async function logoutApi(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
  }).catch(() => {});
  setAuthToken(null);
}

export async function fetchMeApi(): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to fetch user session");
  }

  return json.user;
}

export async function changePasswordApi(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to update password");
  }

  return json.user;
}

// ---------------------------------------------------------------------------
// Existing APIs (Updated to use getAuthHeaders & aliases)
// ---------------------------------------------------------------------------

export async function checkSystemStatus(): Promise<SystemStatus> {
  const res = await fetch(`${API_URL}/api/categories`, {
    headers: getAuthHeaders(),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  if (!res.ok) {
    throw new Error(`API returned status ${res.status}`);
  }

  const categories = await res.json();
  return { online: true, categories };
}

export async function fetchDevelopmentRequesters(): Promise<DevelopmentRequester[]> {
  const res = await fetch(`${API_URL}/api/requesters`, {
    headers: getAuthHeaders(),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to fetch requesters");
  }

  return json.data;
}

export const fetchActiveRequesters = fetchDevelopmentRequesters;

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/api/categories`, {
    headers: getAuthHeaders(),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to fetch categories");
  }

  return Array.isArray(json) ? json : (json.data || []);
}

export async function fetchRelatedSystems(): Promise<RelatedSystem[]> {
  const res = await fetch(`${API_URL}/api/related-systems`, {
    headers: getAuthHeaders(),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to fetch related systems");
  }

  return Array.isArray(json) ? json : (json.data || []);
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const customHeaders: Record<string, string> = { "Content-Type": "application/json" };
  if (input.requesterId) {
    customHeaders["X-Requester-Id"] = String(input.requesterId);
  }

  const res = await fetch(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: getAuthHeaders(customHeaders),
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
  requesterId?: number
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);
  if (requesterId) {
    formData.append("requesterId", String(requesterId));
  }

  const customHeaders: Record<string, string> = {};
  if (requesterId) {
    customHeaders["X-Requester-Id"] = String(requesterId);
  }

  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/attachments`, {
    method: "POST",
    headers: getAuthHeaders(customHeaders),
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
  if (params.requesterId) query.set("requesterId", String(params.requesterId));
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.priority) query.set("priority", params.priority);
  if (params.status) query.set("status", params.status);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  const customHeaders: Record<string, string> = {};
  if (params.requesterId) {
    customHeaders["X-Requester-Id"] = String(params.requesterId);
  }

  const res = await fetch(`${API_URL}/api/tickets?${query.toString()}`, {
    headers: getAuthHeaders(customHeaders),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to fetch tickets");
  }

  return json;
}

export async function fetchTicketDetail(
  ticketId: number,
  requesterId?: number
): Promise<Ticket> {
  const query = requesterId ? `?requesterId=${requesterId}` : "";
  const customHeaders: Record<string, string> = {};
  if (requesterId) {
    customHeaders["X-Requester-Id"] = String(requesterId);
  }

  const res = await fetch(
    `${API_URL}/api/tickets/${ticketId}${query}`,
    {
      headers: getAuthHeaders(customHeaders),
    }
  ).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to fetch ticket detail");
  }

  return json.data;
}

export async function softRemoveAttachment(
  attachmentId: number,
  removalReason: string,
  requesterId?: number
): Promise<Attachment> {
  const customHeaders: Record<string, string> = { "Content-Type": "application/json" };
  if (requesterId) {
    customHeaders["X-Requester-Id"] = String(requesterId);
  }

  const res = await fetch(`${API_URL}/api/attachments/${attachmentId}/remove`, {
    method: "PATCH",
    headers: getAuthHeaders(customHeaders),
    body: JSON.stringify({
      removalReason,
      requesterId,
    }),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to remove attachment");
  }

  return json.data;
}

export function getAttachmentDownloadUrl(
  attachmentId: number,
  requesterId?: number
): string {
  const query = requesterId ? `?requesterId=${requesterId}` : "";
  return `${API_URL}/api/attachments/${attachmentId}/download${query}`;
}

// ---------------------------------------------------------------------------
// Lab 3 IT Staff Queue & Workflow API Functions
// ---------------------------------------------------------------------------

export async function fetchStaffTickets(
  params: StaffTicketsQueryParams
): Promise<StaffTicketsResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", String(params.category));
  if (params.priority) query.set("priority", params.priority);
  if (params.status) query.set("status", params.status);
  if (params.ownerId !== undefined && params.ownerId !== null) {
    query.set("ownerId", String(params.ownerId));
  }
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  const res = await fetch(`${API_URL}/api/staff/tickets?${query.toString()}`, {
    headers: getAuthHeaders(),
  }).catch((err: any) => {
    throw new Error(err?.message || "Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to fetch staff tickets");
  }

  return json;
}

export async function updateStaffTicket(
  ticketId: number,
  input: UpdateStaffTicketInput
): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/staff/tickets/${ticketId}`, {
    method: "PATCH",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(input),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to update ticket");
  }

  return json.data;
}

// ---------------------------------------------------------------------------
// Lab 3 Public Comments & Internal Notes API Functions
// ---------------------------------------------------------------------------

export async function fetchPublicComments(ticketId: number): Promise<PublicComment[]> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/public-comments`, {
    headers: getAuthHeaders(),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to fetch public comments");
  }

  return json.data;
}

export async function postPublicComment(
  ticketId: number,
  body: string
): Promise<PublicComment> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/public-comments`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ body }),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to post comment");
  }

  return json.data;
}

export async function fetchInternalNotes(ticketId: number): Promise<InternalNote[]> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/internal-notes`, {
    headers: getAuthHeaders(),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to fetch internal notes");
  }

  return json.data;
}

export async function postInternalNote(
  ticketId: number,
  body: string
): Promise<InternalNote> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/internal-notes`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ body }),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to post internal note");
  }

  return json.data;
}

export async function resolveTicketByRequester(ticketId: number): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/resolve`, {
    method: "POST",
    headers: getAuthHeaders(),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to resolve ticket");
  }

  return json.data;
}

// ---------------------------------------------------------------------------
// Lab 3 Administrator User Management API Functions
// ---------------------------------------------------------------------------

export async function fetchAdminUsers(
  params: AdminUsersQueryParams
): Promise<AdminUsersResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (params.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  const res = await fetch(`${API_URL}/api/admin/users?${query.toString()}`, {
    headers: getAuthHeaders(),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to fetch users");
  }

  return json;
}

export async function createAdminUser(input: CreateAdminUserInput): Promise<User> {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(input),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to create user");
  }

  return json.data;
}

export async function updateAdminUser(
  userId: number,
  input: UpdateAdminUserInput
): Promise<User> {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(input),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to update user");
  }

  return json.data;
}

export async function resetAdminUserPassword(
  userId: number,
  newPassword?: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}/reset-password`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ newPassword }),
  }).catch(() => {
    throw new Error("Unable to connect to TokTickIT API");
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || "Failed to reset password");
  }

  return json;
}
