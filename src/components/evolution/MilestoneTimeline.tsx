import { CheckCircle2, Award, Zap, ShieldCheck } from "lucide-react";

interface MilestoneEvent {
  id: string;
  date: string;
  title: string;
  category: "Capability" | "Endurance" | "Mindset" | "Strength";
  proofNote: string;
  badgeText: string;
}

const MILESTONES: MilestoneEvent[] = [
  {
    id: "m1",
    date: "July 22, 2026",
    title: "Broken 20-Second Dead Hang Wall",
    category: "Endurance",
    proofNote: "Maintained full scapular engagement and zero slip for 21 total seconds.",
    badgeText: "Grip Breakthrough",
  },
  {
    id: "m2",
    date: "July 15, 2026",
    title: "Unlocked Incline Bench 12.5kg",
    category: "Strength",
    proofNote: "Controlled 3 sets of 8 reps with full chest tap and zero shoulder strain.",
    badgeText: "Upper Push PR",
  },
  {
    id: "m3",
    date: "July 02, 2026",
    title: "Assisted Pull-up Drop to 70kg",
    category: "Capability",
    proofNote: "Stepped down from 85kg to 70kg assistance while keeping strict form.",
    badgeText: "Pull Milestone",
  },
  {
    id: "m4",
    date: "June 18, 2026",
    title: "Deep Squat 45s Unassisted Hold",
    category: "Mindset",
    proofNote: "Comfortable breathing pattern throughout the bottom position with flat heels.",
    badgeText: "Mobility Unlocked",
  },
];

export default function MilestoneTimeline() {
  return (
    <div className="bg-white rounded-[32px] p-6 md:p-8 border border-[#EAE3DE] shadow-xs space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F8F5F2] pb-6">
        <div>
          <h2 className="font-serif font-bold text-xl md:text-2xl text-[#1A1817]">
            PROOF LOG & BREAKTHROUGHS
          </h2>
          <p className="text-xs text-[#8C7B75] mt-0.5">
            A chronological trail of verified physical and mental milestones
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[#2E6B40]/10 text-[#2E6B40] self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" /> 100% Verified Proof
        </span>
      </div>

      {/* TIMELINE LIST */}
      <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-2.5 md:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#EAE3DE]">
        {MILESTONES.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] md:-left-[35px] top-1 w-6 h-6 rounded-full bg-white border-2 border-[#6B2D3A] flex items-center justify-center text-[#6B2D3A] shadow-xs group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-3.5 h-3.5 fill-[#6B2D3A] text-white" />
            </div>

            {/* Event Card */}
            <div className="bg-[#FAF8F6] p-5 rounded-2xl border border-[#EAE3DE] hover:border-[#D9B7BE] transition-all space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[#8C7B75]">
                  {item.date}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#EAE3DE] text-[#6B2D3A]">
                  {item.badgeText}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-[#1A1817]">
                {item.title}
              </h3>

              <p className="text-xs text-[#8C7B75] italic leading-relaxed">
                "{item.proofNote}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}