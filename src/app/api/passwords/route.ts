import { NextRequest } from "next/server";
import { getSession } from "@/database/database";

export async function GET(req: NextRequest) {
    const sid = req.cookies.get('sid')?.value || '';
    const session = getSession(sid);

    // TODO: get password data from db using session.userId
    return Response.json({'passwordData': '' /* TODO */});
}

export async function POST(req: NextRequest) {
    const data = req.json();
    const sid = req.cookies.get('sid')?.value || '';
    const session = getSession(sid);

    // TODO: update passwords in db using session.userId
    return Response.json({'update': 'successful'});
}