import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
    }
}, {timestamps: true}
);

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        return res.status(501).json({message: "Password not hashed"})
    }
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("User", userSchema);

export default userModel;