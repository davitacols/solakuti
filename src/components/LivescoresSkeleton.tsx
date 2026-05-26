export default function LivescoresSkeleton() {
  return (
    <main className="min-h-[70vh]">
      <div className="h-12 animate-pulse bg-[#111]" />
      <div className="bg-[#0a0a0a] py-10 sm:py-14">
        <div className="container-page grid gap-8 xl:grid-cols-[1fr_420px]">
          <div>
            <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="mt-6 h-14 w-3/4 animate-pulse rounded bg-white/8" />
            <div className="mt-3 h-14 w-1/2 animate-pulse rounded bg-white/8" />
            <div className="mt-8 flex gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 w-20 animate-pulse rounded bg-white/8" />
              ))}
            </div>
          </div>
          <div className="h-72 animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>
      <div className="container-page py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border border-black/8 bg-white" />
          ))}
        </div>
      </div>
    </main>
  );
}
