import { createHash } from "crypto";

export class HashUserID {
    private static hashedUserID: string;

    public static hashUserID(userID: string): string {
        if (!HashUserID.hashedUserID) {
            HashUserID.hashedUserID = createHash("sha256")
                .update(userID)
                .digest("hex");
        }
        return HashUserID.hashedUserID;
    }

    public static resetHash(): void {
        HashUserID.hashedUserID = null;
    }
}