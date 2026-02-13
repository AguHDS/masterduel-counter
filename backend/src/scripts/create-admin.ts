import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth.js";
import readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createAdmin() {
  try {
    console.log("=== Create Admin User ===\n");

    const username = await question("Enter admin username: ");
    if (!username || username.trim().length === 0) {
      console.error("❌ Username cannot be empty");
      rl.close();
      await prisma.$disconnect();
      return;
    }

    const email = await question("Enter admin email: ");
    if (!email || email.trim().length === 0) {
      console.error("❌ Email cannot be empty");
      rl.close();
      await prisma.$disconnect();
      return;
    }

    const password = await question("Enter admin password: ");
    if (!password || password.trim().length === 0) {
      console.error("❌ Password cannot be empty");
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Check if user already exists
    const existingUserByName = await prisma.user.findFirst({
      where: { name: username },
    });

    if (existingUserByName) {
      console.error(`❌ User with username "${username}" already exists`);
      rl.close();
      await prisma.$disconnect();
      return;
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUserByEmail) {
      console.error(`❌ User with email "${email}" already exists`);
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Create admin user using better-auth
    const response = await auth.api.signUpEmail({
      body: {
        name: username,
        email: email,
        password: password,
      },
    });

    if (!response || !response.user) {
      console.error("❌ Failed to create admin user");
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Update user role to admin
    await prisma.user.update({
      where: { id: response.user.id },
      data: { role: "admin" },
    });

    console.log(`\n✅ Admin user "${username}" created successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: admin`);

    rl.close();
    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    rl.close();
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();
