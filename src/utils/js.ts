export function getFirstArrayDuplicate<T>(array: T[]): T | undefined {
  const seenValues: Set<T> = new Set<T>();

  for (const entry of array) {
    if (seenValues.has(entry)) {
      return entry;
    } else {
      seenValues.add(entry);
    }
  }
  return undefined;
}
