// // controllers/userController.js
// import prisma from "./prismaClient.js";

// // Create a new user
// export const createUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await prisma.user.create({
//       data: { email, password },
//     });
//     res.status(201).json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Get all users
// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await prisma.user.findMany({
//       include: { posts: true, sessions: true },
//     });
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get single user by ID
// export const getUserById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await prisma.user.findUnique({
//       where: { id: Number(id) },
//       include: { posts: true, sessions: true },
//     });
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Delete user
// export const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.user.delete({ where: { id: Number(id) } });
//     res.json({ message: "User deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
//demo
////demo
//demo
//demo
//demo
//demo
//demo
