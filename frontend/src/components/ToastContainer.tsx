import type { Toast, TypeToast } from '../context/ToastContext'

const styleParType: Record<TypeToast, string> = {
  erreur: 'border-red-200 bg-red-50 text-red-800',
  succes: 'border-green-200 bg-green-50 text-green-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

interface ToastContainerProps {
  listToast: Toast[]
  onFermer: (id: number) => void
}

export default function ToastContainer({ listToast, onFermer }: ToastContainerProps) {
  return (
    <div
      className="pointer-events-none fixed left-4 right-4 top-4 z-60 flex flex-col gap-2 sm:left-auto sm:w-96"
      aria-live="polite"
    >
      {listToast.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === 'erreur' ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${styleParType[toast.type]}`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => onFermer(toast.id)}
            aria-label="Fermer la notification"
            className="shrink-0 opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}