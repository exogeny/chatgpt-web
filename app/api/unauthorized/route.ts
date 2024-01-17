export async function GET() {
  return new Response("Unauthorized", { status: 401 });
}