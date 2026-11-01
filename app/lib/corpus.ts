export type TicketPair = {
    issue: string;
    resolution: string;
    tags: string[];
};

export const corpus: TicketPair[] = [
    {
        issue: "Preview Builds not appearing on pull requests",
        resolution: "The Vercel GitHub app lost pull-request read permission, so previews silently stopped being generated. Re-granted the permission; previews fire on every PR again.",
        tags: ["preview", "github"],
    },
    {
        issue: "Build failing with 'Could not detect Node version' after Next.js upgrade",
        resolution: "The project's engines field pinned Node 14 while the build runtime was Node 20. Updated engines to match the runtime, the build now completes.",
        tags: ["build", "node"],
    },
    {
        issue: "Environment variable missing in Preview but present in Production",
        resolution: "The variable was scoped to Production only. Re-scoped it to Preview and Production, verified after a redeploy.",
        tags: ["env", "preview"],
    },
    {
        issue: "Edge function timing out on long streaming requests",
        resolution: "Function duration was capped at the default 10 seconds. Set maxDuration in the route handler and enabled streaming; the timeout is gone.",
        tags: ["edge", "timeout", "streaming"],
    },
    {
        issue: "Chat stream ends before tool approval completes",
        resolution: "sendAutomaticallyWhen with lastAssistantMessageIsCompleteWithApprovalResponses was missing, so approval responses never reached the server. Added it and the loop resumes after approval.",
        tags: ["ai-sdk", "tools"],
    },
    {
        issue: "Duplicate deployments triggered on every push",
        resolution: "Both a legacy integration and a Git-based deployment were registered on the project. Removed the stale integration; one deploy per push confirmed.",
        tags: ["deploy", "integrations"],
    },
    {
        issue: "KV reads lag far behind writes in production",
        resolution: "The KV namespace was created in a region far from edge traffic. Moved it to the nearest region, latency dropped from ~300ms to ~40ms.",
        tags: ["kv", "latency"],
    },
    {
        issue: "Hobby plan error blocking team deployments",
        resolution: "The account auto-assigned to Hobby plan under the team. Migrated the member to Pro billing, deployments unblocked.",
        tags: ["billing", "plan"],
    },
];
