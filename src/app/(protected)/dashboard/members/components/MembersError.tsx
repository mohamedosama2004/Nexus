export function MembersError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-error/20 bg-error/5 px-5 py-8 text-center">
      <p className="text-sm font-medium text-error">{message}</p>
    </div>
  );
}
