import { auth, signOut } from "@/auth";
import { apiError, apiSuccess, createRequestId } from "@/lib/api";
import { writeAuditLog, clientIp } from "@/lib/audit";

export async function POST(request: Request) {
  const requestId = createRequestId();
  const session = await auth();
  const ip = clientIp(request.headers);
  const userAgent = request.headers.get("user-agent");

  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", "Authentication required", 401, requestId);
  }

  await writeAuditLog({
    userId: session.user.id,
    action: "user.logout",
    entity: "User",
    entityId: session.user.id,
    ip,
    userAgent,
  });

  await signOut({ redirect: false });

  return apiSuccess({ status: "logged_out" }, 200, requestId);
}
