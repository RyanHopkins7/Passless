import { User } from "@/database/schemas";
import { NextResponse } from "next/server";

// TODO: what if hash of username was used for this salt?
// TODO: this endpoint allows username enumeration
export async function GET(req: Request, context: { params: { username: string } }) {
    const user = await User.findOne({ username: context.params.username });

    if (user === null) {
        return NextResponse.json({}, {
            status: 404
        });
    }

    return NextResponse.json({
        'salt': user.passphraseHashSalt
    });
}