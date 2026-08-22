"use client";

import { useCallback, useEffect, useState } from "react";
import { MembersHeader } from "./components/MembersHeader";
import { MembersList } from "./components/MembersList";
import { MembersSkeleton } from "./components/MembersSkeleton";
import { MembersError } from "./components/MembersError";
import { MembersEmpty } from "./components/MembersEmpty";
import { InviteMemberButton } from "./components/InviteMemberButton";
import type { Member } from "./types";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/workspaces/current/members");

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to load members.");
      }

      const data = await response.json();
      setMembers(data.members);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load members.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function load() {
      await fetchMembers();
    }

    load();
  }, [fetchMembers]);

  useEffect(() => {
    async function reload() {
      setLoading(true);
      setError(null);
      await fetchMembers();
    }

    window.addEventListener("workspace-change", reload);
    return () => window.removeEventListener("workspace-change", reload);
  }, [fetchMembers]);

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <MembersHeader
        count={loading || error ? null : members.length}
        action={<InviteMemberButton />}
      />

      {loading && <MembersSkeleton />}
      {!loading && error && <MembersError message={error} />}
      {!loading && !error && members.length === 0 && <MembersEmpty />}
      {!loading && !error && members.length > 0 && (
        <MembersList members={members} />
      )}
    </div>
  );
}
