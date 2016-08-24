export function getFunctionName(v: any): string {
    return v.name ? v.name : v.toString().match(/^function\s*([^\s(]+)/)[1];
}
