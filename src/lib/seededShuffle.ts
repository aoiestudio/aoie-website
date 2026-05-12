function seededRand(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1_664_525 + 1_013_904_223) % 4_294_967_296
    return s / 4_294_967_296
  }
}

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  const rand = seededRand(seed)
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
