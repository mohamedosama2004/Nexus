type Props = {
  status: string;
  outline?: boolean;
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

export default function ProjectStatusBadge({ status, outline }: Props) {
  const badgeClass = projectStatusBadgeClass(status);

  return (
    <span
      className={`badge ${outline ? "badge-outline" : "badge-lg"} ${badgeClass}`}
    >
      {status}
    </span>
  );
}
