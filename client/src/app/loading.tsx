export default function RootLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6">
      <div className="border-blood h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      <p className="text-fg-dim mt-4 font-mono text-xs tracking-widest uppercase">
        Loading...
      </p>
    </div>
  );
}
