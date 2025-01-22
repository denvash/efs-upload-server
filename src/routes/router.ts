import express from "express";
import { uploadMiddleware } from "../middleware/upload";
import { getDebug, getFile, putFile } from "./FileContoller";

const router = express.Router();

router.put("/v1/file", uploadMiddleware.single("file"), putFile);
router.get("/debug", getDebug);
router.get("/v1/:fileName", getFile);

export { router };
