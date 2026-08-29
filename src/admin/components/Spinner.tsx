export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span
        className="w-7 h-7 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin"
        role="status"
        aria-label="A carregar"
      />
      {label && <p className="font-body text-sm text-gray-500">{label}</p>}
    </div>
  )
}