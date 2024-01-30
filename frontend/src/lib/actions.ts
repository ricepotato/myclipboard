"use server";

import { revalidatePath } from "next/cache";
import z from "zod";
import { putObject } from "@/lib/filestore";
import { v4 as uuidv4 } from "uuid"; // ES Modules

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

  if (inputData.data.file) {
    const id = uuidv4();
    putObject(
      `input/${id}`,
      Buffer.from(await inputData.data.file.arrayBuffer()),
      inputData.data.file.type
    );
  }

  revalidatePath("/");
  return { success: true };
}
