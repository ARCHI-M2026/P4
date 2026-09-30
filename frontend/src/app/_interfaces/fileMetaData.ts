// export interface FileMetaDataResponse {
//   id: string;
//   originalName: string;
//   mimeType: string;
//   size: number;
//   uploadedAt: string;
//   expiresAt: string;
//   downloadToken: string;
//   isPasswordProtected: boolean;
// }

import { FileInfoMetaDataResponse } from "./FileInfoMetaData";

export interface FileMetaDataResponse extends FileInfoMetaDataResponse {
  id: string;
  uploadedAt: string;
  downloadToken: string;
}