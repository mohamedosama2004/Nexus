type Props = {
  status: string;
  outline?: boolean;
  compact?: boolean;
};

export function projectStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "badge-success";
    case "in progress":
      return "badge-info";
    case "completed":
      return "badge-secondary";
    default:
      return "badge-ghost";
  }
}

export default function ProjectStatusBadge({
  status,
  outline,
  compact,
}: Props) {
  const badgeClass = projectStatusBadgeClass(status);
  const sizeClass = compact ? "badge-sm" : "badge-lg";

  return (
    <span
      className={`badge ${outline ? "badge-outline" : sizeClass} ${badgeClass}`}
    >
      {status}
    </span>
  );
}
