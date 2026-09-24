import styles from './Avatar.module.css'

const PALETTE: Array<[string, string]> = [
  ['#ffb347', '#ff8a1f'],
  ['#ff8a80', '#f0525a'],
  ['#7ed79a', '#35b46b'],
  ['#7cc4ff', '#2f8df0'],
  ['#b89cff', '#8057f0'],
  ['#ff9dcb', '#e9559b'],
  ['#6fdad4', '#1eaaa3'],
  ['#ffd36e', '#f0a91e'],
]

function hash(value: string): number {
  let result = 0
  for (let i = 0; i < value.length; i++) result = (result * 31 + value.charCodeAt(i)) | 0
  return Math.abs(result)
}

interface AvatarProps {
  /** От этого значения зависит цвет — у одного чата он всегда одинаковый. */
  seed: string
  name: string
  size?: number
}

export function Avatar({ seed, name, size = 54 }: AvatarProps) {
  const [from, to] = PALETTE[hash(seed) % PALETTE.length]
  const initial = name.trim().charAt(0).toUpperCase() || '#'

  return (
    <span
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(180deg, ${from}, ${to})`,
      }}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
