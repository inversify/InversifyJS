export function template(strings: TemplateStringsArray, ...keys: any[]) {
    return (function (...values: any[]) {
        let result = [strings[0]];
        keys.forEach(function (key, i) {
            let value = Number.isInteger(key) ? values[key] : values[keys.indexOf(key)];
            result.push(value, strings[i + 1]);
        });
        return result.join("");
    });
}
