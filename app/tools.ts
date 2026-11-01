import { tool, InferUITools, UIMessage } from "ai";
import { z } from "zod";
import { corpus } from "./lib/corpus";

export type TicketLabel = "bug" | "known-issue" | "escalation" | "needs-info";

export interface TicketSearchResult {
    issue: string;
    resolution: string;
    tags: string[];
    score: number;
}

export interface LabelResult {
    applied: boolean;
    label: TicketLabel;
    ticketId: string;
    appliedAt: string;
}

function searchCorpus(query: string): TicketSearchResult[] {
    const terms = query.toLowerCase().split(/\s+/);
    return corpus
        .map((pair) => {
            const text = (pair.issue + " " + pair.resolution).toLowerCase();
            const score = terms.reduce((s, t) => s + (text.includes(t) ? 1 : 0), 0);
            return { ...pair, score };
        })
        .filter((p) => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
}

export const ticketTools = {
    searchPastTickets: tool({
        description: "Search past resolved tickets for similar issues and their resolutions",
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }): Promise<TicketSearchResult[]> => searchCorpus(query),
    }),

    applyLabel: tool({
        description: "Apply a label to the ticket in the ticket system",
        inputSchema: z.object({
            label: z.enum(["bug", "known-issue", "escalation", "needs-info"]),
        }),
        execute: async ({ label }): Promise<LabelResult> => ({
            applied: true,
            label,
            ticketId: "T-1234",
            appliedAt: new Date().toISOString(),
        }),
    }),
};

// Approval policy lives with the tools, not buried in the route
export const ticketToolApproval = {
    applyLabel: "user-approval",
} as const;

export const SYSTEM_PROMPT = `You are a support triage agent.
For each ticket:
1. Search the knowledge base EXACTLY ONCE per ticket with a single query covering the whole issue. Do not run multiple searches.
2. Propose a label via applyLabel (execution requires human approval — do not retry after a denial; report it instead).
3. Answer briefly: name the matched resolution, state your confidence, and mention the proposed label. Never list raw search results verbatim.
4. After a human approval decision arrives, report the outcome only: label applied (with the label name) or denied. NEVER ask for approval again, restate the approval question, or re-propose the same label — the decision is already made.`;

export type TriageMessage = UIMessage<unknown, never, InferUITools<typeof ticketTools>>;

export type SearchPart = Extract<TriageMessage["parts"][number], { type: "tool-searchPastTickets" }>;
export type LabelPart = Extract<TriageMessage["parts"][number], { type: "tool-applyLabel" }>;