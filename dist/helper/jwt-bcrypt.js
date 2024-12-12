"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = exports.signJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const signJwt = (user) => {
    var _a;
    const secret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "";
    const token = jsonwebtoken_1.default.sign({ user }, secret);
    return token;
};
exports.signJwt = signJwt;
const hashPassword = (p) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt_1.default.genSalt(10);
    const hash = yield bcrypt_1.default.hash(p, salt);
    return hash;
});
exports.hashPassword = hashPassword;
const comparePassword = (p, hash) => __awaiter(void 0, void 0, void 0, function* () { return yield bcrypt_1.default.compare(p, hash); });
exports.comparePassword = comparePassword;
