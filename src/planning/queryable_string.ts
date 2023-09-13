import { interfaces } from '../interfaces/interfaces';

class QueryableString implements interfaces.QueryableString {

  private str: string;

  public constructor(str: string) {
    this.str = str;
  }

  public startsWith(searchString: string): boolean {
    return this.str.indexOf(searchString) === 0;
  }

  public endsWith(searchString: string): boolean {
    let reverseString = '';
    const reverseSearchString = searchString.split('').reverse().join('');
    reverseString = this.str.split('').reverse().join('');
    return this.startsWith.call({ str: reverseString }, reverseSearchString);
  }

  public contains(searchString: string): boolean {
    return (this.str.indexOf(searchString) !== -1);
  }

  public equals(compareString: string): boolean {
    return this.str === compareString;
  }

  public value(): string {
    return this.str;
  }

}

export { QueryableString };
