import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/app/models/User";

connectDB();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const role = url.searchParams.get("role");
    const query: any = {};
    if (role) query.role = role;

    const users = await User.find(query).lean();
    return NextResponse.json(users);
  } catch (err) {
    console.error("Error GET users:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
