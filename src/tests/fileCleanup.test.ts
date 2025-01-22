import fs from "fs";
import nodeSchedule from "node-schedule";
import { cleanupExpiredFiles, scheduleCleanup } from "../schedule_task";
import { fileStore } from "../fileStore";

// Mocks
jest.mock("fs");
jest.mock("node-schedule");

describe("cleanupExpiredFiles", () => {
  beforeEach(() => {
    // Reset fileStore before each test
    Object.keys(fileStore).forEach((key) => delete fileStore[key]); // Clear fileStore

    jest.clearAllMocks();
  });

  it("should delete expired files and log the cleanup", () => {
    // Arrange
    const currentTime = Date.now();
    const mockFilePath = "/path/to/expired/file";
    const expiredFileName = "expired-file.txt";
    const expirationTimeMs = currentTime - 1000;

    // Simulate expired file entry in fileStore
    fileStore[expiredFileName] = {
      fileKey: expiredFileName,
      filePath: mockFilePath,
      retentionMin: 60,
      expirationTimeMs: expirationTimeMs, // expired (1 sec ago)
      expirationDateFormatted: new Date(expirationTimeMs).toLocaleTimeString(),
    };

    console.log = jest.fn(); // Mock console.log to track logs
    console.debug = jest.fn(); // Mock console.debug for debugging info

    // Act
    cleanupExpiredFiles();

    // Assert
    expect(fs.unlinkSync).toHaveBeenCalledWith(mockFilePath);
    expect(fileStore[expiredFileName]).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith(
      "Expired file deleted",
      expect.any(Object)
    );
  });

  it("should not delete any files if none are expired", () => {
    // Arrange
    const currentTime = Date.now();
    const mockFilePath = "/path/to/not-expired/file";
    const validFileName = "valid-file.txt";
    const expirationTimeMs = currentTime + 1000;

    // Simulate a valid file entry in fileStore
    fileStore[validFileName] = {
      fileKey: validFileName,
      filePath: mockFilePath,
      retentionMin: 60,
      expirationTimeMs: expirationTimeMs, // expired (1 sec ago)
      expirationDateFormatted: new Date(expirationTimeMs).toLocaleTimeString(),
    };

    console.log = jest.fn(); // Mock console.log

    // Act
    cleanupExpiredFiles();

    // Assert
    expect(fs.unlinkSync).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  it("should log a message if fileStore is empty", () => {
    // Arrange
    console.log = jest.fn(); // Mock console.log

    // Act
    cleanupExpiredFiles();

    // Assert
    expect(console.log).toHaveBeenCalledWith("Nothing stored for cleanup");
  });
});
