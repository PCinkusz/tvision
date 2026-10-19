import { Star } from 'lucide-react'

export function FavButton({ fav, onClick, className = '' }: { fav: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={fav}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition hover:scale-110 hover:border-yellow-300/70 hover:bg-black/70 ${fav ? 'border-yellow-300/60 bg-black/60' : 'border-white/20 bg-black/45'} ${className}`}
    >
      <Star key={String(fav)} size={18} strokeWidth={2} className={`${fav ? 'pop fill-yellow-300 text-yellow-300' : 'text-white/90'}`} />
      {fav && <span key="r" className="ripple pointer-events-none absolute inset-0 rounded-full border border-yellow-300" />}
    </button>
  )
}
