import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import Room from "./Room.js";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  roomJoin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Room, // name of the model
  },
});

UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });
// this is the name of the model (User) for schema UserSchema
const User = mongoose.model("User", UserSchema);
export default User;
