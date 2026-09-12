type UserAvatarProps = {
  name?: string | null;
  storageKey?: string | null;
  alt?: string;
  title?: string;
  className?: string;
  textClassName?: string;
  fallback?: "initial" | "initials";
};

function fallbackText(name: string, fallback: NonNullable<UserAvatarProps["fallback"]>) {
  const displayName = name.trim();

  if (fallback === "initials") {
    return (
      displayName
        .split(/\s+/)
        .map((part) => part[0] ?? "")
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    );
  }

  return (displayName[0] ?? "?").toUpperCase();
}

export function UserAvatar({
  name,
  storageKey,
  alt,
  title,
  className = "size-8 bg-primary/10 text-primary",
  textClassName = "text-xs font-semibold",
  fallback = "initial",
}: UserAvatarProps) {
  const displayName = (name ?? "").trim();
  const resolvedAlt = alt ?? `${displayName || "User"}'s avatar`;

  if (storageKey) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/files/${storageKey}`}
        alt={resolvedAlt}
        title={title}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      title={title}
      className={`${className} flex shrink-0 items-center justify-center overflow-hidden rounded-full`}
    >
      <span className={textClassName}>
        {fallbackText(displayName, fallback)}
      </span>
    </span>
  );
}