import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import type {
  AdminStats,
  LoginResponse,
  User,
  Listing,
  ListingsResponse,
  Report,
  ReportsResponse,
  LocationReference,
  AppVersion,
  MarketingPayload,
  NotificationsResponse,
  Category,
  MeasurementUnit,
  ProductType,
  AuditLogsResponse,
} from "@/lib/types";

const TOKEN_COOKIE = "soukelfellah_access_token";
const REFRESH_TOKEN_COOKIE = "soukelfellah_refresh_token";
const USER_COOKIE = "soukelfellah_user";

export const cookieNames = { token: TOKEN_COOKIE, refresh: REFRESH_TOKEN_COOKIE, user: USER_COOKIE };

export async function getServerUser() {
  const jar = await cookies();
  const raw = jar.get(USER_COOKIE)?.value;
  const token = jar.get(TOKEN_COOKIE)?.value;
  let cookieUser: User | null = null;

  if (raw) {
    try {
      cookieUser = JSON.parse(decodeURIComponent(raw));
    } catch {
      cookieUser = null;
    }
  }

  if (token) {
    try {
      const response = await axios.get<User | { success: boolean; data: User }>(
        backendUrl("/api/users/me"),
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = "data" in response.data ? response.data.data : response.data;
      return data as User;
    } catch {
      return cookieUser;
    }
  }

  return cookieUser;
}

export async function setAuthCookies(response: LoginResponse) {
  try {
    const jar = await cookies();
    jar.set(TOKEN_COOKIE, response.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
    jar.set(REFRESH_TOKEN_COOKIE, response.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
    jar.set(USER_COOKIE, encodeURIComponent(JSON.stringify(response.user)), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    // Ignore error in Server Components
  }
}

export async function setUserCookie(user: User) {
  try {
    const jar = await cookies();
    jar.set(USER_COOKIE, encodeURIComponent(JSON.stringify(user)), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    // Ignore error in Server Components
  }
}

export async function clearAuthCookies() {
  try {
    const jar = await cookies();
    jar.delete(TOKEN_COOKIE);
    jar.delete(REFRESH_TOKEN_COOKIE);
    jar.delete(USER_COOKIE);
  } catch (error) {
    // Ignore error in Server Components
  }
}

export async function logout() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    try {
      await axios.post(backendUrl("/api/auth/logout"), { refreshToken });
    } catch {}
  }
  await clearAuthCookies();
}

async function refreshAuthToken(): Promise<string | null> {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) return null;

  try {
    const response = await axios.post<{ data: { accessToken: string } } | { accessToken: string }>(
      backendUrl("/api/auth/refresh"),
      { refreshToken }
    );
    const data = response.data;
    const accessToken = "data" in data ? data.data.accessToken : data.accessToken;
    try {
      jar.set(TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      });
    } catch (e) {
      // Ignore error in Server Components
    }
    return accessToken;
  } catch {
    return null;
  }
}

function backendUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
  return `${base.replace(/\/$/, "")}${path}`;
}

async function authHeaders() {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function executeWithAuthRetry<T>(
  requestFn: (headers: any) => Promise<T>
): Promise<T> {
  try {
    const headers = await authHeaders();
    return await requestFn(headers);
  } catch (error) {
    if ((error as AxiosError).response?.status === 401) {
      const newToken = await refreshAuthToken();
      if (newToken) {
        return await requestFn({ Authorization: `Bearer ${newToken}` });
      }
      await clearAuthCookies();
    }
    throw error;
  }
}

async function backendGet<T>(path: string): Promise<T> {
  return executeWithAuthRetry(async (headers) => {
    const response = await axios.get<T>(backendUrl(path), { headers });
    return response.data;
  });
}

function withSearchParams(path: string, params?: URLSearchParams) {
  if (!params || !params.toString()) return path;
  return `${path}?${params.toString()}`;
}

async function backendPost<T>(
  path: string,
  body: unknown,
  withAuth = true,
): Promise<T> {
  if (!withAuth) {
    try {
      const response = await axios.post<T>(backendUrl(path), body);
      return response.data;
    } catch (error) {
      if ((error as AxiosError).response?.status === 401)
        await clearAuthCookies();
      throw error;
    }
  }

  return executeWithAuthRetry(async (headers) => {
    const response = await axios.post<T>(backendUrl(path), body, { headers });
    return response.data;
  });
}

async function backendPut<T>(path: string, body: unknown): Promise<T> {
  return executeWithAuthRetry(async (headers) => {
    const response = await axios.put<T>(backendUrl(path), body, { headers });
    return response.data;
  });
}

async function backendPatch<T>(path: string, body: unknown): Promise<T> {
  return executeWithAuthRetry(async (headers) => {
    const response = await axios.patch<T>(backendUrl(path), body, { headers });
    return response.data;
  });
}

async function backendDelete<T>(path: string): Promise<T> {
  return executeWithAuthRetry(async (headers) => {
    const response = await axios.delete<T>(backendUrl(path), { headers });
    return response.data;
  });
}

// Authentication
export async function login(body: { phone: string; password: string }) {
  const response = await backendPost<{ success: boolean; data: LoginResponse }>(
    "/api/auth/login",
    body,
    false
  );
  return response.data;
}

export async function getCurrentUser() {
  const response = await backendGet<User | { success: boolean; data: User }>("/api/users/me");
  const data = "data" in response ? response.data : response;
  await setUserCookie(data as User);
  return data as User;
}

// Admin Stats
export async function getAdminStats(): Promise<AdminStats> {
  const response = await backendGet<{ success: boolean; data: AdminStats }>("/api/users/stats");
  return response.data;
}

// Users
export async function getUsers(params?: URLSearchParams) {
  const response = await backendGet<{ success: boolean; data: User[]; meta: any }>(
    withSearchParams("/api/users", params)
  );
  return response;
}

export async function banUser(userId: string) {
  return backendPut(`/api/users/${userId}/ban`, {});
}

export async function activateUser(userId: string) {
  return backendPut(`/api/users/${userId}/activate`, {});
}

// Listings
export async function getListings(params?: URLSearchParams): Promise<ListingsResponse> {
  return backendGet<ListingsResponse>(withSearchParams("/api/listings", params));
}

export async function updateListing(listingId: string, body: unknown): Promise<any> {
  return backendPut(`/api/listings/${listingId}`, body);
}

export async function deleteListing(listingId: string): Promise<any> {
  return backendDelete(`/api/listings/${listingId}`);
}

// Reports
export async function getReports(params?: URLSearchParams): Promise<ReportsResponse> {
  return backendGet<ReportsResponse>(withSearchParams("/api/reports", params));
}

export async function updateReportStatus(reportId: string, status: "PENDING" | "RESOLVED" | "DISMISSED"): Promise<any> {
  return backendPatch(`/api/reports/${reportId}`, { status });
}

// Locations
export async function getLocations(params?: URLSearchParams): Promise<{ success: boolean; data: LocationReference[] }> {
  return backendGet(withSearchParams("/api/locations", params));
}

export async function createLocation(body: unknown): Promise<any> {
  return backendPost("/api/locations", body);
}

export async function updateLocation(locationId: string, body: unknown): Promise<any> {
  return backendPut(`/api/locations/${locationId}`, body);
}

export async function deleteLocation(locationId: string): Promise<any> {
  return backendDelete(`/api/locations/${locationId}`);
}

// Marketing Notifications
export async function sendMarketingNotification(payload: MarketingPayload) {
  return backendPost("/api/notifications/marketing", payload);
}

export async function getSentNotifications(params?: URLSearchParams): Promise<NotificationsResponse> {
  return backendGet(withSearchParams("/api/notifications/sent", params));
}

// App Versioning
export async function getAppVersions(params?: URLSearchParams): Promise<{ success: boolean; data: AppVersion[] }> {
  return backendGet(withSearchParams("/api/app-versions", params));
}

export async function createAppVersion(body: unknown): Promise<any> {
  return backendPost("/api/app-versions", body);
}

export async function updateAppVersion(versionId: string, body: unknown): Promise<any> {
  return backendPut(`/api/app-versions/${versionId}`, body);
}

export async function deleteAppVersion(versionId: string): Promise<any> {
  return backendDelete(`/api/app-versions/${versionId}`);
}

export async function getAuditLogs(params?: URLSearchParams): Promise<AuditLogsResponse> {
  return backendGet<AuditLogsResponse>(withSearchParams("/api/audit-logs", params));
}

export async function getCategories(params?: URLSearchParams): Promise<Category[]> {
  const response = await backendGet<Category[] | { success: boolean; data: Category[] }>(
    withSearchParams("/api/categories", params)
  );
  return Array.isArray(response) ? response : (response as any).data;
}

export async function createCategory(body: unknown): Promise<Category> {
  const response = await backendPost<Category | { success: boolean; data: Category }>(
    "/api/categories",
    body
  );
  return "data" in response ? (response as any).data : response;
}

export async function updateCategory(categoryId: string, body: unknown): Promise<Category> {
  const response = await backendPut<Category | { success: boolean; data: Category }>(
    `/api/categories/${categoryId}`,
    body
  );
  return "data" in response ? (response as any).data : response;
}

export async function getMeasurementUnits(params?: URLSearchParams): Promise<MeasurementUnit[]> {
  const response = await backendGet<MeasurementUnit[] | { success: boolean; data: MeasurementUnit[] }>(
    withSearchParams("/api/measurement-units", params)
  );
  return Array.isArray(response) ? response : (response as any).data;
}

export async function createMeasurementUnit(body: unknown): Promise<MeasurementUnit> {
  const response = await backendPost<MeasurementUnit | { success: boolean; data: MeasurementUnit }>(
    "/api/measurement-units",
    body
  );
  return "data" in response ? (response as any).data : response;
}

export async function getProductTypes(params?: URLSearchParams): Promise<ProductType[]> {
  const response = await backendGet<ProductType[] | { success: boolean; data: ProductType[] }>(
    withSearchParams("/api/product-types", params)
  );
  return Array.isArray(response) ? response : (response as any).data;
}

export async function createProductType(body: unknown): Promise<ProductType> {
  const response = await backendPost<ProductType | { success: boolean; data: ProductType }>(
    "/api/product-types",
    body
  );
  return "data" in response ? (response as any).data : response;
}

export async function deleteCategory(id: string): Promise<void> {
  await backendDelete(`/api/categories/${id}`);
}

export async function updateMeasurementUnit(id: string, body: unknown): Promise<MeasurementUnit> {
  const response = await backendPut<MeasurementUnit | { success: boolean; data: MeasurementUnit }>(
    `/api/measurement-units/${id}`,
    body
  );
  return "data" in response ? (response as any).data : response;
}

export async function deleteMeasurementUnit(id: string): Promise<void> {
  await backendDelete(`/api/measurement-units/${id}`);
}

export async function updateProductType(id: string, body: unknown): Promise<ProductType> {
  const response = await backendPut<ProductType | { success: boolean; data: ProductType }>(
    `/api/product-types/${id}`,
    body
  );
  return "data" in response ? (response as any).data : response;
}

export async function deleteProductType(id: string): Promise<void> {
  await backendDelete(`/api/product-types/${id}`);
}

export async function uploadFiles(formData: FormData) {
  return executeWithAuthRetry(async (headers) => {
    const response = await axios.post(
      backendUrl("/api/files/upload"),
      formData,
      {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  });
}

export async function deleteFile(id: string): Promise<void> {
  await backendDelete(`/api/files/${id}`);
}
