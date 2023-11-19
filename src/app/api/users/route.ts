import { createUser } from "@/database/database";

export async function POST(req: Request) {
    // Create a new user
    const data = await req.json();
    await createUser(data.username, data.email);

    return Response.json({'userCreation': 'successful'});
}