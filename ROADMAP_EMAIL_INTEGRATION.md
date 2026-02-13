# 🗺️ ROADMAP EMAIL INTEGRATION GUIDE

## Quick Integration for ROADMAP_CREATED Event

When you implement the roadmap generation feature, add this trigger to send the email.

---

## 📍 **Where to Add**

Find the file/endpoint where roadmaps are created or updated. This might be:
- `app/api/users/[id]/roadmap/route.ts`
- `lib/services/roadmapService.ts`
- Or wherever roadmap generation logic exists

---

## 📝 **Code to Add**

### **After Roadmap Creation/Update**:

```typescript
// After successfully creating/updating roadmap
// Example location: POST /api/users/[id]/roadmap

// ... roadmap creation logic ...

const roadmap = await createRoadmap(userId, roleId);

// Trigger roadmap created email (async, non-blocking)
const roleName = /* get role name from your data */;
const stepCount = roadmap.steps?.length || 0;

import('@/lib/email/emailEventService').then(({ triggerEmailEvent }) => {
  triggerEmailEvent({
    userId: userId,
    event: 'ROADMAP_CREATED',
    metadata: {
      roleName: roleName,
      roleId: roleId,
      stepCount: stepCount,
    },
  }).catch(err => console.error('[Roadmap] Roadmap created email failed:', err));
}).catch(err => console.error('[Roadmap] Email module import failed:', err));

// Continue with your response
return success({ roadmap });
```

---

## 🎯 **Complete Example**

```typescript
/**
 * POST /api/users/[id]/roadmap
 * Generate personalized roadmap
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: userId } = await params;
    
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }
    
    await connectDB();
    
    // Get user's target role
    const targetRole = await TargetRole.getActiveForUser(userId);
    if (!targetRole) {
      return errors.badRequest('No target role selected');
    }
    
    const roleId = typeof targetRole.roleId === 'object' 
      ? targetRole.roleId._id.toString() 
      : targetRole.roleId.toString();
      
    const roleName = targetRole.roleId && typeof targetRole.roleId === 'object' && 'name' in targetRole.roleId
      ? (targetRole.roleId as { name: string }).name
      : 'Unknown Role';
    
    // Generate roadmap
    const roadmap = await generateRoadmap(userId, roleId);
    
    // Trigger roadmap created email (async, non-blocking)
    import('@/lib/email/emailEventService').then(({ triggerEmailEvent }) => {
      triggerEmailEvent({
        userId: userId,
        event: 'ROADMAP_CREATED',
        metadata: {
          roleName: roleName,
          roleId: roleId,
          stepCount: roadmap.steps?.length,
        },
      }).catch(err => console.error('[Roadmap] Roadmap created email failed:', err));
    }).catch(err => console.error('[Roadmap] Email module import failed:', err));
    
    return success({
      roadmap,
      message: 'Roadmap generated successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}
```

---

## 📧 **Email Preview**

**Subject**: "Your {RoleName} roadmap is ready! 🗺️"

**Content**:
- 🗺️ Gradient header with map emoji
- Personalized message with role name
- Step count display
- Features included (prioritized paths, resources, tracking)
- "Start Step 1" CTA button
- Motivational quote

---

## ✅ **Checklist**

- [ ] Find roadmap generation endpoint
- [ ] Add email trigger after successful creation
- [ ] Include role name and step count in metadata
- [ ] Test by generating a roadmap
- [ ] Check console for success log
- [ ] Verify email received

---

## 🧪 **Testing**

1. **Generate a roadmap** for a user
2. **Check console** for:
   ```
   [EmailEvent] Successfully sent ROADMAP_CREATED email to user@example.com
   ```
3. **Check email inbox** for roadmap email
4. **Verify deduplication**: Generate roadmap again, should skip if already sent

---

## 🔍 **Console Logs**

**Success**:
```
[Roadmap] Roadmap created email triggered
[EmailEvent] Successfully sent ROADMAP_CREATED email to user@example.com
✅ Email sent successfully: <message-id>
```

**Already Sent**:
```
[EmailEvent] Event ROADMAP_CREATED already sent to user 123, skipping
```

**Error**:
```
[Roadmap] Roadmap created email failed: <error>
```

---

## 🎯 **When to Trigger**

Trigger this email when:
- ✅ New roadmap is generated for the first time
- ✅ Roadmap is significantly updated (optional)
- ❌ Minor roadmap updates (don't spam)

---

**Once integrated, users will receive a beautiful email when their personalized roadmap is ready!** 🗺️✨
