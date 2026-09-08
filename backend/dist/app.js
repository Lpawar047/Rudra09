"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const customersRoutes_1 = __importDefault(require("./routes/customersRoutes"));
const vehiclesRoutes_1 = __importDefault(require("./routes/vehiclesRoutes"));
const loansRoutes_1 = __importDefault(require("./routes/loansRoutes"));
const recoveryCasesRoutes_1 = __importDefault(require("./routes/recoveryCasesRoutes"));
const assignmentsRoutes_1 = __importDefault(require("./routes/assignmentsRoutes"));
const followupsRoutes_1 = __importDefault(require("./routes/followupsRoutes"));
const paymentsRoutes_1 = __importDefault(require("./routes/paymentsRoutes"));
const excelRoutes_1 = __importDefault(require("./routes/excelRoutes"));
const reportsRoutes_1 = __importDefault(require("./routes/reportsRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health Check Endpoint
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Rudra Services Backend API', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', usersRoutes_1.default);
app.use('/api/customers', customersRoutes_1.default);
app.use('/api/vehicles', vehiclesRoutes_1.default);
app.use('/api/loans', loansRoutes_1.default);
app.use('/api/recovery-cases', recoveryCasesRoutes_1.default);
app.use('/api/assignments', assignmentsRoutes_1.default);
app.use('/api/followups', followupsRoutes_1.default);
app.use('/api/payments', paymentsRoutes_1.default);
app.use('/api/excel', excelRoutes_1.default);
app.use('/api/reports', reportsRoutes_1.default);
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled Application Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'An internal server error occurred.',
    });
});
exports.default = app;
