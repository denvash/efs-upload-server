import { Request, Response } from "express";
import fs from "fs";
import { LOCAL_HOST } from "..";
import path from "path";
import { fileStore } from "../fileStore";

const MS_IN_1_MIN = 60 * 1000;
const DEFAULT_RETENTION_MIN = 1;

// @PUT route
export const putFile = (req: Request, res: Response): void => {
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: "File is required" });
    return;
  }

  /**
   * NOT typed, can be safety-improved;
   * hardcoded key can be moved to config file.
   */
  const retentionRaw = req.headers["retention-min"] as string;

  const retentionMin = Number(retentionRaw) || DEFAULT_RETENTION_MIN;
  const retentionMs = retentionMin * MS_IN_1_MIN;
  const expirationTimeMs = Date.now() + retentionMs;
  const expirationDateFormatted = new Date(
    expirationTimeMs
  ).toLocaleTimeString();

  const { path: filePath, filename: fileName } = file;

  fileStore[fileName] = {
    fileKey: fileName,
    filePath,
    retentionMin,
    expirationTimeMs,
    expirationDateFormatted,
  };

  console.debug("File added", fileStore);
  res.json({ fileUrl: `${LOCAL_HOST}/v1/${fileName}` });
};

// @GET
export const getFile = (req: Request, res: Response): void => {
  console.debug("GET triggered", fileStore);

  const fileName = req.params.fileName;
  const fileData = fileStore[fileName];

  if (!fileData) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  const { filePath, expirationTimeMs } = fileData;

  if (Date.now() > expirationTimeMs) {
    console.debug("Deleting file", fileData);

    delete fileStore[fileName];
    fs.unlinkSync(filePath);
    res.status(410).json({ error: "File has expired" });
  }

  // uploads dir 2 layers above
  res.sendFile(filePath, { root: path.join(__dirname, "../../") });
};

// @GET
export const getDebug = (req: Request, res: Response): void => {
  console.debug("Current Time:", new Date(Date.now()).toLocaleTimeString());
  console.debug("Debug triggered", fileStore);
};
