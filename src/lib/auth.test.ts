import { describe, expect, it } from "vitest";

import { toPublicUser } from "./user";

describe("toPublicUser", () => {
  it("returns only the safe public fields", () => {
    const user = {
      id: "user_1",
      name: "Ada",
      email: "ada@example.com",
      avatarFile: { storageKey: "avatar/abc.png" },
    };

    expect(toPublicUser(user)).toEqual(user);
  });

  it("never leaks server-only fields onto the client boundary", () => {
    const fullUser = {
      id: "user_1",
      name: "Ada",
      email: "ada@example.com",
      avatarFile: null,
      passwordHash: "$2b$10$secret-hash",
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
    };

    const publicUser = toPublicUser(fullUser);

    expect(publicUser).toEqual({
      id: "user_1",
      name: "Ada",
      email: "ada@example.com",
      avatarFile: null,
    });
    expect(JSON.stringify(publicUser)).not.toContain("passwordHash");
    expect(JSON.stringify(publicUser)).not.toContain("secret-hash");
  });
});