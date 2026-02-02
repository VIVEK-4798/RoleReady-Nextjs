# Database Migration Guide

## MySQL → MongoDB

### Why MongoDB?
- Better for nested documents (profiles, skills arrays)
- No complex joins needed
- Schema flexibility for evolving features
- Easier scaling

---

## Connection Setup

### 1. Create MongoDB Database

**Database Name:** `roleready` (or your choice)

**Connection String:**
```
mongodb://localhost:27017/roleready
```

Or for MongoDB Atlas (cloud):
```
mongodb+srv://username:password@cluster.mongodb.net/roleready
```

### 2. Environment Variable

Add to `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/roleready
# Or
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roleready

AUTH_SECRET=your-secret-key-here
AUTH_URL=http://localhost:3000
```

---

## Collections Required

MongoDB will auto-create collections when you insert data, but here's the structure:

### 1. **users** (Main user data)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,           // Unique, indexed
  password: String,        // Hashed with bcrypt
  mobile: String,
  image: String,
  role: String,            // 'user', 'mentor', 'admin'
  isActive: Boolean,
  profile: {
    bio: String,
    headline: String,
    location: String,
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String,
    education: [{ institution, degree, startDate, endDate }],
    experience: [{ company, title, description, skills, startDate, endDate }],
    projects: [{ name, description, url, githubUrl, technologies }],
    certificates: [{ name, issuer, issueDate, url }],
    resume: { fileUrl, fileName, uploadedAt, parsedText }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **skills** (Master skill list)
```javascript
{
  _id: ObjectId,
  name: String,              // "JavaScript", "React"
  normalizedName: String,    // "javascript", "react"
  domain: String,            // "frontend", "backend", "database"
  description: String,
  isActive: Boolean,
  createdBy: ObjectId,       // Admin who created
  createdAt: Date,
  updatedAt: Date
}
```

### 3. **userskills** (User's skill proficiency)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // → users
  skillId: ObjectId,         // → skills
  proficiency: Number,       // 0-100
  yearsOfExperience: Number,
  source: String,            // "manual", "resume", "validation"
  isVerified: Boolean,
  verifiedBy: ObjectId,      // → users (mentor)
  verifiedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. **roles** (Job roles - was "categories")
```javascript
{
  _id: ObjectId,
  name: String,              // "Frontend Developer", "Data Analyst"
  description: String,
  colorClass: String,        // For UI theming
  isActive: Boolean,
  benchmarks: [{             // Embedded skill requirements
    skillId: ObjectId,       // → skills
    importance: String,      // "required", "optional"
    weight: Number,          // 1-10
    requiredLevel: Number,   // Minimum proficiency
    isActive: Boolean
  }],
  updatedBy: ObjectId,       // → users (admin)
  createdAt: Date,
  updatedAt: Date
}
```

### 5. **targetroles** (User's target roles)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // → users
  roleId: ObjectId,          // → roles
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. **roadmaps** (Personalized learning paths)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // → users
  roleId: ObjectId,          // → roles
  currentReadinessScore: Number,
  targetScore: Number,
  estimatedCompletionDate: Date,
  steps: [{
    title: String,
    description: String,
    skillId: ObjectId,
    status: String,          // "not-started", "in-progress", "completed"
    resources: [{ type, url, title }],
    estimatedHours: Number,
    completedAt: Date,
    order: Number
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 7. **readinesssnapshots** (Historical readiness scores)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // → users
  roleId: ObjectId,          // → roles
  overallScore: Number,      // 0-100
  metRequiredSkills: Number,
  totalRequiredSkills: Number,
  skillScores: [{
    skillId: ObjectId,
    userProficiency: Number,
    requiredLevel: Number,
    gap: Number,
    weight: Number
  }],
  calculatedAt: Date
}
```

### 8. **notifications**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // → users
  type: String,              // "skill_verified", "roadmap_updated", etc.
  title: String,
  message: String,
  actionUrl: String,
  isRead: Boolean,
  metadata: Object,          // Additional context
  createdAt: Date
}
```

### 9. **otps** (For password reset)
```javascript
{
  _id: ObjectId,
  email: String,
  role: String,
  code: String,
  expiresAt: Date,
  isUsed: Boolean,
  createdAt: Date
}
```

---

## Indexes to Create

For better performance, create these indexes:

```javascript
// users collection
db.users.createIndex({ email: 1, role: 1 }, { unique: true });

// skills collection
db.skills.createIndex({ normalizedName: 1 }, { unique: true });
db.skills.createIndex({ domain: 1 });

// userskills collection
db.userskills.createIndex({ userId: 1, skillId: 1 }, { unique: true });

// targetroles collection
db.targetroles.createIndex({ userId: 1, roleId: 1 }, { unique: true });

// notifications collection
db.notifications.createIndex({ userId: 1, isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });
```

---

## Initial Data Seeding

### 1. Create Admin User
```javascript
db.users.insertOne({
  name: "Admin",
  email: "admin@roleready.com",
  password: "$2a$10$hashed_password_here",  // Use bcrypt
  role: "admin",
  isActive: true,
  profile: {},
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### 2. Add Sample Skills
```javascript
db.skills.insertMany([
  { name: "JavaScript", normalizedName: "javascript", domain: "frontend", isActive: true },
  { name: "React", normalizedName: "react", domain: "frontend", isActive: true },
  { name: "Node.js", normalizedName: "nodejs", domain: "backend", isActive: true },
  { name: "Python", normalizedName: "python", domain: "backend", isActive: true },
  { name: "MongoDB", normalizedName: "mongodb", domain: "database", isActive: true }
]);
```

### 3. Add Sample Role
```javascript
db.roles.insertOne({
  name: "Frontend Developer",
  description: "Build user interfaces for web applications",
  colorClass: "bg-blue-500",
  isActive: true,
  benchmarks: [
    { skillId: ObjectId("..."), importance: "required", weight: 10, requiredLevel: 80 },
    { skillId: ObjectId("..."), importance: "required", weight: 10, requiredLevel: 70 }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});
```

---

## Key Differences from MySQL

| MySQL | MongoDB |
|-------|---------|
| Tables | Collections |
| Rows | Documents |
| Columns | Fields |
| Joins | Embedded docs or refs |
| Schema enforced | Flexible schema |
| Primary Key (id) | _id (ObjectId) |

---

## Connection Code

The app connects automatically via `lib/db/mongoose.ts`:

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGODB_URI);
}

export default connectDB;
```

**Usage in API:**
```typescript
await connectDB();
const user = await User.findById(id);
```

---

## Testing Database Connection

Run this in MongoDB shell or Compass:
```javascript
use roleready
db.users.countDocuments()  // Should return 0 initially
```

Or test via API:
```
GET http://localhost:3000/api/health
```

Should return database connection status.
