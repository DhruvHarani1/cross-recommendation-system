import { ROW_1, ROW_2, ROW_3 } from '../data/posters';

export default function PosterWall() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 flex flex-col justify-center gap-6 py-12">
        <MarqueeRow posters={ROW_1} direction="left" opacityClass="opacity-100" blurClass="blur-0" />
        <MarqueeRow posters={ROW_2} direction="right" opacityClass="opacity-80" blurClass="blur-[1px]" />
        <MarqueeRow posters={ROW_3} direction="left" opacityClass="opacity-70" blurClass="blur-[1.5px]" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/45 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b0f2e]/20 via-transparent to-transparent" />
    </div>
  );
}

function MarqueeRow({ posters, direction, opacityClass, blurClass }) {
  const doubled = [...posters, ...posters];
  const animClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';

  return (
    <div
      className={`flex gap-4 w-max ${animClass} ${opacityClass} ${blurClass}`}
      style={{ willChange: 'transform' }}
    >
      {doubled.map((p, i) => (
        <div
          key={`${p.id}-${i}`}
          className="w-[110px] sm:w-[140px] md:w-[160px] h-[160px] sm:h-[200px] md:h-[230px] rounded-md overflow-hidden flex-shrink-0"
        >
          <img
            src={p.img}
            alt={p.title}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}