import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
});

UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });
const User = mongoose.model("User", UserSchema);
export default User;
