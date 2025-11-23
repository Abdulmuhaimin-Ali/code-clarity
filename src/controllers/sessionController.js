// // controllers/sessionController.js
// import prisma from "../prismaClient.js";

// // Create a session
// export const createSession = async (req, res) => {
//   try {
//     const { token, userId, expiresAt } = req.body;
//     const session = await prisma.session.create({
//       data: {
//         token,
//         userId: Number(userId),
//         expiresAt: new Date(expiresAt),
//       },
//     });
//     res.status(201).json(session);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Get all sessions
// export const getAllSessions = async (req, res) => {
//   try {
//     const sessions = await prisma.session.findMany({
//       include: { user: true },
//     });
//     res.json(sessions);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get sessions for a user
// export const getSessionsByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const sessions = await prisma.session.findMany({
//       where: { userId: Number(userId) },
//     });
//     res.json(sessions);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Delete session
// export const deleteSession = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.session.delete({ where: { id: Number(id) } });
//     res.json({ message: "Session deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
//demo
//demo
//demo
//demo
//demo
//demo
//demo
