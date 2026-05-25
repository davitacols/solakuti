import { SportsFixture } from "@/types/sports";

type MomentumPanelProps = {
  fixture: SportsFixture;
};

export default function MomentumPanel({ fixture }: MomentumPanelProps) {
  const momentum = (fixture.momentum ?? []).slice(-30);

  if (!momentum.length) {
    return null;
  }

  return (
    <div className="border border-black/10 bg-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Momentum</p>
      <div className="mt-4 flex h-28 items-center gap-1 border-y border-black/10 py-3">
        {momentum.map((point) => {
          const homeHeight = Math.min(Math.abs(point.home_value), 100);
          const awayHeight = Math.min(Math.abs(point.away_value), 100);
          return (
            <div key={point.id} className="flex h-full flex-1 flex-col justify-center gap-1">
              <div className="flex flex-1 items-end">
                <span className="block w-full bg-red-600" style={{ height: `${homeHeight}%` }} />
              </div>
              <div className="flex flex-1 items-start">
                <span className="block w-full bg-[#111]" style={{ height: `${awayHeight}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
