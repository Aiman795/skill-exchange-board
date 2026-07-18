# My Contributions: Fatima Noor Ul Imran

This document covers the parts of the **Skill Exchange Board** project I worked on: initial React project scaffolding, the user profile feature, a responsiveness pass, and manual testing.

---

## 1. Project Scaffolding (React Setup)

**Goal:** Initialize the frontend with React + Tailwind CSS and set up a clean folder structure.

- Initialized the client with **Vite + React** (`npm create vite@latest client -- --template react`)
- Configured **Tailwind CSS** via `@tailwindcss/vite`
- Set up the base folder structure inside `client/src/`:
  ```
  src/
  ├── pages/
  ├── components/
  ├── lib/
  ├── App.jsx
  └── main.jsx
  ```
- Pushed the initial scaffold to the `dev` branch

**Note:** The project initially had a Next.js setup pushed by mistake. I migrated it to React (Vite), preserved the existing database models/config by moving them into `server/`, and kept a `backup/next-setup` branch during the transition so no work was lost.

---

## 2. User Profile Feature

**Goal:** Build a profile creation/edit form name, photo, general location, bio — storing location at neighborhood-level only, not an exact address, for privacy.

**Backend:**
- Added `multer` for photo upload handling, storing files in `server/uploads/profile-photos/`
- Built `getProfile` and `updateProfile` controllers (`server/controllers/user.controller.js`)
- Protected both routes with the existing JWT `authMiddleware`
- Served uploaded photos statically via Express

**Frontend:**
- Built `ProfileForm.jsx` handles name, photo (with live preview before upload), location, and bio (300-character limit)
- Built `Profile.jsx` with two states:
  - **View mode** — shows the saved photo, name, location, and bio, with an **Edit Profile** button
  - **Edit mode** — shows the form with **Save** and **Cancel**, and a success confirmation banner after saving
- Location is a single free-text field, with placeholder guidance ("neighborhood or area — not your exact address") rather than a precise address/geolocation field, in line with the privacy requirement

---

## 3. Responsiveness Pass

**Goal:** Ensure mobile + desktop responsiveness across pages.

- Tested at standard breakpoints (375px, 390px, 768px, 1024px, 1440px) using Chrome DevTools responsive mode, and separately on a real phone over the local network (`npm run dev -- --host`)
- Reviewed and fixed responsiveness on:
  - **Navbar** — added flex-wrap so nav links don't overflow on smaller screens; cleaned up conflicting inline styles that fought with Tailwind
  - **Home page** — rebuilt as a proper hero section + responsive feature-card grid (`grid-cols-1 sm:grid-cols-2`) instead of a single fixed-width block
  - **Profile page** — verified the form and view-mode card scale correctly down to mobile widths, avatar and buttons remain usable at small sizes

---

## 4. Testing

Testing was done manually:

- Verified the signup/login → token → profile flow end-to-end
- Confirmed profile GET/PUT requests correctly read from and write to MongoDB (checked via re-fetching after save/refresh)
- Verified photo upload: file saves correctly to the server, preview displays before save
- Verified form validation: required name field, 300-character bio limit enforced in the UI
- Verified the save confirmation banner appears and the form correctly returns to view mode after saving
- Cross-checked all of the above at each of the breakpoints listed in the responsiveness section above
