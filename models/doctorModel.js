import mongoose from "mongoose";


//get details of doctors
const doctorSchema = new mongoose.Schema({
	name: { type: String, require: true },
	email: { type: String, require: true, unique: true },
	password: { type: String, require: true },
	phone: { type: String, require: true },
	image: { type: String, require: true },
	speciality: { type: String, require: true },
	degree: { type: String, require: true },
	experiance: { type: String, require: true },
	about: { type: String, require: true },
	available: { type: Boolean, default: true },
	fees: { type: Number, require: true },
	address: { type: Object, require: true },
	date: { type: Number, require: true },
	slot_book: { type: Object, default: {} },
}, { minimize: false })

//doctor model
const doctorModel = mongoose.model.doctor || mongoose.model("doctors", doctorSchema)

export default doctorModel