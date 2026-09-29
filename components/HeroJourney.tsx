import { Compass, IdCard, Target, type LucideIcon } from "lucide-react";

const PATH = "M 44 352 C 150 352, 150 214, 262 208 S 392 66, 478 62";

const STEPS: { icon: LucideIcon; title: string; sub: string; x: number; y: number; tone: string }[] = [
  { icon: Compass, title: "Explore", sub: "Find an app", x: 44, y: 352, tone: "sky" },
  { icon: Target, title: "Quest", sub: "+25 XP", x: 262, y: 208, tone: "blue" },
  { icon: IdCard, title: "Passport", sub: "Level up", x: 478, y: 62, tone: "navy" }
];

/** The three words of the headline as one route: a path draws in and each step lights up in turn. */
export function HeroJourney() {
  return (
    <div className="jpath" aria-hidden="true">
      <svg viewBox="0 0 520 420" className="jpath__svg">
        <defs>
          <linearGradient id="jpath-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#75C9F3" />
            <stop offset="1" stopColor="#246CB0" />
          </linearGradient>
        </defs>
        <path d={PATH} className="jpath__track" />
        <path d={PATH} className="jpath__line" pathLength={1} stroke="url(#jpath-grad)" />
        <path d={PATH} className="jpath__flow" pathLength={1} />
      </svg>
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={s.title} className="jpath__node" data-tone={s.tone} style={{ left: `${(s.x / 520) * 100}%`, top: `${(s.y / 420) * 100}%`, "--n": i } as React.CSSProperties}>
            <span className="jpath__dot"><Icon /></span>
            <span className="jpath__label"><b>{s.title}</b><small>{s.sub}</small></span>
          </div>
        );
      })}
    </div>
  );
}
