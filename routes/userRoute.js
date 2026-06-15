import express from 'express';
import { registerUser, loginUser, getProfile, bookAppointment, listAppointment, generatePaymentQR, verifyPayment, cancelAppointment } from '../controllers/userController.js';
import authUser from '../middleware/authUser.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.post('/appointments', authUser, listAppointment);
userRouter.post('/generate-qr', authUser, generatePaymentQR);
userRouter.post('/verify-payment', authUser, verifyPayment);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);

export default userRouter;
