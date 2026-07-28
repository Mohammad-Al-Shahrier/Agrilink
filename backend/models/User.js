import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["farmer", "customer", "admin"],
      default: "customer",
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    farmName: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
<<<<<<< HEAD

    /* Admin can suspend an account (farmer or customer) without
       deleting it — a blocked user is refused at auth-middleware
       level on every subsequent request. */
    isActive: {
      type: Boolean,
      default: true,
    },
=======
>>>>>>> 6153e036b889b1351e7d1ee07225cee9016c15fd
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);