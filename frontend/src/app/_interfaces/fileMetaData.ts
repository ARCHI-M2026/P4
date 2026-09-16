export interface FileMetaDataResponse {
  originalFileName: string,
  fileSize: string,
  extension: string,
  token: string,
  createdAt: string,
  expirationDays: number,
  isExpired: boolean,
  isProtected: boolean,
  remainingDays: number,
  expirationDate: string,
  tags: string[]
}