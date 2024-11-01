import { interfaces } from '../interfaces/interfaces';

class QueryableString implements interfaces.QueryableString {
  private readonly str: string;

  constructor(str: string) {
    this.str = str;
  }

  public startsWith(searchString: string): boolean {
    return this.str.indexOf(searchString) === 0;
  }

  public endsWith(searchString: string): boolean {
    let reverseString: string = '';
    const reverseSearchString: string = searchString
      .split('')
      .reverse()
      .join('');
    reverseString = this.str.split('').reverse().join('');
    return this.startsWith.call({ str: reverseString }, reverseSearchString);
  }

  public contains(searchString: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return this.str.indexOf(searchString) !== -1;
  }

  public equals(compareString: string): boolean {
    return this.str === compareString;
  }

  public value(): string {
    return this.str;
  }
}

export { QueryableString };
