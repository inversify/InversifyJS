///<reference path="../interfaces/interfaces.d.ts" />

function _s4(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

function guid() {
    return `${_s4()}${_s4()}-${_s4()}-${_s4()}-${_s4()}-${_s4()}${_s4()}${_s4()}`;
}

export default guid;
