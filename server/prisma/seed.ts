import { auth } from "../src/config/auth.js";
import { prisma } from "../src/config/prisma.js";
import { env } from "../src/config/env.js";

async function seed() {
  console.log(`🌱 Seeding initial admin user (${env.ADMIN_EMAIL})...`);

  // 1. Check if the admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: env.ADMIN_EMAIL },
  });

  if (existingUser) {
    if (existingUser.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: "ADMIN" },
      });
      console.log(`✅ User ${env.ADMIN_EMAIL} already existed; elevated role to ADMIN.`);
    } else {
      console.log(`ℹ️ Admin user ${env.ADMIN_EMAIL} already exists with ADMIN role.`);
    }
    return;
  }

  // 2. Create user with Better Auth (safely hashes password and links Account record)
  const result = await auth.api.signUpEmail({
    body: {
      name: "System Admin",
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
    },
  });

  if (!result || !result.user) {
    throw new Error("Better Auth signUpEmail failed to create admin user.");
  }

  // 3. Elevate role to ADMIN in database
  await prisma.user.update({
    where: { id: result.user.id },
    data: { role: "ADMIN" },
  });

  console.log(`🎉 Admin user created successfully: ${env.ADMIN_EMAIL}`);
}

seed()
  .catch((err) => {
    console.error("❌ Seed execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
