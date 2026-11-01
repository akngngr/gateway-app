import {
    convertToModelMessages,
    createUIMessageStreamResponse,
    isStepCount,
    streamText,
    toUIMessageStream,
    UIMessage,
} from "ai";
import { google } from "@ai-sdk/google";
import { ticketTools, ticketToolApproval, SYSTEM_PROMPT } from "../../tools";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
        model: google("gemini-3.5-flash-lite"),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        tools: ticketTools,
        toolApproval: ticketToolApproval,
        stopWhen: isStepCount(5),
        onError: (error) => {
            console.error("[chat route error]", error);
        },
        onStepFinish: (step) => {
            console.log(
                JSON.stringify({
                    step: step.stepNumber,
                    tools: step.toolCalls?.map((c) => c.toolName),
                    finish: step.finishReason,
                    usage: step.usage.totalTokens,
                })
            );
        },
    });

    return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
        onError: (error) =>
            error instanceof Error ? error.message : "An error occurred.",
    });
}