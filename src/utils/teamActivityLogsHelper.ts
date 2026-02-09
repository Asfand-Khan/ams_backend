interface TimelineEntry {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  relativeTime: string;
  actor: { id: number; name: string; avatar: string | null } | null;
  icon: string;
  color: string;
  target?: { id: number; name: string; avatar: string | null } | null;
  metadata: Record<string, any>;
}
/* =========================================================
   Pakistan Date Formatter
========================================================= */
export function formatPakistanDate(date: Date): string {
  return date
    .toLocaleDateString("en-GB", {
      timeZone: "Asia/Karachi",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
}

/* =========================================================
   Pakistan Time Formatter (with seconds)
========================================================= */
export function formatPakistanTime(date: Date): string {
  return date.toLocaleTimeString("en-PK", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

/* =========================================================
   Relative Time (PKT)
========================================================= */
export function getRelativeTime(date: Date): string {
  const pktOffsetMs = 5 * 60 * 60 * 1000;

  const now = new Date(Date.now() + pktOffsetMs);
  const target = new Date(date.getTime() + pktOffsetMs);

  const diffMs = now.getTime() - target.getTime();
  if (diffMs < 0) return "in the future";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 45) return "just now";

  if (minutes < 60)
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;

  if (hours < 24) {
    if (minutes % 60 === 0)
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

    const remainingMinutes = minutes % 60;
    const hourText = hours === 1 ? "1 hour" : `${hours} hours`;
    const minText =
      remainingMinutes === 1 ? "1 minute" : `${remainingMinutes} minutes`;

    return `${hourText} ${minText} ago`;
  }

  if (days < 7) return days === 1 ? "yesterday" : `${days} days ago`;

  if (weeks < 4) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;

  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;

  if (years === 1) {
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return "1 year ago";
    return `1 year ${remainingMonths} month${
      remainingMonths > 1 ? "s" : ""
    } ago`;
  }

  return `${years} years ago`;
}

export function toTitleCase(str: string | null | undefined): string {
  if (!str) return "—";
  return str
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getActorName(log: any): string {
  return log.actor?.full_name ?? "System";
}

export function getTargetName(log: any): string {
  return log.targetUser?.full_name ?? "a team member";
}

export function getTargetObject(log: any) {
  return log.targetUser
    ? {
        id: log.targetUser.id,
        name: log.targetUser.full_name,
        avatar: log.targetUser.profile_picture ?? null,
      }
    : null;
}

export function formatProfessionalTimelineEntry(log: any): any {
  const actorName = getActorName(log);
  const targetName = getTargetName(log);

  const base = {
    id: log.id,
    title: "Activity",
    subtitle: "Action recorded",
    date: formatPakistanDate(log.performed_at),
    time: formatPakistanTime(log.performed_at),
    relativeTime: getRelativeTime(log.performed_at),
    actor: log.actor
      ? {
          id: log.actor.id,
          name: actorName,
          avatar: log.actor.profile_picture ?? null,
        }
      : null,
       icon: "history",
    color: "#9E9E9E",
    target: null,
    metadata: {
      projectId: log.entity_id,
      ...(log.field_name && { field: log.field_name }),
      ...(log.old_value && { oldValue: log.old_value }),
      ...(log.new_value && { newValue: log.new_value }),
    },
  };

 switch (log.action) {
  // ── Project Lifecycle ───────────────────────────────────────
  case "created":
    return {
      ...base,
      icon: "add_circle_outline",
      color: "#4CAF50",
      title: "Project Created",
      subtitle: `${actorName} created the project`,
    };

  case "updated":
    const updatedField = log.field_name
      ? ` (${toTitleCase(log.field_name)})`
      : "";
    return {
      ...base,
      icon: "edit",
      color: "#3F51B5",
      title: "Project Updated",
      subtitle: `${actorName} updated project details${updatedField}`,
    };

  case "deleted":
    return {
      ...base,
      icon: "delete_forever",
      color: "#D32F2F",
      title: "Project Deleted",
      subtitle: `${actorName} permanently deleted the project`,
    };

  case "closed":
    return {
      ...base,
      icon: "task_alt",
      color: "#4CAF50",
      title: "Project Closed",
      subtitle: `${actorName} closed the project`,
    };

  case "reopened":
    return {
      ...base,
      icon: "replay",
      color: "#FF9800",
      title: "Project Reopened",
      subtitle: `${actorName} reopened the project`,
    };

  // ── Assignment ────────────────────────────────────────────────
  case "assigned":
    return {
      ...base,
      icon: "person_add",
      color: "#2196F3",
      title: "Team Member Assigned",
      subtitle: `${actorName} assigned ${targetName} to the project`,
      target: getTargetObject(log),
    };

  case "reassigned":
    return {
      ...base,
      icon: "person_add_alt_1",
      color: "#1976D2",
      title: "Assignment Updated",
      subtitle: `${actorName} reassigned the project to ${targetName}`,
      target: getTargetObject(log),
    };

  case "revoked":
    return {
      ...base,
      icon: "person_remove",
      color: "#F44336",
      title: "Team Member Removed",
      subtitle: `${actorName} removed ${targetName} from the project`,
      target: getTargetObject(log),
    };

  // ── Status ────────────────────────────────────────────────────
  case "status_changed":
    const fromStatus = toTitleCase(log.old_value);
    const toStatus = toTitleCase(log.new_value);
    return {
      ...base,
      icon: "swap_horiz",
      color: "#FF9800",
      title: "Project Status Updated",
      subtitle: `Status changed from ${fromStatus} to ${toStatus}`,
    };

  case "status_added":
    const addedStatus = toTitleCase(log.field_name || log.new_value);
    return {
      ...base,
      icon: "label",
      color: "#607D8B",
      title: "Status Added",
      subtitle: `${actorName} added status "${addedStatus}"`,
    };

  case "status_deleted":
    const removedStatus = toTitleCase(log.field_name);
    return {
      ...base,
      icon: "label_off",
      color: "#757575",
      title: "Status Removed",
      subtitle: `${actorName} removed status "${removedStatus}"`,
    };

  // ── Priority ──────────────────────────────────────────────────
  case "priority_changed":
    const fromPriority = toTitleCase(log.old_value);
    const toPriority = toTitleCase(log.new_value);
    return {
      ...base,
      icon: "priority_high",
      color: "#FF5722",
      title: "Priority Updated",
      subtitle: `Priority changed from ${fromPriority} to ${toPriority}`,
    };

  // ── Comments ──────────────────────────────────────────────────
  case "comment_added":
    let commentPreview = (log.new_value ?? "").trim();
    if (commentPreview.length > 100) {
      commentPreview = commentPreview.substring(0, 97) + "…";
    }
    return {
      ...base,
      icon: "chat_bubble_outline",
      color: "#9C27B0",
      title: "Comment Added",
      subtitle: commentPreview
        ? `${actorName} added a comment: "${commentPreview}"`
        : `${actorName} added a comment`,
    };

  case "comment_updated":
    return {
      ...base,
      icon: "edit_note",
      color: "#673AB7",
      title: "Comment Updated",
      subtitle: `${actorName} updated a comment`,
    };

  case "comment_deleted":
    return {
      ...base,
      icon: "delete_outline",
      color: "#E91E63",
      title: "Comment Deleted",
      subtitle: `${actorName} deleted a comment`,
    };

  // ── Attachments ───────────────────────────────────────────────
  case "attachment_added":
    return {
      ...base,
      icon: "attach_file",
      color: "#009688",
      title: "Attachment Added",
      subtitle: `${actorName} uploaded an attachment`,
    };

  case "attachment_removed":
    return {
      ...base,
      icon: "attachment_off",
      color: "#FF5722",
      title: "Attachment Removed",
      subtitle: `${actorName} removed an attachment`,
    };

  // ── Fallback ───────────────────────────────────────────────────
  default:
    return {
      ...base,
      subtitle: `${actorName} performed action: ${log.action.replace(/_/g, " ")}`,
    };
}

}
