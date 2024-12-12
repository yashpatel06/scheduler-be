"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = responseWrapper;
function responseWrapper(success, message, status, data, error) {
    return {
        success,
        message,
        status: status !== null && status !== void 0 ? status : 500,
        data: data !== null && data !== void 0 ? data : null,
        error: error !== null && error !== void 0 ? error : null,
    };
}
