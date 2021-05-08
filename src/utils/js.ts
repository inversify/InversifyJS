export function getArrayDuplicate<T>(array:T[]):T | undefined {
  const seenValues: any= {}

  for (const entry of array) {
    if (seenValues[entry]) {
      return entry;
    } else {
      seenValues[entry] = true
    }
  }
}