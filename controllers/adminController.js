import validator from 'validator'
import bcrypt from 'bcrypt'
import * as cloudinary from 'cloudinary'
import Doctor from '../models/doctorModel.js'
import adminModel from '../models/adminModel.js'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'

//API for adding doctorsb

const addDoctor = async (req, res) => {
	try {
		const { name, email, password, phone, speciality, degree, experiance, about, fees, address } = req.body;
		//to get image file
		const imageFile = req.file;


		//checking for all data to add doctor
		if (!name || !email || !password || !phone || !speciality || !degree || !experiance || !about || !fees || !address) {
			return res.status(400).json({ success: false, message: "All fields are required" });
		}

		//validating email
		if (!validator.isEmail(email)) {
			return res.json({ success: false, message: "Invalid email" })
		}

		//validating password
		if (!validator.isStrongPassword(password)) {
			return res.json({ success: false, message: "Password must be 8 characters long and must contain 1 uppercase, 1 lowercase, 1 number and 1 symbol" })
		}


		//hasting doctor password

		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)


		//upload image to cloudinary
		const imageResponse = await cloudinary.uploader.upload(imageFile.path, {
			folder: "Aarogya/Doctors"
		})

		//image url
		const imageUrl = imageResponse.secure_url;


		//doctor data
		const doctorData = {
			name,
			email,
			password: hashedPassword,
			phone,
			speciality,
			degree,
			experiance,
			about,
			fees,
			address: (() => {
				if (typeof address === 'string') {
					try {
						return JSON.parse(address);
					} catch (e) {
						console.log('Address parsing error:', e.message);
						console.log('Address value:', address);
						return address;
					}
				}
				return address;
			})(),
			image: imageUrl,
			date: Date.now()
		}


		//doctor model
		const newDoctor = new Doctor(doctorData)
		await newDoctor.save()
		res.json({ success: true, message: "Doctor added successfully" });

	} catch (err) {

		//for error
		console.error(err);
		res.json({ success: false, message: err.message });
	}
}

//API to get all doctors list
const getAllDoctors = async (req, res) => {
	try {
		const doctors = await Doctor.find({}).select('-password')
		res.json({ success: true, doctors })
	} catch (error) {
		console.error(error)
		res.json({ success: false, message: error.message })
	}
}

//API to delete doctor
const deleteDoctor = async (req, res) => {
	try {
		const { id } = req.body
		await Doctor.findByIdAndDelete(id)
		res.json({ success: true, message: 'Doctor deleted successfully' })
	} catch (error) {
		console.error(error)
		res.json({ success: false, message: error.message })
	}
}

//api for the admin login

const loginAdmin = async (req, res) => {
	try {
		const { email, password } = req.body;

		const admin = await adminModel.findOne({ email });
		if (!admin) {
			return res.json({ success: false, message: "Invalid credentials" });
		}

		const isMatch = await bcrypt.compare(password, admin.password);
		if (!isMatch) {
			return res.json({ success: false, message: "Invalid credentials" });
		}

		const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });

		return res.json({
			success: true,
			message: "Login successful",
			token
		});

	} catch (error) {
		console.log('Login error:', error);
		res.json({ success: false, message: error.message });
	}
};


import appointmentModel from '../models/appointmentModel.js'

// API to get all appointments
const getAllAppointments = async (req, res) => {
	try {
		const appointments = await appointmentModel.find({})
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
}

// API to update appointment status
const updateAppointmentStatus = async (req, res) => {
	try {
		const { appointmentId, status } = req.body
		const updateData = {}
		
		if (status === 'cancelled') updateData.cancelled = true
		if (status === 'completed') updateData.isCompleted = true
		
		await appointmentModel.findByIdAndUpdate(appointmentId, updateData)
		res.json({ success: true, message: 'Status updated' })
	} catch (error) {
		console.error(error)
		res.json({ success: false, message: error.message })
	}
}

// API to get dashboard stats
const getDashboardStats = async (req, res) => {
	try {
		const appointments = await appointmentModel.find({})
		const doctors = await Doctor.find({})
		
		const stats = {
			totalAppointments: appointments.length,
			totalDoctors: doctors.length,
			pendingAppointments: appointments.filter(a => !a.cancelled && !a.isCompleted).length,
			completedAppointments: appointments.filter(a => a.isCompleted).length,
			cancelledAppointments: appointments.filter(a => a.cancelled).length
		}
		
		res.json({ success: true, stats })
	} catch (error) {
		console.error(error)
		res.json({ success: false, message: error.message })
	}
}

// API to get single appointment details
const getAppointmentDetail = async (req, res) => {
	try {
		const { id } = req.params;
		const appointment = await appointmentModel.findById(id)
			.populate('userId', '-password')
			.populate('docId', '-password');
		
		if (!appointment) {
			return res.json({ success: false, message: 'Appointment not found' });
		}
		
		const formattedAppointment = {
			...appointment.toObject(),
			userData: appointment.userId,
			docData: appointment.docId
		};
		
		res.json({ success: true, appointment: formattedAppointment });
	} catch (error) {
		console.error(error);
		res.json({ success: false, message: error.message });
	}
}

// API to update doctor
const updateDoctor = async (req, res) => {
	try {
		const { docId, name, email, phone, experience, fees, about, speciality, degree, address } = req.body;
		const imageFile = req.file;

		const updateData = { name, email, phone, experiance: experience, fees, about, speciality, degree };
		
		if (address) {
			updateData.address = typeof address === 'string' ? JSON.parse(address) : address;
		}
		
		if (imageFile) {
			const imageResponse = await cloudinary.uploader.upload(imageFile.path, { folder: "Aarogya/Doctors" });
			updateData.image = imageResponse.secure_url;
		}

		await Doctor.findByIdAndUpdate(docId, updateData);
		res.json({ success: true, message: 'Doctor updated successfully' });
	} catch (error) {
		console.error(error);
		res.json({ success: false, message: error.message });
	}
}

export { addDoctor, loginAdmin, getAllDoctors, deleteDoctor, getAllAppointments, updateAppointmentStatus, getDashboardStats, getAppointmentDetail, updateDoctor }