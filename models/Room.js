import mongoose from "mongoose";

const RoomScehma = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  members: {
    type: Number,
    default: 0,
  },
});

const Room = mongoose.model("Room", RoomScehma);
export default Room;
