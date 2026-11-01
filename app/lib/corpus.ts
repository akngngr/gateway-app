export type TicketPair = {
    issue: string;
    resolution: string;
    tags: string[];
};

export const corpus: TicketPair[] = [
    {
        issue: "Export button fails with 'invalid input' error on large CSVs",
        resolution: "Chunked the export worker for large files — fixed in release 3.2.1",
        tags: ["export", "bug"],
    },
    {
        issue: "Login page shows 401 after password reset",
        resolution: "Password reset token expired — added token refresh. Resolved by re-verifying email.",
        tags: ["auth"],
    },
    {
        issue: "Webhook deliveries duplicated",
        resolution: "Added idempotency keys to webhook consumers — dedup confirmed.",
        tags: ["integrations"],
    },
    {
        issue: "Billing shows double charge after plan upgrade",
        resolution: "Reverted duplicate charge via billing admin. Root cause: upgrade race condition.",
        tags: ["billing"],
    },
];