# Resume Parsing and Skill Extraction Feature

## Overview
This feature automatically extracts skills from uploaded resumes (PDF/DOCX) and suggests them to users. It helps users quickly populate their skill profile which contributes to their readiness score.

## How It Works

### 1. **Resume Upload**
- Users upload their resume in PDF or DOCX format
- Resume is stored in MongoDB via the Resume model
- Status is set to 'pending'

### 2. **Resume Parsing**
When a user views their profile:
- If resume is uploaded but not parsed, a button appears: "Extract Skills from Resume"
- Clicking triggers: `POST /api/users/[id]/resume/parse`
- The parser:
  - Extracts text from PDF/DOCX using `pdf-parse` and `mammoth` libraries
  - Normalizes text (lowercase, remove special chars)
  - Matches text against all skills in database using regex word boundaries
  - Returns skills found that user doesn't already have

### 3. **Skill Suggestions**
After parsing:
- `SkillSuggestionsReview` component displays found skills
- Skills are pre-selected by default
- User can:
  - Select/deselect individual skills
  - Select/deselect all
  - Confirm selection to add to profile
  - Dismiss suggestions

### 4. **Adding Skills to Profile**
When user confirms:
- `POST /api/users/[id]/resume/suggestions` is called
- Selected skills are added to `UserSkill` collection with:
  - `source: 'resume'` (distinguishes from manually added skills)
  - `level: 'intermediate'` (default)
  - `validationStatus: 'none'` (awaiting mentor validation)
- Resume model is updated: `skillsSynced: true`

### 5. **Readiness Score Impact**
Skills added from resume contribute to:
- **Skill Coverage**: More relevant skills = higher readiness
- **Skill Validation**: Resume skills can be validated by mentors for additional credibility
- **Profile Completeness**: Having skills improves overall profile quality

## API Endpoints

### Parse Resume
```
POST /api/users/[id]/resume/parse
```
**Response:**
```json
{
  "success": true,
  "resume_id": "...",
  "text_length": 5234,
  "total_skills_found": 25,
  "new_suggestions": 15,
  "already_have": 10,
  "suggestions": [
    {
      "skill_id": "...",
      "skill_name": "React",
      "domain": "Frontend"
    }
  ]
}
```

### Get Skill Suggestions
```
GET /api/users/[id]/resume/suggestions
```
**Response:**
```json
{
  "success": true,
  "count": 15,
  "resume_id": "...",
  "parsed_at": "2026-02-09T...",
  "suggestions": [...]
}
```

### Confirm Skill Suggestions
```
POST /api/users/[id]/resume/suggestions
Body: {
  "accepted_skill_ids": ["skill1", "skill2"],
  "level": "intermediate"  // optional, default: intermediate
}
```
**Response:**
```json
{
  "success": true,
  "added_count": 15,
  "message": "Added 15 skills from resume",
  "skills_added": [...]
}
```

## Dependencies

### NPM Packages Required
```bash
npm install pdf-parse mammoth
```

- **pdf-parse**: Extracts text from PDF files
- **mammoth**: Extracts text from DOCX files

## UI Components

### SkillSuggestionsReview
Located: `app/(dashboard)/dashboard/profile/SkillSuggestionsReview.tsx`

**Features:**
- Shows "Extract Skills from Resume" button if resume not parsed
- Displays skill suggestions with checkboxes
- Select/deselect all functionality
- Shows skill count and domain
- Add skills button with count
- Dismiss functionality

**Integration:**
```tsx
{resume?.hasResume && (
  <SkillSuggestionsReview onSkillsAdded={() => fetchProfile()} />
)}
```

## Database Models

### Resume Model
```typescript
{
  userId: ObjectId,
  filename: string,
  originalName: string,
  mimeType: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  extractedData: {
    rawText: string,
    skills: [{ name: string, confidence: number }],
  },
  skillsSynced: boolean,
  skillsSyncedAt: Date,
  isActive: boolean
}
```

### UserSkill Model
Skills added from resume have:
```typescript
{
  userId: ObjectId,
  skillId: ObjectId,
  level: 'intermediate',
  source: 'resume',  // ← Identifies resume-extracted skills
  validationStatus: 'none'
}
```

## Implementation Notes

### Rule-Based Matching
- **NOT ML/NLP**: Uses simple regex word boundary matching
- **Binary matching**: Skill either matches or doesn't (no confidence scores beyond basic 80%)
- **No new skills**: Only matches against existing skills in database
- **Exact name matching**: Uses skill.normalizedName for matching

### Text Normalization
```typescript
normalizeText(text):
  - Convert to lowercase
  - Remove special characters (keep +, #, ., -, _)
  - Collapse multiple spaces
  - Trim whitespace
```

### Skill Matching Strategy
- For short skills (≤3 chars): Exact word boundary match (e.g., "C++" won't match "C++Builder")
- For longer skills: Word boundary match (e.g., "React" won't match "Reactive")

### Error Handling
- If parsing fails: Resume status = 'failed', parseError stored
- If no text extracted: Returns error message
- If no skills found: Returns empty suggestions array
- Duplicate skills: Handled by unique index on (userId, skillId)

## Future Enhancements

Possible improvements:
1. **Experience Extraction**: Parse job titles, companies, dates
2. **Education Extraction**: Parse degrees, institutions
3. **Skill Confidence**: Better confidence scoring based on context/frequency
4. **Batch Processing**: Parse multiple resumes in background
5. **Resume Comparison**: Compare resume skills vs target role requirements
6. **ATS Optimization**: Suggest missing keywords for target roles

## Testing

### Test Scenarios
1. ✅ Upload PDF resume → Parse → Extract skills
2. ✅ Upload DOCX resume → Parse → Extract skills  
3. ✅ Parse resume with no recognizable skills → Empty suggestions
4. ✅ Parse resume with skills user already has → Filtered out
5. ✅ Confirm all suggestions → All added to profile
6. ✅ Confirm partial suggestions → Only selected added
7. ✅ Dismiss suggestions → No skills added
8. ✅ Re-parse after adding skills → Updated suggestions
9. ✅ Invalid file format → Error handling
10. ✅ Missing file → Error handling

### Manual Testing
1. Upload a resume to profile
2. Click "Extract Skills from Resume"
3. Verify skills appear in suggestions
4. Select/deselect skills
5. Click "Add X Skills"
6. Verify skills appear in Skills section with source='resume'
7. Navigate to /dashboard/skills → Verify skills are there
8. Check readiness score → Should reflect new skills

## Troubleshooting

### "pdf-parse not installed"
```bash
npm install pdf-parse
```

### "mammoth not installed"
```bash
npm install mammoth
```

### "Could not extract text from resume"
- Verify file is not corrupted
- Check file is valid PDF/DOCX
- Try re-uploading resume

### "No skills found in resume"
- Skills in resume may not match database skills
- Skills may be too generic (filtered out)
- Check skill names in database match resume terminology

### Skills not appearing after confirmation
- Check browser console for errors
- Verify API response shows success
- Refresh profile page
- Check MongoDB for UserSkill documents

## Performance Considerations

- **Parsing Time**: 1-5 seconds depending on resume size
- **Memory Usage**: Minimal, files are read synchronously
- **Database Queries**: Optimized with indexes on userId, skillId
- **Caching**: Resume parse result stored in extractedData

## Security

- ✅ Authentication required for all endpoints
- ✅ Users can only access their own resumes
- ✅ File type validation (PDF, DOC, DOCX only)
- ✅ Files stored securely in non-public directory
- ✅ No raw file content exposed in API responses
