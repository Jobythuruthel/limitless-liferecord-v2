export type IntegrationProviderId = "basecamp" | "slack";

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

/** A normalized item pulled from an external provider, ready to become a DailyTask. */
export interface IngestedItem {
  externalId: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD, derived via the mapping rules
  sourceRef: string; // e.g. "basecamp:todo:12345"
}

export interface MappingRules {
  /** Which external channel/project ids map to date-tagging behavior. */
  channelOrProjectIds: string[];
  /** "created_date" tags the task with the item's creation date; "today" always tags today. */
  dateTaggingStrategy: "created_date" | "today" | "due_date";
}

export interface SyncResult {
  status: "success" | "error";
  itemsIngested: number;
  cursor?: string;
  message?: string;
}
