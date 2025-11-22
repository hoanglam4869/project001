const express = require("express");
const router = express.Router();
const { createUser, getUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

// Chỉ admin mới được CRUD
router.post("/", verifyToken, isAdmin, createUser);
router.get("/", verifyToken, isAdmin, getUsers);
router.get("/:id", verifyToken, isAdmin, getUserById);
router.put("/:id", verifyToken, isAdmin, updateUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

module.exports = router;

