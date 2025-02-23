import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/errorHandler.js';
import jwt from 'jsonwebtoken';

// ✅ Signup - Pendaftaran pengguna baru
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, 'All fields are required'));
  }

  console.log("🔍 Incoming signup request:", { username, email });

  try {
    const role = email.includes("admin") ? "admin" : "user";

    // 🔒 Hash password sebelum disimpan
    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();

    console.log("✅ User saved successfully:", newUser);
    res.status(201).json({ message: 'Signup successful', user: { username, email, role } });
  } catch (error) {
    next(error);
  }
};

// ✅ Signin - Login pengguna
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email.trim() === '' || password.trim() === '') {
    return next(errorHandler(400, 'All fields are required'));
  }

  try {
    const validUser = await User.findOne({ email }).select('+password');
    if (!validUser) {
      return next(errorHandler(404, 'User not found'));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, 'Invalid password'));
    }

    // 🔒 Buat token JWT yang menyimpan `id` dan `role`
    const token = jwt.sign(
      { id: validUser._id, role: validUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .json({ ...rest, role: validUser.role });
  } catch (error) {
    console.error("🔥 Error terjadi saat signin:", error);
    next(errorHandler(500, 'Error signing in'));
  }
};

// ✅ Google Sign-in - Login dengan Google
export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;

  if (!email || !name) {
    return next(errorHandler(400, "Google login failed. Missing email or name."));
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      // 🔒 Buat Token JWT
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const { password, ...rest } = user._doc;
      return res
        .status(200)
        .cookie('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .json({ ...rest, role: user.role });
    }

    // 🔒 Generate password random untuk akun baru
    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

    const newUser = new User({
      username: name.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4),
      email,
      password: hashedPassword,
      profilePicture: googlePhotoUrl || "",
      role: "user" // **Pastikan role default adalah "user"**
    });

    await newUser.save();

    // 🔒 Buat Token JWT untuk user baru
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password, ...rest } = newUser._doc;
    res
      .status(200)
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .json({ ...rest, role: newUser.role });
  } catch (error) {
    next(errorHandler(500, 'Error signing in with Google'));
  }
};

// ✅ Fungsi `getMe` untuk mendapatkan data pengguna yang sedang login
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    res.status(200).json(user);
  } catch (error) {
    next(errorHandler(500, "Error fetching user data"));
  }
};

export const getUsers = async (req, res, next) => {
  try {
    console.log("🛂 Admin meminta daftar user:", req.user);

    if (req.user.role !== "admin") {
      return next(errorHandler(403, "Access denied! Only admin can view users."));
    }

    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(errorHandler(500, "Error fetching users."));
  }
};