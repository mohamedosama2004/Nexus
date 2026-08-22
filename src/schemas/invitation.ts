import { z } from "zod";

export const createInvitationSchema = z.object({
  email: z.email(),
  workspaceId: z.string().min(1).optional(),
  role: z.enum(["MEMBER", "ADMIN", "OWNER"]),
});

export type CreateInvitationInput = z.infer<
  typeof createInvitationSchema
>;
