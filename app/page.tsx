"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import type { TriageMessage, LabelPart, SearchPart } from "./tools";

function LabelPanel({
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
      return <div>Human denied — label not applied.</div>;

    case "output-error":
      return <div className="error">Error: {part.errorText}</div>;

    default:
      return null;
  }
}

function SearchPanel({ part }: { part: SearchPart }) {
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
                <span className="muted">
                  {" "}
                  (score {hit.score})
                </span>
              </p>
            ))
          )}
        </div>
      );
    }

    case "output-error":
      return (
        <div className="error">Search failed: {part.errorText}</div>
      );

    default:
      return null;
  }
}

export default function Chat() {
  const { messages, sendMessage, addToolApprovalResponse } =
    useChat<TriageMessage>({
      sendAutomaticallyWhen:
        lastAssistantMessageIsCompleteWithApprovalResponses,
    });
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages?.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap message">
          {message.role === "user" ? "User: " : "AI: "}
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
      >
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border rounded"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Paste a support ticket…"
        />
      </form>
    </div>
  );
}
