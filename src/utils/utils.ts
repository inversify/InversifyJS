export function getFunctionName(f: any) {
    return f.name ? f.name : f.toString().match(/^function\s*([^\s(]+)/)[1];
}
