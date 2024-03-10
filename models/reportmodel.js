import mongoose from "mongoose";
const reportSchema = mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref:'User',required: true},
  title: { type: String, required: true},
  description: { type: String, required: true },
  type: { type: String, required: true },
})

const reportModel = mongoose.model("Report", reportSchema);
export default reportModel;