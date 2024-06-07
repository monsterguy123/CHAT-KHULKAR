"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInfo = exports.userSignIn = exports.userSignUp = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = require("../cloudinary/cloudinary");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Ensure the temp directory exists
const ensureTempDirExists = (tempDir) => {
    if (!fs_1.default.existsSync(tempDir)) {
        fs_1.default.mkdirSync(tempDir, { recursive: true });
    }
};
// User Registration :---
const userSignUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const file = (_a = req.files) === null || _a === void 0 ? void 0 : _a.file;
        if (!file) {
            return res.status(400).json({ msg: "No file uploaded" });
        }
        const tempDir = path_1.default.join(__dirname, 'temp');
        ensureTempDirExists(tempDir);
        // Move file to a temporary location
        const tempFilePath = path_1.default.join(tempDir, file.name);
        yield file.mv(tempFilePath);
        // Upload image to Cloudinary
        const url = yield (0, cloudinary_1.uploadImages)(tempFilePath);
        // Delete the temporary file
        fs_1.default.unlinkSync(tempFilePath);
        if (!url) {
            return res.status(500).json({ msg: "Image upload failed" });
        }
        const { name, email, password } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ msg: "Required fields are missing" });
        }
        const existingUser = yield prisma.user.findFirst({
            where: { email: email }
        });
        if (existingUser) {
            return res.status(401).json({ msg: "User already exists" });
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashPassword = yield bcrypt_1.default.hash(password, salt);
        // Database Insertion
        const result = yield prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
                image: url,
            }
        });
        return res.status(201).json({ msg: "User has been created successfully" });
    }
    catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});
exports.userSignUp = userSignUp;
//User Sign In:---
const userSignIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required" });
        }
        // Database find user:--
        const existingUser = yield prisma.user.findFirst({
            where: { email }
        });
        if (!existingUser) {
            return res.status(401).json({ msg: "No user exists with this email" });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ msg: "Incorrect password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: existingUser.id }, process.env.JWTPRIVATEKEY || "", {
            expiresIn: '3d'
        });
        return res.status(200).json({ msg: "User signed in successfully", token });
    }
    catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});
exports.userSignIn = userSignIn;
//user information:---
const userInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield prisma.user.findFirst({
            where: { id: req.userId },
            select: {
                id: true,
                image: true,
                name: true
            }
        });
        if (data) {
            return res.status(200).json({ data });
        }
        return res.json({ msg: "No user data is found..." });
    }
    catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});
exports.userInfo = userInfo;
