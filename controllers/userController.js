import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import QRCode from 'qrcode';
import Razorpay from 'razorpay';

// User register
const registerUser = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.json({ success: false, message: "All fields are required" });
		}

		if (!validator.isEmail(email)) {
			return res.json({ success: false, message: "Invalid email" });
		}

		if (password.length < 8) {
			return res.json({ success: false, message: "Password must be at least 8 characters" });
		}

		const existingUser = await userModel.findOne({ email });
		if (existingUser) {
			return res.json({ success: false, message: "User already exists" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new userModel({
			name,
			email,
			password: hashedPassword
		});

		const user = await newUser.save();
		res.json({ success: true, message: "Registration successful" });

	} catch (error) {
		console.error(error);
		res.json({ success: false, message: error.message });
	}
};

// User login
const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await userModel.findOne({ email });
		if (!user) {
			return res.json({ success: false, message: "User not found. Please register first" });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.json({ success: false, message: "Invalid credentials" });
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

		res.json({ success: true, message: "Login successful", token });

	} catch (error) {
		console.error(error);
		res.json({ success: false, message: error.message });
	}
};

// Get user profile
const getProfile = async (req, res) => {
	try {
		const { userId } = req.body;
		const userData = await userModel.findById(userId).select('-password');
		res.json({ success: true, userData });
	} catch (error) {
		console.error(error);
		res.json({ success: false, message: error.message });
	}
};

// Book appointment
const bookAppointment = async (req, res) => {
	try {
		const { userId, docId, slotDate, slotTime } = req.body;

		const docData = await doctorModel.findById(docId).select('-password');
		if (!docData.available) {
			return res.json({ success: false, message: "Doctor not available" });
		}

		const appointmentData = {
			userId,
			docId,
			amount: docData.fees,
			slotTime,
			slotDate,
			date: Date.now()
		};

		const newAppointment = new appointmentModel(appointmentData);
		await newAppointment.save();

		res.json({ success: true, message: "Appointment Booked", appointmentId: newAppointment._id });

	} catch (error) {
		console.error(error);
		res.json({ success: false, message: error.message });
	}
};

// Get user appointments
const listAppointment = async (req, res) => {
	try {
		const { userId } = req.body;
		const appointments = await appointmentModel.find({ userId })
			.populate('userId', '-password')
			.populate('docId', '-password');
		
		const formattedAppointments = appointments.map(apt => ({
			...apt.toObject(),
			userData: apt.userId,
			docData: apt.docId
		}));
		
		res.json({ success: true, appointments: formattedAppointments });
	} catch (error) {
		console.error(error);
		res.json({ success: false, message: error.message });
	}
};

// Generate payment QR
const generatePaymentQR = async (req, res) => {
	try {
		const { appointmentId } = req.body;
		const appointment = await appointmentModel.findById(appointmentId).populate('docId');
		
		if (!appointment) {
			return res.json({ success: false, message: "Appointment not found" });
		}

		const paymentData = `upi://pay?pa=merchant@upi&pn=${appointment.docId.name}&am=${appointment.amount}&cu=INR&tn=Appointment-${appointmentId}`;
		const qrCode = await QRCode.toDataURL(paymentData);
		
		res.json({ success: true, qrCode, amount: appointment.amount });
	} catch (error) {
		console.error(error);
		res.json({ success: false, message: error.message });
	}
};

// Verify payment
const verifyPayment = async (req, res) => {
	try {
		const { appointmentId } = req.body;
		const appointment = await appointmentModel.findByIdAndUpdate(
			appointmentId,
			{ payment: true },
			{ new: true }
		);
		res.json({ success: true, message: "Payment verified", appointment });
	} catch (error) {
		console.error(error);
		res.json({ success: false, message: error.message });
	}
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
	try {
		const { appointmentId } = req.body;
		await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
		res.json({ success: true, message: "Appointment cancelled" });
	} catch (error) {
		console.error(error);
		res.json({ success: false, message: error.message });
	}
};

export { registerUser, loginUser, getProfile, bookAppointment, listAppointment, generatePaymentQR, verifyPayment, cancelAppointment };
