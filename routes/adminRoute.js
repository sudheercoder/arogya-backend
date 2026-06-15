//import express

import express from "express";

//import admincontroller

import { addDoctor, loginAdmin, getAllDoctors, deleteDoctor, getAllAppointments, updateAppointmentStatus, getDashboardStats, getAppointmentDetail, updateDoctor } from '../controllers/adminController.js'

 
//import multer from middleware
import upload from "../middleware/multer.js";
import * as jwt from 'jsonwebtoken';

//  adminROuter
const adminRouter = express.Router()

//add-doctor-route
adminRouter.post('/add-doctor', upload.single('image'), addDoctor)


//login-admin-route
adminRouter.post('/login', loginAdmin)

//get-all-doctors-route
adminRouter.get('/all-doctors', getAllDoctors)

//delete-doctor-route
adminRouter.post('/delete-doctor', deleteDoctor)

//update-doctor-route
adminRouter.post('/update-doctor', upload.single('image'), updateDoctor)

//get-all-appointments-route
adminRouter.get('/appointments', getAllAppointments)

//get-single-appointment-route
adminRouter.get('/appointment/:id', getAppointmentDetail)

//update-appointment-status-route
adminRouter.post('/update-appointment', updateAppointmentStatus)

//get-dashboard-stats-route
adminRouter.get('/dashboard-stats', getDashboardStats)

const authAdmin = (req, res, next) => {
	//condition for admin login
	const token = req.headers.authorization
	if (token) {
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			if (err) {
				return res.json({ success: false, message: "Failed to authenticate" })
			}
			else {
				req.email = decoded.email
				if (req.email === process.env.ADMIN_EMAIL) {
					next()
				} else {
					res.json({ success: false, message: "You are not authorized" })
				}
			}
		})
	}
	else {
		res.json({ success: false, message: "No token provided" })
	}
}

export default adminRouter