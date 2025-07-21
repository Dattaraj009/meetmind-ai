import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHandler, AsyncHandler } from "../utils/AsyncHandler.js";
import { PrismaClient } from "@prisma/client/extension";
import bcrypt from "bcrypt";
import uploadOnCloudinary from "../utils/cloudinary.js"
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils.js";
const prisma = new PrismaClient();

const generateAccessTokenAndRefreshToken = async(userId)=>{
  try {

    const user = await prisma.user.findUnique(
      {where:{ id: userId },
    });

    if(!user) throw new ApiError(404,"invalid user Id");

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id:userId },
      data: { refreshToken }
    });

    return { accessToken,refreshToken };
    
  } catch (error) {
    throw new ApiError(500,"Token geneartion failed");
  }
}

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

const loginUser = asyncHandler(async(req,res)=>{

  const {email,password} = req.body;

  if( !email || !password ){
    throw new ApiError(400,"All fields are required")
  }
  
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if( !user ){
    throw new ApiError(404,"User is not exist");
  }
  const isPassword = await bcrypt.compare(password,user.password);

  if( !isPassword ){
    throw new ApiError(400,"Invalid user credentials");
  }
  
  const {refreshToken , accessToken} = generateAccessTokenAndRefreshToken(user.id);

  const loggedIn = {
    id: user.id,
    name: user.name,
    email: email.name,
    avatarUrl: user.avatarUrl,
  };

  const options = {
        httpOnly:true,
        secure: true,
        sameSite: "Strict",
    }
  
  res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(200,{
      user: loggedIn,accessToken,refreshToken
    },
    "User logged in successfully")
  )
    
})
const logoutUser = asyncHandler(async(req,res)=>{

  const userId = req.user?.id;

  const options = {
        httpOnly:true,
        secure: true,
        sameSite: "Strict",
    }
  
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
  

  res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,{},"User logged out successfully")
  )
})

export {registerUser,loginUser,logoutUser};