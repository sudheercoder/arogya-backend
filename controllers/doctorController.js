import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"

// Doctor Login
const loginDoctor = async (req, res) => {
	try {
		const { email, password } = req.body
		const doctor = await doctorModel.findOne({ email })

		if (!doctor) {
			return res.json({ success: false, message: 'Invalid credentials' })
		}

		const isMatch = await bcrypt.compare(password, doctor.password)

		if (isMatch) {
			const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
			res.json({ success: true, token })
		} else {
			res.json({ success: false, message: 'Invalid credentials' })
		}

	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// Get Doctor Appointments
const appointmentsDoctor = async (req, res) => {
	try {
		const { docId } = req
		const appointments = await appointmentModel.find({ docId }).populate('userData', 'name email phone image')

		res.json({ success: true, appointments })

	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// Mark Appointment Complete
const appointmentComplete = async (req, res) => {
	try {
		const { docId, appointmentId } = req.body

		const appointmentData = await appointmentModel.findById(appointmentId)
		if (appointmentData && appointmentData.docId === docId) {
			await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
			return res.json({ success: true, message: 'Appointment Completed' })
		} else {
			return res.json({ success: false, message: 'Mark Failed' })
		}

	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// Cancel Appointment
const appointmentCancel = async (req, res) => {
	try {
		const { docId, appointmentId } = req.body

		const appointmentData = await appointmentModel.findById(appointmentId)
		if (appointmentData && appointmentData.docId === docId) {
			await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
			return res.json({ success: true, message: 'Appointment Cancelled' })
		} else {
			return res.json({ success: false, message: 'Cancellation Failed' })
		}

	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// Get Doctor Dashboard Data
const doctorDashboard = async (req, res) => {
	try {
		const { docId } = req

		const appointments = await appointmentModel.find({ docId })

		let earnings = 0
		appointments.forEach((item) => {
			if (item.isCompleted || item.payment) {
				earnings += item.amount
			}
		})

		let patients = []
		appointments.forEach((item) => {
			if (!patients.includes(item.userId)) {
				patients.push(item.userId)
			}
		})

		const dashData = {
			earnings,
			appointments: appointments.length,
			patients: patients.length,
			latestAppointments: appointments.reverse().slice(0, 5)
		}

		res.json({ success: true, dashData })

	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// Get Doctor Profile
const doctorProfile = async (req, res) => {
	try {
		const { docId } = req
		const profileData = await doctorModel.findById(docId).select('-password')
		res.json({ success: true, profileData })

	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// Update Doctor Profile
const updateDoctorProfile = async (req, res) => {
	try {
		const { docId } = req
		const { fees, address, available } = req.body

		await doctorModel.findByIdAndUpdate(docId, { fees, address, available })

		res.json({ success: true, message: 'Profile Updated' })

	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

export {
	loginDoctor,
	appointmentsDoctor,
	appointmentCancel,
	appointmentComplete,
	doctorDashboard,
	doctorProfile,
	updateDoctorProfile
}
