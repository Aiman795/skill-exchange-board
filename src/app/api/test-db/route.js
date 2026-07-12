import connectDB from "@/lib/mongodb";
import { User } from "@/lib/models";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const testUser = await User.create({
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      passwordHash: "dummy-hash-for-testing",
      location: "Islamabad",
      bio: "This is a test user created to verify the DB connection.",
    });

    const allUsers = await User.find();

    return NextResponse.json({
      success: true,
      message: "Connected to MongoDB and created a test user!",
      createdUser: testUser,
      totalUsersInDB: allUsers.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong connecting to MongoDB.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}