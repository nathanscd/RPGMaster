import { RollableItem } from '../types/Character'
import DiceRoller from './DiceRoller'

type Props = {
  title: string
  items: RollableItem[]
}

export default function RollableList({ title, items }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="font-bold text-lg">{title}</h2>

      {items.map((item, i) => (
        <DiceRoller
          key={i}
          label={item.nome}
          roll={item.roll}
        />
      ))}
    </div>
  )
}
