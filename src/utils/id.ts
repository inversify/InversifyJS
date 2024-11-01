let idCounter: number = 0;

function id(): number {
  return idCounter++;
}

export { id };
