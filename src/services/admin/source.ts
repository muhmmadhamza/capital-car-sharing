/** "mock" (default) or "api". Must be a NEXT_PUBLIC_ variable because it runs in the browser. */
export const isAdminApi = process.env.NEXT_PUBLIC_ADMIN_DATA_SOURCE === "api";
