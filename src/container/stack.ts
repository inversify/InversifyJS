import { interfaces } from "../interfaces/interfaces";

export class Stack<T> implements interfaces.Stack<T> {
  private _stack: T[] = [];
  push(entry: T): void {
      this._stack.push(entry);
  }
  pop(): T | undefined {
      return this._stack.pop();
  }

  peek(): T | undefined {
    if(this._stack.length > 0){
      return this._stack[this._stack.length -1];
    }
    return undefined;
  }
}

