const bcrypt = require("bcrypt");
const userModel = require("../users/user.model");
const randToken = require("rand-token");
const authMethod = require("./auth.methods");

const jwtVariable = require("../variables/jwt");
const { SALT_ROUNDS } = require("../variables/auth");

exports.register = async (req, res) => {
  //   const username = req.body.username.toLowerCase();
  //   const user = await userModel.getUser(username);
  //   if (user) res.status(409).send("Tên tài khoản đã tồn tại.");
  //   else {
  //     const hashPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
  //     const newUser = {
  //       username: username,
  //       password: hashPassword,
  //     };
  //     const createUser = await userModel.save(newUser);
  //     if (!createUser) {
  //       return res
  //         .status(400)
  //         .send("Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại.");
  //     }
  //     return res.send({
  //       username,
  //     });
  //   }
  const body = await req.body;
  const User = new userModel(body);
  try {
    await User.save();
    res.status(201).json("Done");
  } catch (error) {
    console.log("create error");
  }
};

exports.login = async (req, res) => {
  // const username = req.body.username.toLowerCase() || 'test';
  // const password = req.body.password || '12345';

  // const user = await userModel.getUser(username);
  // if (!user) {
  // 	return res.status(401).send('Tên đăng nhập không tồn tại.');
  // }

  const body = await req.body;

  userModel
    .findOne({ username: body.username })
    .then(async (element) => {
      const data = element.toObject();
      //   const isPasswordValid = bcrypt.compareSync(data.password, body.password);
      //   if (!isPasswordValid) {
      //     return res.status(401).send("Mật khẩu không chính xác.");
      //   }
      const accessTokenLife = "10m";
      const accessTokenSecret =
        "Access_Token_Secret_#$%_ExpressJS_Authentication";

      const dataForAccessToken = {
        username: data.username,
      };
      const accessToken = await authMethod.generateToken(
        dataForAccessToken,
        accessTokenSecret,
        accessTokenLife
      );
      if (!accessToken) {
        return res
          .status(401)
          .send("Đăng nhập không thành công, vui lòng thử lại.");
      }

      let refreshToken = randToken.generate(120); // tạo 1 refresh token ngẫu nhiên
      if (data.refreshToken === "") {
        // Nếu user này chưa có refresh token thì lưu refresh token đó vào database
        await userModel
          .updateOne({ refreshToken: refreshToken })
          .then(() => {
            console.log("update OK");
          })
          .catch((error) => console.log(error));
      } else {
        // Nếu user này đã có refresh token thì lấy refresh token đó từ database
        refreshToken = data.refreshToken;
      }

      return res.json({
        msg: "Đăng nhập thành công.",
        accessToken,
        refreshToken,
        data,
      });
    })
    .catch((error) => console.log(error));
};

exports.refreshToken = async (req, res) => {
  // Lấy access token từ header
  const accessTokenFromHeader = req.headers.x_authorization;
  if (!accessTokenFromHeader) {
    return res.status(400).send("Không tìm thấy access token.");
  }

  // Lấy refresh token từ body
  const refreshTokenFromBody = req.body.refreshToken;
  if (!refreshTokenFromBody) {
    return res.status(400).send("Không tìm thấy refresh token.");
  }

  const accessTokenSecret =
    "Access_Token_Secret_#$%_ExpressJS_Authentication" ||
    jwtVariable.accessTokenSecret;

  const accessTokenLife = "10m" || jwtVariable.accessTokenLife;

  // Decode access token đó
  const decoded = await authMethod.decodeToken(
    accessTokenFromHeader,
    accessTokenSecret
  );
  if (!decoded) {
    return res.status(400).send("Access token không hợp lệ.");
  }

  const username = decoded.payload.username; // Lấy username từ payload

   userModel.findOne({username: username}).then(async (data) => {
    const user = data.toObject();
    if (!user) {
      return res.status(401).send("User không tồn tại.");
    }
    if (refreshTokenFromBody !== user.refreshToken) {
      return res.status(400).send("Refresh token không hợp lệ.");
    }
  
    // Tạo access token mới
    const dataForAccessToken = {
      username,
    };
  
    const accessToken = await authMethod.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    );
    if (!accessToken) {
      return res
        .status(400)
        .send("Tạo access token không thành công, vui lòng thử lại.");
    }
    return res.json({
      accessToken,
    });
   });
  
};
