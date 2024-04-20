import { connect } from "mongoose";
import Room from "./Room.js";

main().catch((err) => console.log(err));
async function main() {
  await connect("mongodb://127.0.0.1:27017/college_chat");
}

async function settingDefaultRoom() {
  await Room.deleteMany();
  let room = new Room({ name: "public", password: "public" });
  await room.save();
  return room._id;
}

const ID = {
  id: settingDefaultRoom(),
};
export default ID;
