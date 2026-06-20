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

  password:{
    type:String,
    required:true,
    minlength:6
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

  profileImage:{
    type:String,
    default:"https://cdn-icons-png.flaticon.com/512/149/149071.png"
  },

  isVerified:{
    type:Boolean,
    default:false
  }
},
{
  timestamps:true
}
);

export default mongoose.model("User", userSchema);