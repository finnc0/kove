import * as Sentry from "@sentry/nextjs";

export type Operation =
  // auth
  | "auth.sign_up"
  | "auth.sign_in"
  | "auth.sign_out"
  | "auth.google_disconnect"
  | "auth.password_change"
  // workspace
  | "workspace.create"
  | "workspace.delete"
  | "workspace.rename"
  | "workspace.fetch"
  // node (competitor)
  | "node.create"
  | "node.delete"
  | "node.update"
  | "node.analyze.ios"
  | "node.analyze.web"
  | "node.position_update"
  | "node.group"
  // findings
  | "findings.generate"
  | "findings.fetch"
  // idea
  | "idea.create"
  | "idea.delete"
  | "idea.evaluate"
  // canvas
  | "canvas.note_create"
  | "canvas.note_update"
  | "canvas.note_delete"
  | "canvas.group_create"
  | "canvas.group_delete"
  // billing
  | "billing.checkout"
  | "billing.portal"
  | "billing.webhook"
  | "billing.sync"
  // ai
  | "ai.synthesize_report"
  | "ai.analyze_node"
  | "ai.workspace_synthesis"
  | "ai.idea_evaluate"
  // scrapers
  | "scraper.appstore"
  | "scraper.reddit"
  | "scraper.jina"
  // user
  | "user.update"
  | "user.delete"
  | "user.password_change"
  // report
  | "report.export"
  | "report.fetch";

export function captureError(
  err: unknown,
  operation: Operation,
  context?: Record<string, unknown>,
) {
  Sentry.withScope((scope) => {
    const [domain, ...rest] = operation.split(".");
    scope.setTag("operation", operation);
    scope.setTag("domain", domain);
    scope.setTag("action", rest.join("."));
    if (context) scope.setContext("details", context);
    Sentry.captureException(err);
  });
}
