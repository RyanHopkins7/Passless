export async function POST(req: Request) {
    // Create a new user
    const data = await req.json();
    // TODO: create user in database
    return Response.json({'userCreation': 'successful'});
}