type TypeAlert = 'erreur' | 'succes' | 'info'

interface AlertProps {
  type?: TypeAlert
  message: string
}

const styleParType: Record<TypeAlert, string> = {
  erreur: 'bg-red-50 text-red-700',
  succes: 'bg-green-50 text-green-700',
  info: 'bg-blue-50 text-blue-700',
}

export default function Alert({ type = 'info', message }: AlertProps) {
  return (
    <p role="alert" className={`rounded-lg px-3 py-2 text-sm ${styleParType[type]}`}>
      {message}
    </p>
  )
}