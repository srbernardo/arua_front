interface ColorSwatchesProps {
  colors: string[]
}

export default function ColorSwatches({ colors }: ColorSwatchesProps) {
  return (
    <div className="flex items-center gap-2 h-6">
      {colors.map((color, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-sm"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}
