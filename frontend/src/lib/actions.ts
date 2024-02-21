"use server";

import { putItem } from "@/lib/datastore";
import { putObject } from "@/lib/filestore";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid"; // ES Modules
import z from "zod";

const inputDataSchema = z.object({
  data: z.string().optional(),
  type: z.string(),
  file: z.instanceof(File).optional(),
});

export async function saveInput(prevState: any, formData: FormData) {
  const inputData = inputDataSchema.safeParse(Object.fromEntries(formData));
  if (!inputData.success) {
    console.warn(
      `Invalid input data. error=${JSON.stringify(
        inputData.error.flatten().fieldErrors
      )}`
    );
    return inputData.error.flatten().fieldErrors;
  }

  console.log("Saving input data", inputData.data.data);
  console.log("Saving input type", inputData.data.type);
  console.log("Saving input file", inputData.data.file);

  const id = "ricepotato";
  if (inputData.data.file && inputData.data.file.size > 0) {
    console.log("Uploading file to filestore", id);
    const imageId = `input/${id}/${uuidv4()}`;
    console.log(`image put Object imageId=${imageId}`);
    await putObject(
      imageId,
      Buffer.from(await inputData.data.file.arrayBuffer()),
      inputData.data.file.type
    );
    await putItem(id, imageId, inputData.data.type);
  } else if (inputData.data.data !== undefined) {
    await putItem(id, inputData.data.data, inputData.data.type);
  } else {
    console.error("file data error.");
  }

  revalidatePath("/");
  return { success: true };
}
