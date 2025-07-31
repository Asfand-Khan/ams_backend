import fs from "fs";
import path from "path";

export const saveBase64Image = async (
  base64String: string,
  imageName: string,
  customDir: string = "uploads"
): Promise<{ success: boolean; fileName: string | null }> => {
  try {
    const uploadsDir = path.join(process.cwd(), customDir);

    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, imageName);
    const buffer = Buffer.from(base64String, "base64");
    await fs.promises.writeFile(filePath, buffer);

    return {
      success: true,
      fileName: imageName,
    };
  } catch (error) {
    console.error("Error saving image:", error);
    return {
      success: false,
      fileName: null,
    };
  }
};

export const extractImageAndExtension = (
  base64String: string
): { image: string; extension: string } => {
  const matches = base64String.match(
    /^data:image\/([a-zA-Z0-9]+);base64,(.*)$/
  );
  if (!matches) throw new Error("Invalid base64 string");
  const extension = matches[1];
  const image = matches[2];
  return { image, extension };
};