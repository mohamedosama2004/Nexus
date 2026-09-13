/**
 * Safe projection of a User for crossing the server/client boundary.
 * Never includes passwordHash (or other server-only fields) in an RSC payload.
 */
export type PublicUser = {
  id: string;
  name: string;
  email: string;
  avatarFile: { storageKey: string } | null;
};

export function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarFile: user.avatarFile,
  };
}