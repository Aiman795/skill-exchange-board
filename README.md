## Database (MongoDB / Mongoose)

Mongoose models have been created based on the PRD data model:
- **User** — name, email, passwordHash, photoUrl, location, bio, createdAt
- **Listing** — userId, type, title, category, description, radiusKm, status, createdAt
- **Match** — listingIdA, listingIdB, matchedAt
- **Message** — senderId, receiverId, listingId, content, timestamp

Models are located in `src/lib/models/`, and the DB connection is set up in `src/lib/mongodb.js`.

### Setup
1. Copy `.env.local.example` to `.env.local` and add your `MONGODB_URI`
2. Run `npm install`
3. Run `npm run dev`