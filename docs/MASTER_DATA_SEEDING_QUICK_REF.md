# 🌱 Master Data Seeding - Quick Reference

## 🚀 Quick Start

```bash
npm run seed
```

That's it! The seeder will:
- ✅ Create/update 45+ skills
- ✅ Create/update 10 roles
- ✅ Map skills to roles (benchmarks)

---

## 📁 Files

```
scripts/
├── seed.ts                # Main runner
├── utils/seeder.ts        # Utilities
└── seeds/
    ├── skills.ts          # 45+ skills
    ├── roles.ts           # 10 roles
    └── benchmarks.ts      # Role-skill mappings
```

---

## ✏️ Add New Data

### Add Skill

Edit `scripts/seeds/skills.ts`:
```typescript
{
  name: 'Rust',
  domain: 'languages',
  description: 'Systems programming language',
  isActive: true,
}
```

### Add Role

Edit `scripts/seeds/roles.ts`:
```typescript
{
  name: 'Security Engineer',
  description: 'Ensures security',
  colorClass: 'bg-red-600',
  isActive: true,
}
```

### Add Benchmarks

Edit `scripts/seeds/benchmarks.ts`:
```typescript
{
  roleName: 'Security Engineer',
  skills: [
    { skillName: 'Python', importance: 'required', weight: 8, requiredLevel: 'intermediate' },
  ],
}
```

Then run: `npm run seed`

---

## 🔄 Re-running

**Safe to re-run!**

- Skills: Updates existing, creates new
- Roles: Updates existing, creates new
- Benchmarks: Replaces all for each role

---

## 📊 Current Data

- **Skills**: 45
- **Roles**: 10
- **Benchmarks**: 10 roles fully mapped

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "MONGODB_URI not defined" | Add to `.env.local` |
| "Skill not found" | Add skill to `skills.ts` first |
| "Role not found" | Add role to `roles.ts` first |

---

## 📚 Full Documentation

See `docs/MASTER_DATA_SEEDING.md` for complete guide.

---

**Status**: ✅ Ready to use
