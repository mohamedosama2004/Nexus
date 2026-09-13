import { describe, expect, it, vi } from "vitest";

vi.mock("./prisma", () => ({
  prisma: new Proxy(
    {},
    {
      get() {
        throw new Error("Database not available in unit tests");
      },
    },
  ),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get() {
      return undefined;
    },
  }),
}));

import {
  hasWorkspacePermission,
  hasProjectPermission,
} from "./authorization";
import { ProjectRole, Role } from "../generated/prisma/enums";

describe("hasWorkspacePermission", () => {
  it("grants OWNER every workspace permission", () => {
    expect(hasWorkspacePermission(Role.OWNER, "INVITE_MEMBER")).toBe(true);
    expect(hasWorkspacePermission(Role.OWNER, "DELETE_PROJECT")).toBe(true);
    expect(hasWorkspacePermission(Role.OWNER, "DELETE_TASK")).toBe(true);
  });

  it("grants ADMIN the same membership-management powers as OWNER", () => {
    expect(hasWorkspacePermission(Role.ADMIN, "INVITE_MEMBER")).toBe(true);
    expect(hasWorkspacePermission(Role.ADMIN, "DELETE_PROJECT")).toBe(true);
  });

  it("restricts MEMBER to task operations only", () => {
    expect(hasWorkspacePermission(Role.MEMBER, "CREATE_TASK")).toBe(true);
    expect(hasWorkspacePermission(Role.MEMBER, "UPDATE_TASK")).toBe(true);
    expect(hasWorkspacePermission(Role.MEMBER, "DELETE_TASK")).toBe(false);
    expect(hasWorkspacePermission(Role.MEMBER, "CREATE_PROJECT")).toBe(false);
    expect(hasWorkspacePermission(Role.MEMBER, "INVITE_MEMBER")).toBe(false);
  });
});

describe("hasProjectPermission", () => {
  it("grants the project OWNER full control", () => {
    expect(hasProjectPermission(ProjectRole.OWNER, "MANAGE_PROJECT_MEMBERS")).toBe(true);
    expect(hasProjectPermission(ProjectRole.OWNER, "DELETE_PROJECT")).toBe(true);
    expect(hasProjectPermission(ProjectRole.OWNER, "VIEW_PROJECT")).toBe(true);
  });

  it("restricts MEMBER to viewing and task work", () => {
    expect(hasProjectPermission(ProjectRole.MEMBER, "VIEW_PROJECT")).toBe(true);
    expect(hasProjectPermission(ProjectRole.MEMBER, "CREATE_TASK")).toBe(true);
    expect(hasProjectPermission(ProjectRole.MEMBER, "UPDATE_TASK")).toBe(true);
    expect(hasProjectPermission(ProjectRole.MEMBER, "DELETE_TASK")).toBe(false);
    expect(hasProjectPermission(ProjectRole.MEMBER, "DELETE_PROJECT")).toBe(false);
    expect(hasProjectPermission(ProjectRole.MEMBER, "MANAGE_PROJECT_MEMBERS")).toBe(false);
  });
});