export function lastItemOrNull<T>(array: readonly T[]): null | T {
  return array.length ? lastItem(array) : null
}

export function lastItem<T>(array: readonly T[]): T {
  if (array.length) {
    return array[array.length - 1]
  }

  throw new Error('The provided array is empty')
}
