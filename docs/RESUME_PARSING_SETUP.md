# Resume Parsing Setup Guide

## Quick Start

### 1. Install Required Dependencies

```bash
npm install pdf-parse mammoth
```

### 2. Verify File Structure

The following files have been created/modified:

**New Files:**
- `lib/services/resumeParser.ts` - Resume parsing service
- `app/api/users/[id]/resume/parse/route.ts` - Parse resume endpoint
- `app/api/users/[id]/resume/suggestions/route.ts` - Skill suggestions endpoints
- `app/(dashboard)/dashboard/profile/SkillSuggestionsReview.tsx` - UI component
- `docs/RESUME_PARSING.md` - Full documentation

**Modified Files:**
- `app/(dashboard)/dashboard/profile/NewProfileContent.tsx` - Added SkillSuggestionsReview component

### 3. Ensure Database Has Skills

The feature requires skills in your database to match against. Make sure you have skills populated in your `Skill` collection with:
- `name` - Skill name (e.g., "React", "Node.js")
- `normalizedName` - Lowercase version (e.g., "react", "node.js")
- `domain` - Skill category (e.g., "Frontend", "Backend")

### 4. Test the Feature

1. **Upload a Resume:**
   - Go to Profile page
   - Upload a PDF or DOCX resume
   
2. **Extract Skills:**
   - After upload, click "Extract Skills from Resume" button
   - Wait for parsing (1-5 seconds)
   
3. **Review Suggestions:**
   - Skills found in resume will appear with checkboxes
   - Select/deselect skills as needed
   - Click "Add X Skills" to confirm
   
4. **Verify:**
   - Check Skills section - new skills should appear
   - Check /dashboard/skills - skills should be there with source='resume'
   - Skills contribute to readiness score

## API Endpoints Created

```
POST   /api/users/[id]/resume/parse          - Parse resume and extract skills
GET    /api/users/[id]/resume/suggestions    - Get skill suggestions
POST   /api/users/[id]/resume/suggestions    - Confirm and add skills to profile
```

## How Users Will Use It

### Step 1: Upload Resume
```
Profile Page → Resume Section → Upload Resume → Select File → Upload
```

### Step 2: Parse Resume
```
Profile Page → "Extract Skills from Resume" button appears → Click
```

### Step 3: Review & Confirm
```
Skill Suggestions appear → Select desired skills → "Add X Skills"
```

### Step 4: Skills Added
```
Skills appear in profile → Available for mentor validation → Count toward readiness
```

## Integration with Readiness Score

Skills added from resume contribute to readiness calculation:

1. **Skill Coverage**: Each skill matched against target role requirements
2. **Skill Level**: Resume skills start at 'intermediate' level
3. **Validation Status**: Skills can be validated by mentors (none → pending → validated)
4. **Source Tracking**: `source: 'resume'` distinguishes from manually added skills

## Troubleshooting

### Issue: "pdf-parse not installed"
**Solution:**
```bash
npm install pdf-parse
```

### Issue: "mammoth not installed"
**Solution:**
```bash
npm install mammoth
```

### Issue: No skills found in resume
**Possible Reasons:**
1. Skills in resume don't match database skill names
2. Resume is poorly formatted (scanned image, complex layout)
3. Skills are abbreviated or use different terminology

**Solutions:**
- Add more skills to database with common variations
- Ask user to ensure resume is text-based (not scanned)
- Check that skill.normalizedName matches common usage

### Issue: Parse button doesn't appear
**Check:**
1. Is resume uploaded? (resume?.hasResume should be true)
2. Is SkillSuggestionsReview component imported?
3. Are there console errors?

### Issue: Skills not being added
**Check:**
1. Browser console for API errors
2. MongoDB logs for UserSkill insert errors
3. Ensure skills exist in Skill collection
4. Check for duplicate key errors (skill already exists)

## Performance Notes

- **Parsing Time**: 1-5 seconds depending on resume size
- **File Size Limit**: Controlled by your upload configuration
- **Concurrent Parsing**: One resume at a time per user
- **Cache**: Parse results stored in Resume.extractedData

## Security Considerations

✅ **Authentication**: All endpoints require valid session
✅ **Authorization**: Users can only access their own resumes
✅ **File Validation**: Only PDF/DOCX files accepted
✅ **No Public Access**: Resume files stored in non-public directory

## Next Steps

1. **Test with sample resumes** - Try various formats and skill sets
2. **Monitor parsing accuracy** - Check which skills are/aren't being found
3. **Expand skill database** - Add more skills and variations
4. **Add experience parsing** - Extract job history (future enhancement)
5. **Improve matching** - Add synonyms, abbreviations (future enhancement)

## Support

For issues or questions:
- Check full documentation: `docs/RESUME_PARSING.md`
- Review API responses in browser console
- Check server logs for parsing errors
- Verify database has skills to match against
