// // controllers/postController.js
// import prisma from "../prismaClient.js";

// // Create a post
// export const createPost = async (req, res) => {
//   try {
//     const { title, content, userId } = req.body;
//     const post = await prisma.post.create({
//       data: { title, content, userId: Number(userId) },
//     });
//     res.status(201).json(post);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Get all posts
// export const getAllPosts = async (req, res) => {
//   try {
//     const posts = await prisma.post.findMany({
//       include: { user: true },
//     });
//     res.json(posts);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get posts by user
// export const getPostsByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const posts = await prisma.post.findMany({
//       where: { userId: Number(userId) },
//     });
//     res.json(posts);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Delete post
// export const deletePost = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.post.delete({ where: { id: Number(id) } });
//     res.json({ message: "Post deleted" });
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
