"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVehicles = getVehicles;
exports.getVehicleById = getVehicleById;
exports.createVehicle = createVehicle;
exports.updateVehicle = updateVehicle;
const db_1 = require("../config/db");
async function getVehicles(req, res) {
    try {
        const { search, status } = req.query;
        let sql = 'SELECT * FROM vehicles';
        const params = [];
        const conditions = [];
        if (search && String(search).trim() !== '') {
            const cleanTerm = String(search).trim();
            const idx = params.length + 1;
            params.push(`%${cleanTerm}%`);
            conditions.push(`(LOWER(registration_number) LIKE LOWER($${idx}) OR ` +
                `LOWER(model) LIKE LOWER($${idx}) OR ` +
                `LOWER(chassis_number) LIKE LOWER($${idx}) OR ` +
                `LOWER(engine_number) LIKE LOWER($${idx}))`);
        }
        if (status) {
            conditions.push('status = $' + (params.length + 1));
            params.push(status);
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY id DESC';
        const result = await (0, db_1.query)(sql, params);
        return res.json({ vehicles: result.rows });
    }
    catch (error) {
        console.error('getVehicles error:', error);
        return res.status(500).json({ message: 'Failed to fetch vehicles.' });
    }
}
async function getVehicleById(req, res) {
    try {
        const { id } = req.params;
        const result = await (0, db_1.query)('SELECT * FROM vehicles WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }
        return res.json({ vehicle: result.rows[0] });
    }
    catch (error) {
        console.error('getVehicleById error:', error);
        return res.status(500).json({ message: 'Failed to fetch vehicle.' });
    }
}
async function createVehicle(req, res) {
    try {
        const { registration_number, vehicle_type, manufacturer, model, variant, chassis_number, engine_number, location, status } = req.body;
        if (!registration_number || !model) {
            return res.status(400).json({ message: 'Registration number and model are required.' });
        }
        const sql = `
      INSERT INTO vehicles (registration_number, vehicle_type, manufacturer, model, variant, chassis_number, engine_number, location, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
        const result = await (0, db_1.query)(sql, [
            registration_number.toUpperCase().trim(),
            vehicle_type || 'Commercial / Private',
            manufacturer || null,
            model,
            variant || null,
            chassis_number || null,
            engine_number || null,
            location || null,
            status || 'ACTIVE',
        ]);
        return res.status(201).json({ vehicle: result.rows[0] });
    }
    catch (error) {
        console.error('createVehicle error:', error);
        return res.status(500).json({ message: 'Failed to create vehicle.' });
    }
}
async function updateVehicle(req, res) {
    try {
        const { id } = req.params;
        const { registration_number, vehicle_type, manufacturer, model, variant, chassis_number, engine_number, location, status } = req.body;
        const existing = await (0, db_1.query)('SELECT * FROM vehicles WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }
        const sql = `
      UPDATE vehicles
      SET registration_number = $1, vehicle_type = $2, manufacturer = $3, model = $4, variant = $5, chassis_number = $6, engine_number = $7, location = $8, status = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
    `;
        await (0, db_1.query)(sql, [
            registration_number ? registration_number.toUpperCase().trim() : existing.rows[0].registration_number,
            vehicle_type !== undefined ? vehicle_type : existing.rows[0].vehicle_type,
            manufacturer !== undefined ? manufacturer : existing.rows[0].manufacturer,
            model || existing.rows[0].model,
            variant !== undefined ? variant : existing.rows[0].variant,
            chassis_number !== undefined ? chassis_number : existing.rows[0].chassis_number,
            engine_number !== undefined ? engine_number : existing.rows[0].engine_number,
            location !== undefined ? location : existing.rows[0].location,
            status || existing.rows[0].status,
            id,
        ]);
        return res.json({ message: 'Vehicle updated successfully.' });
    }
    catch (error) {
        console.error('updateVehicle error:', error);
        return res.status(500).json({ message: 'Failed to update vehicle.' });
    }
}
