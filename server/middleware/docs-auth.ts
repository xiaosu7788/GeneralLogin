import { createError, getRequestURL } from "h3";
import { requireAdminUser } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;
  if (pathname !== "/docs" && !pathname.startsWith("/docs/")) {
    return;
  }

  try {
    await requireAdminUser(event);
  } catch {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }
});
