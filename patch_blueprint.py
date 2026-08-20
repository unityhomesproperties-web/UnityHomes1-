import json

with open('firebase-blueprint.json', 'r') as f:
    data = json.load(f)

waitlist_entities = {
    "WaitlistEntry": {
      "title": "Waitlist Entry",
      "description": "Represents a user who has joined the waitlist.",
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "full_name": { "type": "string", "maxLength": 100 },
        "email": { "type": "string", "maxLength": 255 },
        "phone": { "type": "string", "maxLength": 20 },
        "state": { "type": "string", "maxLength": 50 },
        "role": { "type": "string" },
        "organisation_name": { "type": "string", "maxLength": 150 },
        "interests": { "type": "array" },
        "status": { "type": "string" }
      },
      "required": ["id", "full_name", "email", "phone", "state", "role", "interests", "status"]
    },
    "ActivityLog": {
      "title": "Activity Log",
      "description": "Immutable log of activities.",
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "action": { "type": "string" },
        "timestamp": { "type": "timestamp" }
      }
    },
    "BroadcastLog": {
      "title": "Broadcast Log",
      "description": "Log of broadcasted emails.",
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "subject": { "type": "string" }
      }
    },
    "AnalyticsSnapshot": {
      "title": "Analytics Snapshot",
      "description": "Daily/hourly aggregated metrics.",
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "timestamp": { "type": "timestamp" }
      }
    },
    "Admin": {
      "title": "Admin",
      "description": "System administrator.",
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "email": { "type": "string" },
        "role": { "type": "string" }
      }
    },
    "SystemSetting": {
      "title": "System Setting",
      "description": "Global configuration.",
      "type": "object",
      "properties": {
        "id": { "type": "string" }
      }
    },
    "EmailQueue": {
      "title": "Email Queue",
      "description": "Queue for sending emails.",
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "to": { "type": "string" },
        "status": { "type": "string" }
      }
    }
}

waitlist_firestore = {
    "/waitlist_entries/{entryId}": {
      "schema": "WaitlistEntry",
      "description": "Stores waitlist registrations."
    },
    "/activity_logs/{logId}": {
      "schema": "ActivityLog",
      "description": "Stores immutable activity logs."
    },
    "/broadcast_logs/{broadcastId}": {
      "schema": "BroadcastLog",
      "description": "Stores email broadcast logs."
    },
    "/analytics_snapshots/{snapshotId}": {
      "schema": "AnalyticsSnapshot",
      "description": "Stores time-series analytics."
    },
    "/admins/{adminId}": {
      "schema": "Admin",
      "description": "Stores administrator roles and profiles."
    },
    "/system_settings/{settingId}": {
      "schema": "SystemSetting",
      "description": "Stores dynamic system configuration."
    },
    "/email_queue/{emailId}": {
      "schema": "EmailQueue",
      "description": "Stores emails to be dispatched by worker."
    }
}

data['entities'].update(waitlist_entities)
data['firestore'].update(waitlist_firestore)

with open('firebase-blueprint.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Blueprint updated.")
