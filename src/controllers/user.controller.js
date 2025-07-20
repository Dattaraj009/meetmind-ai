import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHandler, AsyncHandler } from "../utils/AsyncHandler.js";
import { PrismaClient } from "@prisma/client/extension";
import bcrypt from "bcrypt";
import uploadOnCloudinary from "../utils/cloudinary.js"
import { upload } from "../middleware/multer.middleware.js";

const prisma = new PrismaClient();

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  // Check avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      avatarUrl: avatar.url,
    },
  });

  // Generate JWT
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Return success
  res.status(201).json(
    new ApiResponse(201, {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
      },
      token,
    }, "User registered successfully")
  );
});


export {registerUser};