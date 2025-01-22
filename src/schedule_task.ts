import nodeSchedule from "node-schedule";
import fs from "fs";
import { fileStore } from "./fileStore";

// Scheduled task to clean up expired files
export const cleanupExpiredFiles = () => {
  console.debug("Cleanup triggered, fileStore:", fileStore);

  const currentTime = Date.now();
  console.debug(
    "Current Time",
    currentTime,
    new Date(currentTime).toLocaleTimeString()
  );

  const storedEntries = Object.entries(fileStore);

  if (storedEntries.length === 0) {
    console.log("Nothing stored for cleanup");
    return;
  }

  for (const [fileName, fileData] of storedEntries) {
    const { filePath } = fileData;
    if (currentTime > fileData.expirationTimeMs) {
      fs.unlinkSync(filePath);
      delete fileStore[fileName];

      console.log("Expired file deleted", fileData);
    }
  }
};

// Every 30sec; https://crontab.guru/#*/30_*_*_*_*_*
// Hardcoded, can be moved to config
const SCHEDULE_EVERY_30_SEC = "*/30 * * * * *";

export const scheduleCleanup = () => {
  nodeSchedule.scheduleJob(SCHEDULE_EVERY_30_SEC, cleanupExpiredFiles);
};
