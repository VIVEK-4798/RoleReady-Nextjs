# Backend API Migration Guide

## Express → Next.js API Routes

### Architecture Change
**Old:** Express server (`backend/server.js`)
**New:** Next.js API Routes (`app/api/`)

---

## API Structure

```
app/api/
├── auth/              # NextAuth endpoints
│   └── [...nextauth]/ # /api/auth/signin, /api/auth/signout
├── users/
│   ├── route.ts       # GET, POST /api/users
│   └── [id]/
│       ├── route.ts           # GET, PUT, DELETE /api/users/:id
│       ├── skills/route.ts    # GET, POST /api/users/:id/skills
│       └── profile/route.ts   # GET, PUT /api/users/:id/profile
├── skills/
│   ├── route.ts       # GET, POST /api/skills
│   └── [id]/route.ts  # GET, PUT, DELETE /api/skills/:id
├── roles/
│   └── route.ts       # GET /api/roles
├── admin/
│   ├── roles/         # Admin role management
│   └── skills/        # Admin skill management
└── notifications/
    └── route.ts       # GET, POST, PATCH /api/notifications
```

---

## Endpoint Mapping

### Authentication
```
Old: POST /api/auth/login
New: POST /api/auth/callback/credentials (NextAuth)

Old: POST /api/auth/register
New: POST /api/users (with role field)
```

### Users
```
Old: GET  /api/users/:id
New: GET  /api/users/[id]

Old: PUT  /api/users/:id/profile
New: PUT  /api/users/[id]/profile
```

### Skills
```
Old: GET  /api/skills
New: GET  /api/skills

Old: POST /api/users/:userId/skills
New: POST /api/users/[id]/skills
```

### Admin
```
Old: GET  /api/admin/categories (was categories)
New: GET  /api/admin/roles (renamed to roles)

Old: POST /api/admin/skills
New: POST /api/admin/skills
```

---

## API Route Pattern

### Old (Express)
```javascript
// backend/routes/users.js
router.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ success: true, data: user });
});
```

### New (Next.js)
```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await User.findById(id);
  return successResponse(user);
}
```

---

## HTTP Methods
- `GET` - Fetch data
- `POST` - Create new resource
- `PUT` - Update entire resource
- `PATCH` - Partial update
- `DELETE` - Remove resource

---

## Authentication

### Old (Custom JWT)
```javascript
const token = jwt.sign({ userId }, SECRET);
res.cookie('token', token);
```

### New (NextAuth v5)
```typescript
import { auth } from '@/lib/auth';

// In API route
const session = await auth();
if (!session?.user) {
  return errors.unauthorized();
}
```

---

## Response Format

### Standard Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Standard Error
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

Helper functions in `lib/utils/api.ts`:
- `successResponse(data, message, status)`
- `errors.badRequest()`, `errors.unauthorized()`, `errors.notFound()`, etc.

---

## Key Changes
✅ TypeScript for type safety
✅ NextAuth for authentication
✅ Edge Runtime compatible (where possible)
✅ Built-in request/response handling
✅ Automatic API route generation from file structure
