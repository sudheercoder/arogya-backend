import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import adminModel from './models/adminModel.js';

dotenv.config();

const createSuperAdmin = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URL);
		console.log('Database connected');

		const adminEmail = process.env.ADMIN_EMAIL || 'admin@aarogya.com';
		const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

		const existingAdmin = await adminModel.findOne({ email: adminEmail });
		if (existingAdmin) {
			console.log('Admin already exists!');
			process.exit(0);
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(adminPassword, salt);

		const admin = new adminModel({
			email: adminEmail,
			password: hashedPassword,
			role: 'superadmin'
		});

		await admin.save();
		console.log('Super Admin created successfully!');
		console.log('Email:', adminEmail);
		console.log('Password:', adminPassword);
		process.exit(0);
	} catch (error) {
		console.error('Error:', error.message);
		process.exit(1);
	}
};

createSuperAdmin();
