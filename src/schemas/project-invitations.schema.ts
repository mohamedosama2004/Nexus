import { z } from "zod";

export const createProjectInvitationSchema = z.object({
  email: z.string().email("Invalid email address."),
  role: z.enum(["MEMBER", "OWNER"]).default("MEMBER"),
});
