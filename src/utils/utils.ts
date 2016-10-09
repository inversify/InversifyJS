export function getFunctionName(v: any): string {
    if (v.name) {
        return v.name;
    } else {
        let name = v.toString();
        let match = name.match(/^function\s*([^\s(]+)/);
        return match ? match[1] : `Anonymous function: ${name}`;
    }
}
