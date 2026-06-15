import multer from 'multer'

// storing pic

const storage = multer.diskStorage({
	filename: function (req, file, callback) {
		callback(null, file.originalname)
	}
})

//uploading pic

const upload = multer({ storage })


export default upload