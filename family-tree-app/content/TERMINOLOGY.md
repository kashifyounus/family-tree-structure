# Family tree terminology (for product review)

We avoid database or developer terms in the app. Below is the mapping we use today — tell us if you prefer different standard genealogy wording.

| Internal (code only) | Shown in app | Notes |
|----------------------|--------------|--------|
| `union` | **Marriage** | Covers spousal partnerships recorded in the tree. If you need "Partnership" for unmarried couples, we can add a relationship type later. |
| `family_code` | **Member reference** | Short ID on each person (e.g. FAM-10004). Alternative: "Family ID", "Person ID". |
| Focal person | **Starting member / You in the tree** | The person your private profile is anchored to. |
| Local / SQLite | **Private archive (this device)** | |
| Online / API | **Family cloud (shared)** | |
| API URL | **Family website address** | |
| JSON backup | **Backup file** | |
| Google Drive upload | **Save copy to Google Drive** | |

**Open questions for you**

1. **Marriage** vs **Partnership** vs **Couple** — which label fits your culture and legal records?
2. **Member reference** — do you want a friendlier label (e.g. "Family number")?
3. **Private archive** — or "Personal family records", "On-phone records"?
4. **Family cloud** — or "Shared family site", "Mughal family portal"?

Reply with preferences and we will update `content/businessCopy.ts` in one place.
