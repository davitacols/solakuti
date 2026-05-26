export default function ArticleSkeleton() {
  return (
    <main className="min-h-[70vh]">
      <div className="h-12 animate-pulse bg-[#111]" />
      <div className="container-page py-8 lg:py-12">
        <div className="max-w-4xl">
          <div className="h-8 w-28 animate-pulse rounded-full bg-red-600/15" />
          <div className="mt-6 h-10 w-11/12 animate-pulse rounded bg-black/8" />
          <div className="mt-3 h-10 w-3/4 animate-pulse rounded bg-black/8" />
          <div className="mt-6 h-5 w-full animate-pulse rounded bg-black/6" />
          <div className="mt-2 h-5 w-9/12 animate-pulse rounded bg-black/6" />
          <div className="mt-6 flex gap-3">
            <div className="h-4 w-24 animate-pulse rounded bg-black/8" />
            <div className="h-4 w-32 animate-pulse rounded bg-black/8" />
            <div className="h-4 w-20 animate-pulse rounded bg-black/8" />
          </div>
        </div>
      </div>
      <div className="container-page">
        <div className="aspect-[16/9] animate-pulse rounded-lg bg-black/8" />
      </div>
      <div className="container-page max-w-3xl py-10">
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-black/6" style={{ width: `${85 + Math.random() * 15}%` }} />
          ))}
        </div>
      </div>
    </main>
  );
}
