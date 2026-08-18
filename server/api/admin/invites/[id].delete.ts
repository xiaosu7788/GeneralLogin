import { createError } from "h3";
import { requireAdminUser } from "~/server/utils/auth";
import { prisma } from "~/server/utils/prisma";
import { writeAuditLog } from "~/server/utils/audit";

export default defineEventHandler(async (event) => {
  const admin = await requireAdminUser(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "缺少邀请码 ID" });
  }

  const invite = await prisma.inviteCode.findUnique({
    where: { id },
    select: { id: true, label: true }
  });

  if (!invite) {
    throw createError({ statusCode: 404, statusMessage: "邀请码不存在" });
  }

  await prisma.inviteCode.delete({ where: { id } });

  await writeAuditLog({
    actorId: admin.profile.id,
    action: "admin.invite.deleted",
    targetType: "InviteCode",
    targetId: invite.id,
    metadata: { label: invite.label }
  });

  return { ok: true };
});
