## Backend (server folder)

Express + MongoDB Atlas (Mongoose) backend, containing models based on the PRD:
User, Listing, Match, Message.

The database is hosted on MongoDB Atlas (cloud), so all team members share the
same database regardless of their computer or network.

### Setup
1. `cd server`
2. `npm install`
3. Copy `.env.example` to `.env`
4. Add the MongoDB Atlas connection string to `.env` (ask a team member for
   the username/password if you don't have it):
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.95wjurc.mongodb.net/skill-exchange-board?retryWrites=true&w=majority
   PORT=5000
   ```
5. `npm run dev`

If the connection is successful, the terminal will show:
```
Server running on http://localhost:5000
MongoDB connected: ...
```

### Models
- **User** — name, email, passwordHash, photoUrl, location, bio, createdAt
- **Listing** — userId, type (offer/request), title, category, description, radiusKm, status, createdAt
- **Match** — listingIdA, listingIdB, matchedAt
- **Message** — senderId, receiverId, listingId, content, timestamp

Models are located in `server/models/`, and the DB connection is set up in
`server/config/db.js`.