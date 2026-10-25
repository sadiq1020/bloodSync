export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="font-display text-fg text-2xl font-semibold">
        Blood Request Details
      </h1>
      <p className="text-fg-dim mt-1 font-mono text-xs">Request ID: {id}</p>
    </div>
  );
}
