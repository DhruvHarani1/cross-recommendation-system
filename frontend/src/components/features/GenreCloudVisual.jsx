export default function GenreCloudVisual() {
  const posters = [
    { src: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', className: 'top-0 left-8 w-[200px] h-[290px] rotate-[-4deg]' },
    { src: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', className: 'top-12 left-40 w-[190px] h-[290px] z-10' },
    { src: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', className: 'top-32 left-4 w-[180px] h-[290px] rotate-[3deg]' },
  ];

  return (
    <div className="relative w-[480px] h-[320px]">
      {posters.map((p, i) => (
        <div
          key={i}
          className={`absolute rounded-xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.5)] ${p.className}`}
        >
          <img src={p.src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}