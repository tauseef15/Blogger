const { createHmac, randomBytes } = require("crypto");
const { Schema, model } = require("mongoose");
const { createToken } = require("../services/auth");
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    salt: {
      type: String,
      select: false,
    },
    profilePicture: {
      type: String,
      default:
        "https://i.pinimg.com/736x/e4/4a/09/e44a09d4fc648627e9b7174031995121.jpg",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.salt = randomBytes(16).toString("hex");
    this.password = createHmac("sha256", this.salt)
      .update(this.password)
      .digest("hex");
  }
  next();
});

userSchema.static("matchPasword", async function (email, password) {
  const user = await this.findOne({ email }).select("+password +salt");
  if (!user) {
    throw new Error("User not found");
  }
  const salt = user.salt;
  const hashedPassword = user.password;
  const userProvidedPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");
  if (userProvidedPassword !== hashedPassword) {
    throw new Error("Invalid password");
  }

  const token = createToken(user);
  return token;
});


const User = model("User", userSchema);
module.exports = User;
