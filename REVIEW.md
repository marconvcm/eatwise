# Toptal Recruiter Review (Project Requirements)

## Quick assessment
- The backend exposes REST endpoints for ledger entries and admin reporting, with token-based auth and role-based access control.
- The mobile app lists entries by day, shows total calories against a per-user threshold, and includes an invite flow.
- There are **two notable requirement gaps**: Nutritionix API usage (USDA is used instead) and invite generation of password/token for the invited user.

## Requirements coverage
### Food entries (CRUD + list)
- Backend supports create/read/update/delete for a user’s own entries, with validation and date/time on each entry.
- Admin has separate endpoints for managing all users’ entries.
- The UI lists entries by day and opens a modal for adding/editing entries.

### Daily calorie limit warning
- Each user has a configurable `kcalThreshold` (default 2100) on their profile.
- The home screen displays a gauge bar against that threshold, enabling a visual warning when the daily total approaches/exceeds the limit.

### Admin role + reporting
- Admin-only endpoints exist for managing all entries and fetching reports.
- Reports include a weekly comparison (last 7 days vs. prior 7 days) and per-user calorie averages for the previous 7 days.

### Authentication/authorization
- API uses Bearer token authentication in the backend.
- Fixture users provide predefined access tokens for development.

### Autocomplete (Nutritionix)
- Autocomplete currently uses the USDA FoodData Central API via a Spring Cloud Gateway proxy.
- This does not match the requirement to use Nutritionix; expect to swap the gateway target and the frontend service if strict compliance is required.

### Invite a friend
- The app has a modal to send a friend invite (name/email/message) and the backend creates an invite and sends an email.
- The requirement says to generate a password and token on-the-fly for the invited friend; this isn’t implemented in the current backend.

### Sample data
- The backend bootstraps fixture users and sample ledger entries from CSV files on startup.

## Recruiter-style questions for the candidate
1. **Nutritionix vs USDA**: I see USDA FoodData Central being used instead of Nutritionix. Was this a deliberate substitution, and how fast could you pivot to Nutritionix if required by the client?
2. **Invite token generation**: The requirement asks for generating a password and token during invite creation. Can you walk me through how you would implement this (and where you would surface the generated credentials)?
3. **Authorization**: How do you ensure non-admin users cannot access reporting data? Can you point to the exact enforcement points in the backend?
4. **Calorie threshold**: Is the per-user threshold easy to change for demos? Where would you update it and how would it flow to the UI?
5. **Data validation**: What safeguards prevent invalid or future-dated entries? Can you show the validation constraints?
6. **Reporting accuracy**: For the weekly comparison, how do you ensure the current day is included, and what date range is used for the previous week?
7. **Demo readiness**: What are the exact steps to bring the system up locally (backend + app), and what sample credentials/tokens would you use in the demo?

## Recommendation
- If this were a real client demo, I’d ask for the Nutritionix integration and the invite-token generation to be completed before final submission.
