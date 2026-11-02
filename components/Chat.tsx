"use client";

import { LabelPart, SearchPart, TriageMessage } from "@/lib/tools";
import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import { FormEvent, useState } from "react";

export function LabelPanel({
  part,
  onDecision,
}: {
  part: LabelPart;
  onDecision: (approval: { id: string; approved: boolean }) => void;
}) {
  switch (part.state) {
    case "input-streaming":
      return <div>Proposing label…</div>;

    case "approval-requested":
      return (
        <div className="panel panel-approval">
          <p>
            Apply <strong>{part.input.label}</strong> to ticket T-1234?
          </p>
          <button
            className="approve"
            onClick={() => onDecision({ id: part.approval.id, approved: true })}
          >
            Approve
          </button>
          <button
            className="deny"
            onClick={() =>
              onDecision({ id: part.approval.id, approved: false })
            }
          >
            Deny
          </button>
        </div>
      );

    case "approval-responded":
      return (
        <div>
          Human {part.approval.approved ? "approved" : "denied"} the action.
        </div>
      );

    case "output-available":
      return (
        <div>
          Label applied: <strong>{part.output.label}</strong> at{" "}
          {part.output.appliedAt}
        </div>
      );

    case "output-denied":
      return <div>Human denied: label not applied.</div>;

    case "output-error":
      return <div className="error">Error: {part.errorText}</div>;

    default:
      return null;
  }
}

export function SearchPanel({ part }: { part: SearchPart }) {
  switch (part.state) {
    case "input-streaming":
      return <div>Searching knowledge base…</div>;

    case "input-available":
      return <div>Searching for "{part.input.query}"…</div>;

    case "output-available": {
      const hits = part.output; // TicketSearchResult[]
      return (
        <div className="panel">
          {hits.length === 0 ? (
            <p>No past resolutions found.</p>
          ) : (
            hits.map((hit, i) => (
              <p key={i}>
                <strong>{hit.issue}</strong> → {hit.resolution}
                <span className="score">score {hit.score}</span>
              </p>
            ))
          )}
        </div>
      );
    }

    case "output-error":
      return <div className="error">Search failed: {part.errorText}</div>;

    default:
      return null;
  }
}

export const SAMPLE_TICKETS = [
  "Preview Builds not appearing on pull requests",
  "Environment variable missing in Preview but present in Production",
  "Edge function timing out on long streaming requests",
];

export default function Chat() {
  const { messages, sendMessage, addToolApprovalResponse } =
    useChat<TriageMessage>({
      sendAutomaticallyWhen:
        lastAssistantMessageIsCompleteWithApprovalResponses,
    });
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const composer = (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="flex-1 p-2 rounded-lg border border-white/10"
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        placeholder="Paste a ticket…"
      />
      <button type="submit" className="send" disabled={!input.trim()}>
        Send
      </button>
    </form>
  );

  if (messages.length === 0) {
    return (
      <div>
        <div className="mt-6 w-full">
          <p className="muted">Try a sample ticket:</p>
          <div className="mt-3 flex flex-col gap-2">
            {SAMPLE_TICKETS.map((ticket) => (
              <button
                key={ticket}
                type="button"
                className="sample"
                onClick={() => sendMessage({ text: ticket })}
              >
                {ticket}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 w-full">{composer}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-md py-12 mx-auto stretch">
      <header className="header">
        <div className="brand">
          <div>
            <h1>Ticket Triage Agent</h1>
            <p>Knowledge-backed triage with human-gated execution</p>
          </div>
          <span className="status-chip">
            <span className="status-dot"></span>
            gated
          </span>
        </div>
      </header>
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap message">
          <div className="message-role">
            {message.role === "user" ? "you" : "agent"}
          </div>
          {message.parts.map((part, index) => {
            switch (part.type) {
              case "text":
                return <div key={`${message.id}-${index}`}>{part.text}</div>;

              case "tool-searchPastTickets":
                return (
                  <SearchPanel key={`${message.id}-${index}`} part={part} />
                );
              case "tool-applyLabel":
                return (
                  <LabelPanel
                    key={`${message.id}-${index}`}
                    part={part}
                    onDecision={addToolApprovalResponse}
                  />
                );
            }
            return null;
          })}
        </div>
      ))}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md">
        {composer}
      </div>
    </div>
  );
}
