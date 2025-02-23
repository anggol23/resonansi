import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail, // ✅ Gunakan validator.js untuk validasi email
        message: 'Please enter a valid email',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // ✅ Password tidak dikembalikan dalam query
    },
    profilePicture: {
      type: String,
      default:
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
    role: {
      type: String,
      enum: ['user', 'admin'], // ✅ Bisa hanya "user" atau "admin"
      default: 'user',
    },
  },
  { timestamps: true }
);

// 🔹 **Hash password sebelum menyimpan user**
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Cegah hash ulang jika password tidak diubah
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔹 **Hapus password dari response JSON**
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
