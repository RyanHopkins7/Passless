import { NextRequest } from "next/server";
import { getSession, getUserId, getPasswords, setPasswords } from "@/database/database";

export async function GET(req: NextRequest) {
    const sid = req.cookies.get('sid')?.value || '';
    const session = await getSession(sid);

    const passwords : string = await getPasswords(session.user_id);
    return Response.json({'passwordData': passwords});
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const sid = req.cookies.get('sid')?.value || '';
    const session = await getSession(sid);

    await setPasswords(session.user_id, data.data);

    return Response.json({'update': 'successful'});
}