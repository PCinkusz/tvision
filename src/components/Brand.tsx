import { APP_NAME } from '../brand'

export function BrandMark({ size = 40 }: { size?: number }) {
  return <img src="./icon.png" width={size} height={size} alt="" draggable={false} className="rounded-[22%]" />
}

export function BrandButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={`${APP_NAME} home`} className="group flex items-center gap-3 rounded-xl px-6 pb-4 pt-5 text-left">
      <span className="transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110"><BrandMark /></span>
      <span className="text-2xl font-bold tracking-tight transition-colors group-hover:text-[var(--accent)]">{APP_NAME}</span>
    </button>
  )
}
