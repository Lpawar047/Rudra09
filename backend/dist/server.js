"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const PORT = process.env.PORT || 5000;
async function startServer() {
    try {
        await (0, db_1.initDb)();
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Rudra Services Backend API server running on port ${PORT}`);
            console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
        });
    }
    catch (error) {
        console.error('Fatal Server Initialization Error:', error);
        process.exit(1);
    }
}
startServer();
