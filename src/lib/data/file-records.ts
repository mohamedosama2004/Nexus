import { prisma } from "../prisma";
import { getStorage } from "../files/storage";

export type StoredFileRecord = {
  id: string;
  storageKey: string;
};

/**
 * Removes a stored file completely: both the bytes and the metadata row.
 *
 * Best-effort: if removing the bytes fails, the metadata row is still removed
 * (the bytes become an orphan); if removing the row fails the error is logged.
 * The failure is never swallowed silently, but it also does not abort the
 * caller's success path.
 */
export async function deleteStoredFileRecord(record: StoredFileRecord) {
  try {
    await getStorage().delete(record.storageKey);
  } catch (error) {
    console.error("Failed to delete stored file bytes:", error);
  }

  try {
    await prisma.fileRecord.delete({
      where: {
        id: record.id,
      },
    });
  } catch (error) {
    console.error("Failed to delete file record:", error);
  }
}