"use server";

import { putItem, deleteItem, getItem } from "@/lib/supabase";
import { deleteObject, putObject } from "@/lib/filestore";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid"; // ES Modules
import z from "zod";

const inputDataSchema = z.object({
  data: z.string().optional(),
  type: z.string(),
  file: z.instanceof(File).optional(),
});

const deleteItemFormSchema = z.object({
  id: z.string(),
  userId: z.string(),
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
  const key = uuidv4();
  if (inputData.data.file && inputData.data.file.size > 0) {
    console.log("Uploading file to filestore", id);
    const imageId = `input/${id}/${key}`;
    console.log(`image put Object imageId=${imageId}`);
    await putObject(
      imageId,
      Buffer.from(await inputData.data.file.arrayBuffer()),
      inputData.data.file.type
    );
    await putItem({ user_id: id, value: imageId, type: inputData.data.type });
  } else if (inputData.data.data !== undefined) {
    await putItem({
      user_id: id,
      value: inputData.data.data,
      type: inputData.data.type,
    });
  } else {
    console.error("file data error.");
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteItemAction(formData: FormData) {
  const inputData = deleteItemFormSchema.safeParse(
    Object.fromEntries(formData)
  );
  if (inputData.success === false) {
    console.warn(
      `Invalid input data. error=${JSON.stringify(
        inputData.error.flatten().fieldErrors
      )}`
    );
    return inputData.error.flatten().fieldErrors;
  }
  const item = await getItem(inputData.data.id);
  if (item === null) {
    console.warn(`[actions] item not found. id=${inputData.data.id}`);
    revalidatePath("/");
    return;
  }
  console.log(`deleting item id=${item.id}`);
  await deleteObject(item.value);
  await deleteItem(inputData.data.id);
  revalidatePath("/");
}
