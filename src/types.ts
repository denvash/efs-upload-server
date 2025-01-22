export type FileStore = {
  [key: string]: {
    fileKey: string;
    filePath: string;
    retentionMin: number;
    expirationTimeMs: number;
    expirationDateFormatted: string;
  };
};
