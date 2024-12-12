"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./utils/db"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
dotenv_1.default.config();
(0, db_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({ origin: "*" }));
// Routes
app.use("/api", routes_1.default);
app.get("/", (req, res) => {
    res.send("This is backend-host!");
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
