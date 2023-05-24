const userModel = require('../users/user.model');

const authMethod = require('./auth.methods');

exports.isAuth = async (req, res, next) => {
	// Lấy access token từ header
	const accessTokenFromHeader = req.headers.x_authorization;
	if (!accessTokenFromHeader) {
		return res.status(401).send('Không tìm thấy access token!');
	}

	const accessTokenSecret = "Access_Token_Secret_#$%_ExpressJS_Authentication";

	const verified = await authMethod.verifyToken(
		accessTokenFromHeader,
		accessTokenSecret,
	);
	if (!verified) {
		return res
			.status(401)
			.send('Bạn không có quyền truy cập vào tính năng này!');
	}
	const user = await userModel.findOne({username: verified.payload.username});
	req.user = user.toObject();

	return next();
};