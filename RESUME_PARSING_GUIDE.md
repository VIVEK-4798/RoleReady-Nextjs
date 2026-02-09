# Resume Parsing - Quick Setup Guide

## 📋 What This Does

The resume parsing feature automatically extracts skills from your uploaded resume (PDF/DOCX) and suggests them to add to your profile. This saves you from manually entering all your skills!

## 🚀 Quick Start

### Step 1: Seed Skills into Database

First, you need to populate the database with common tech skills so the parser knows what to look for.

Run this command in your terminal:

```bash
npm run seed-skills
```

This will add 100+ common skills including:
- **Languages**: JavaScript, TypeScript, Python, Java, Go, etc.
- **Frameworks**: React, Next.js, Node.js, Express, React Native, etc.
- **Databases**: MongoDB, SQL, PostgreSQL, MySQL, Firebase, etc.
- **Tools**: Git, GitHub, Postman, Docker, AWS, etc.

### Step 2: Upload Your Resume

1. Go to your **Profile Page**
2. Click the **Upload Resume** icon button (cloud icon) in the Resume section
3. Select your PDF or Word document (max 5MB)
4. Click **Upload Resume**

### Step 3: Parse Your Resume

1. After upload, you'll see an **"Extract Skills from Resume"** button
2. Click it to start parsing
3. The system will analyze your resume and find matching skills
4. Skills will appear with checkboxes (all auto-selected)

### Step 4: Review and Add Skills

1. Review the suggested skills
2. Uncheck any you don't want to add
3. Click **"Add X Skills"** button
4. Skills will be added to your profile with source='resume'

## 🔍 How It Works

### Text Extraction
- **PDF files**: Uses `pdf-parse` library to extract text
- **DOCX files**: Uses `mammoth` library to extract text

### Skill Matching
The parser uses **rule-based matching** (NOT AI/ML):

1. **Normalizes text**: Converts to lowercase, removes special chars
2. **Generates variations**: "React.js" → ["react", "reactjs", "react js"]
3. **Pattern matching**: Uses word boundaries and contains checks
4. **Filters duplicates**: Only suggests skills you don't already have

### Skill Variations Handled
- `React.js` matches `React`, `ReactJS`, `react.js`
- `Node.js` matches `Node`, `NodeJS`, `node.js`
- `React Native` matches `react native`, `reactnative`
- etc.

## 📝 Example Resume Skills Section

```
SKILLS
Frontend: React.js, Next.js, React Native, JavaScript, Tailwind CSS
Backend: Node.js, Express.js, MongoDB, Mongoose, SQL
Tools: GitHub, Postman, Vercel, Firebase
```

All of these will be detected if they exist in your skills database!

## 🐛 Troubleshooting

### "No skills in database" error
**Solution**: Run `npm run seed-skills` first

### No skills found in resume
**Possible causes**:
1. Skills in resume don't match database skill names
2. Check terminal console logs for details
3. Skills might be in images/logos (not parsed)

**Solutions**:
- Add skills manually first, then they'll be recognized
- Check console logs to see what text was extracted
- Make sure skills are in text format, not images

### File not found error
**Check**:
- Resume uploaded successfully
- File exists in `uploads/resumes/` folder
- Console logs show correct file path

## 📊 Viewing Logs

When you click "Extract Skills from Resume", check your terminal console for detailed logs:

```
[resumeParser] Parsing resume: YourResume.pdf (application/pdf)
[resumeParser] Looking for file: C:\...\uploads\resumes\...pdf
[resumeParser] File exists: true
[resumeParser] Extracted 2500 characters
[resumeParser] Found 150 skills in database
[resumeParser] ✓ Matched: JavaScript (variations: javascript, js)
[resumeParser] ✓ Matched: React (variations: react, reactjs)
[resumeParser] ✓ Matched: MongoDB (variations: mongodb, mongo)
[resumeParser] Total matches: 15
```

## 🎯 Your Resume Example

Based on your resume, these skills should be detected:
- ✅ React, React.js, React Native
- ✅ Next.js
- ✅ Node.js
- ✅ Express, Express.js
- ✅ MongoDB, Mongoose
- ✅ SQL
- ✅ Firebase, Appwrite
- ✅ JavaScript
- ✅ Tailwind CSS
- ✅ Material UI
- ✅ GitHub, Postman, Vercel
- ✅ Razorpay
- ✅ Google Analytics
- ✅ Expo
- ✅ Go

**Total expected**: ~20-25 skills from your resume!

## ⚙️ Manual Skill Addition

If the parser misses some skills, you can always:
1. Go to **Skills** page (navigation menu)
2. Search and add skills manually
3. Set your competency level
4. Request mentor validation

## 🔐 Security Notes

- Resume files are stored locally in `uploads/resumes/`
- Only the active resume is parsed
- Extracted text is stored but not exposed via API
- Only you can access your resume data

## 📈 Integration with Readiness Score

Skills extracted from resume:
- ✅ Count toward your readiness score
- ✅ Can be validated by mentors
- ✅ Show source='resume' tag
- ✅ Contribute to skill gap analysis

---

**Need Help?** Check the console logs or contact support!
