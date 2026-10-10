---
id: "0083"
title: Let visitors sign up for user accounts, with clear field-level errors on sign-up and sign-in
status: accepted
date: "2026-10-10"
scope: core
tags: [auth, users, profiles, web, forms, accessibility]
related: ["0020", "0022", "0024", "0074", "0079"]
supersedes: []
---

# 0083. Let visitors sign up for user accounts, with clear field-level errors on sign-up and sign-in

## Context

`web` had a working Login page but no way to create an account. The Sign up page needs to collect a name, and both pages need validation that tells people exactly what to fix.

## Decision

- **Fields:** first name (required), last name (optional), email, password and a password confirmation.
- **Validation** runs in the form on submit and again in the API, from shared contracts (`registerRequestSchema`):
  - required fields must be filled;
  - the email needs an `@` and a `.` after it, with no spaces (`emailSchema`, also used by sign-in);
  - the password must meet the policy ([0024](0024-password-policy.md));
  - the confirmation must match (checked in the form; it isn't sent).
- **Errors:** a failed submit shows a red alert at the top of the form ("There were problems with your sign-up"), marks each failing field with its reason as helper text, and moves focus to the first one. Sign-in does the same: required fields and the email rule, plus "Incorrect email or password" from the API, which marks both fields.
- **API:** `POST /api/auth/register` creates a `user` account ([0022](0022-store-all-users-in-one-collection-with-roles.md)), signs it in with the usual cookies ([0020](0020-authentication.md)), and returns `201 { user }`. A taken email (compared lowercased) is `409` naming the `email` field; sign-ups are rate-limited to 10 per IP per hour.
- **Names** live in the user's `profile` subdocument (`{ firstName, lastName? }`), apart from the auth fields, as the profile design requires ([0074](0074-generate-banners-as-our-own-poly-pattern.md)). `userDisplayName()` shows them (falling back to the email), e.g. in the Navbar.
- **After signing up or in,** the shell sends the person on to where they were going, or Home ([0079](0079-route-web-pages-through-a-shell-with-audiences-and-sequential-transitions.md)).

## Alternatives considered

- **A toast for form errors:** an alert in the form stays next to the fields being fixed.
- **Applying the password policy at sign-in:** existing passwords may predate it, so sign-in only requires a password.

## Consequences

- `profile` exists on users from now on; accounts created before (such as the seeded dev account) have none until they edit their profile.
- The same alert-plus-field pattern should be used by future `web` forms.
