import { getObject } from "@/lib/filestore";

export async function GET(
  request: Request,
  { params }: { params: { key: string[] } }
) {
  try {
    const key = params.key.join("/");
    const file = await getObject(key);

    return new Response(await file.Body?.transformToWebStream(), {
      headers: {
        "Content-Type": file.ContentType
          ? file.ContentType
          : "application/octet-stream",
      },
    });
  } catch (e) {
    return new Response("File not found", { status: 404 });
  }
}
