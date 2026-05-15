export default function PageLoader() {
  return (
    <main className="min-h-[70vh] bg-[#f7f4ef]">
      <section className="container-page py-10 lg:py-16">
        <div className="overflow-hidden rounded-lg border border-black/10 bg-white editorial-shadow">
          <div className="h-1.5 w-full overflow-hidden bg-black/5">
            <div className="h-full w-1/3 animate-[loadingBar_1.15s_ease-in-out_infinite] bg-red-600" />
          </div>
          <div className="grid gap-8 p-6 lg:grid-cols-[1fr_340px] lg:p-8">
            <div>
              <div className="h-8 w-36 animate-pulse rounded-full bg-red-600/15" />
              <div className="mt-6 h-12 w-11/12 animate-pulse rounded bg-black/10" />
              <div className="mt-3 h-12 w-4/5 animate-pulse rounded bg-black/10" />
              <div className="mt-6 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-black/10" />
                <div className="h-4 w-10/12 animate-pulse rounded bg-black/10" />
                <div className="h-4 w-8/12 animate-pulse rounded bg-black/10" />
              </div>
            </div>
            <div className="aspect-[4/3] animate-pulse rounded-lg bg-black/10" />
          </div>
        </div>
      </section>
    </main>
  );
}
