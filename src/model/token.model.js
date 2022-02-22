import mongoose from "mongoose";

const { Schema } = mongoose;

const TokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Token = mongoose.model("Token", TokenSchema);
export default Token;
