import jwt from 'jsonwebtoken'

//admin authentication midleware

const authAdmin = (req, res, next) => {
	try {

		const { atoken } = req.headers
		if (!atoken) {
			return res.json({ success: false, message: "Token not found" })
		}

		const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)

		//token verification with admin email and password

		if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
			return res.json({ success: false, message: 'Not Authorized Login Again' })
		}

		next();

	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })

	}
}

export default authAdmin