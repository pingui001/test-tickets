import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/User";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    await connectDB();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: "El usuario ya existe" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({
      message: "Usuario registrado correctamente",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
