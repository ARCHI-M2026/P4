import { BadRequestException } from "@nestjs/common";

/**
 * Extensions/formats dangereux à bloquer, détectés par magic number
 */
const DANGEROUS_EXTENSIONS = new Set([
  "exe", // Windows executable
  "dll", // Windows library
  "msi", // Windows installer
  "elf", // Linux executable
  "deb", // Debian package
  "rpm", // RPM package
  "dmg", // macOS disk image
  "apk", // Android package
  "sh", // Shell script (rarement détecté par magic number, gardé pour clarté)
  "bat", // Batch script (idem)
  "cmd", // Windows batch script (idem)
]);

/**
 * Vérifie le vrai type d'un fichier via son contenu binaire (magic number),
 * indépendamment de son nom ou du Content-Type déclaré par le client.
 * Lève une BadRequestException si le format est jugé dangereux.
 *
 * Note : `file-type` ne peut pas détecter les formats texte (.txt, .csv,
 * .svg...), qui n'ont pas de magic number — ils passent donc la validation
 * sans être bloqués, ce qui est le comportement attendu pour ce MVP.
 */
export async function validateFileMagicNumber(buffer: Buffer): Promise<void> {
  const { fileTypeFromBuffer } = await import("file-type");
  const detected = await fileTypeFromBuffer(buffer);

  if (detected && DANGEROUS_EXTENSIONS.has(detected.ext)) {
    throw new BadRequestException(
      `Type de fichier non autorisé : ${detected.ext}`,
    );
  }
}