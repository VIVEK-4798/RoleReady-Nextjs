/**
 * Resume Parsing Service
 * 
 * Extracts text and skills from PDF/DOCX resume files.
 * Uses rule-based matching against existing skills in the database.
 */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Resume, Skill, UserSkill } from '@/lib/models';

// Mammoth for DOCX parsing
let mammoth: any;

try {
  mammoth = require('mammoth');
  console.log('[resumeParser] mammoth loaded successfully');
} catch (e) {
  console.warn('[resumeParser] mammoth not installed. Run: npm install mammoth');
}

/* ============================================================================
   TEXT EXTRACTION FUNCTIONS
   ============================================================================ */

/**
 * Extract text from a PDF file
 * Using pdf2json (Node.js-native library, no browser API dependencies)
 */
async function extractTextFromPDF(filePath: string): Promise<string> {
  console.log(`[resumeParser] Extracting text from PDF: ${path.basename(filePath)}`);

  return new Promise((resolve, reject) => {
    try {
      const PDFParser = require('pdf2json');
      const pdfParser = new PDFParser();

      // Set up event handlers
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('[resumeParser] PDF parse error:', errData.parserError);
        reject(new Error(`Failed to parse PDF: ${errData.parserError}`));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text from all pages
          let text = '';
          if (pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const textItem of page.Texts) {
                  for (const run of textItem.R) {
                    if (run.T) {
                      // Decode URI-encoded text, fallback to raw text if malformed
                      try {
                        const decoded = decodeURIComponent(run.T);
                        text += decoded;
                      } catch (e) {
                        // If URI is malformed, use raw text
                        text += run.T;
                      }
                    }
                  }
                }
              }
              // Add line break after each page
              text += '\n';
            }
          }

          // Clean up: replace multiple spaces/newlines with single space
          text = text.replace(/[\s\n]+/g, ' ').trim();

          console.log(`[resumeParser] PDF extracted: ${text.length} characters`);
          console.log(`[resumeParser] Text preview: ${text.substring(0, 200)}`);
          resolve(text);
        } catch (err: any) {
          console.error('[resumeParser] Error processing PDF data:', err.message);
          reject(err);
        }
      });

      // Load and parse the PDF file
      pdfParser.loadPDF(filePath);

    } catch (e: any) {
      console.error('[resumeParser] Failed to load pdf2json:', e.message);
      reject(new Error('pdf2json library not installed. Run: npm install pdf2json'));
    }
  });
}

/**
 * Extract text from a DOCX file
 */
async function extractTextFromDOCX(filePath: string): Promise<string> {
  if (!mammoth) {
    throw new Error('mammoth library not installed. Run: npm install mammoth');
  }

  console.log(`[resumeParser] Extracting text from DOCX: ${path.basename(filePath)}`);
  const result = await mammoth.extractRawText({ path: filePath });
  console.log(`[resumeParser] DOCX extracted: ${result.value?.length || 0} characters`);

  return result.value || '';
}

/**
 * Extract text from resume file
 */
export async function extractTextFromResume(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(filePath);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return await extractTextFromDOCX(filePath);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/* ============================================================================
   TEXT NORMALIZATION
   ============================================================================ */

/**
 * Normalize text for skill matching
 * - Lowercase
 * - Keep alphanumeric and spaces
 * - Collapse multiple spaces
 */
export function normalizeText(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    // Keep letters, numbers, spaces, and common tech characters (+, #)
    // Remove dots and dashes to match variations (React.js = reactjs)
    .replace(/\.js\b/g, 'js') // React.js -> reactjs
    .replace(/[^a-z0-9\s\+\#]/g, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate skill variations/aliases for better matching
 * Examples: React.js -> [react, reactjs, react js]
 *           Node.js -> [node, nodejs, node js]
 */
function generateSkillVariations(skillName: string): string[] {
  const normalized = normalizeText(skillName);
  const variations = [normalized];

  // Handle .js frameworks (React.js, Node.js, Next.js, Vue.js)
  if (skillName.toLowerCase().includes('.js')) {
    const withoutDot = skillName.toLowerCase().replace(/\.js/g, 'js').replace(/[^a-z0-9]/g, '');
    variations.push(withoutDot);
    const base = skillName.toLowerCase().replace(/\.js/g, '').replace(/[^a-z0-9]/g, '');
    variations.push(base);
  }

  // Handle common variations
  const name = normalized.replace(/\s+/g, '');
  if (name !== normalized) {
    variations.push(name); // "react native" -> "reactnative"
  }

  // Add version without spaces
  const noSpaces = normalized.replace(/\s+/g, '');
  if (noSpaces !== normalized && !variations.includes(noSpaces)) {
    variations.push(noSpaces);
  }

  // Remove duplicates
  return [...new Set(variations)];
}

/* ============================================================================
   SKILL MATCHING (RULE-BASED, BINARY)
   ============================================================================ */

/**
 * Check if a skill appears in the normalized text
 * Now checks multiple variations of the skill name
 */
function isSkillInText(normalizedText: string, skill: SkillMatch): boolean {
  const variations = generateSkillVariations(skill.name);

  for (const variation of variations) {
    if (!variation || variation.length < 2) continue;

    // For very short skills (2-3 chars like "go", "c", "r"), require exact word match
    if (variation.length <= 3) {
      const regex = new RegExp(`\\b${escapeRegex(variation)}\\b`, 'i');
      if (regex.test(normalizedText)) {
        return true;
      }
    } else {
      // For longer skills, try both word boundary and contains
      const wordBoundary = new RegExp(`\\b${escapeRegex(variation)}\\b`, 'i');
      if (wordBoundary.test(normalizedText)) {
        return true;
      }

      // Also try without word boundaries for compound words
      if (normalizedText.includes(variation)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface SkillMatch {
  _id: string;
  name: string;
  normalizedName: string;
  domain?: string;
}

/**
 * Match resume text against skills from database
 */
export function matchSkillsInText(normalizedText: string, skills: SkillMatch[]): SkillMatch[] {
  const matchedSkills: SkillMatch[] = [];
  const matchedNames = new Set<string>(); // Prevent duplicates

  console.log(`[resumeParser] Matching against ${skills.length} skills`);
  console.log(`[resumeParser] Normalized text length: ${normalizedText.length} chars`);
  console.log(`[resumeParser] Text preview (first 1000 chars): ${normalizedText.substring(0, 1000)}`);

  // Log sample skills to verify they're loaded correctly
  console.log(`[resumeParser] Sample skills from database:`);
  skills.slice(0, 15).forEach(s => {
    console.log(`  - "${s.name}" (normalized: "${s.normalizedName}")`);
  });

  for (const skill of skills) {
    if (matchedNames.has(skill.name)) continue; // Skip if already matched

    if (isSkillInText(normalizedText, skill)) {
      const variations = generateSkillVariations(skill.name).join(', ');
      console.log(`[resumeParser] ✓ MATCHED: ${skill.name} (variations: ${variations})`);
      matchedSkills.push(skill);
      matchedNames.add(skill.name);
    }
  }

  console.log(`[resumeParser] Total matches: ${matchedSkills.length}`);

  if (matchedSkills.length === 0) {
    console.log(`[resumeParser] ⚠️ NO MATCHES FOUND - Debugging info:`);
    console.log(`[resumeParser] Let's test specific skills manually:`);

    // Test common skills the user mentioned
    const testSkills = ['HTML', 'CSS', 'JavaScript', 'React', 'MongoDB', 'SQL', 'Node.js', 'Express'];
    testSkills.forEach(testName => {
      const testSkill = skills.find(s => s.name.toLowerCase() === testName.toLowerCase());
      if (testSkill) {
        const variations = generateSkillVariations(testSkill.name);
        console.log(`  Testing "${testSkill.name}":`);
        console.log(`    Variations: ${variations.join(', ')}`);
        const found = variations.some(v => normalizedText.includes(v.toLowerCase()));
        console.log(`    Found in text: ${found}`);
        if (found) {
          console.log(`    ⚠️ SHOULD HAVE MATCHED but didn't - check isSkillInText logic`);
        }
      } else {
        console.log(`  Skill "${testName}" not found in database`);
      }
    });
  }

  return matchedSkills;
}

/**
 * Parse resume and extract skills
 */
export interface ParseResult {
  rawText: string;
  normalizedText: string;
  matchedSkills: SkillMatch[];
  textLength: number;
}

export async function parseResumeFile(
  filePath: string,
  mimeType: string,
  availableSkills: SkillMatch[]
): Promise<ParseResult> {
  // 1. Extract text
  console.log(`[resumeParser] Extracting text from: ${path.basename(filePath)}`);
  const rawText = await extractTextFromResume(filePath, mimeType);

  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Could not extract text from resume');
  }

  // 2. Normalize text
  const normalizedText = normalizeText(rawText);
  console.log(`[resumeParser] Extracted ${rawText.length} chars, normalized to ${normalizedText.length} chars`);

  // 3. Match skills
  const matchedSkills = matchSkillsInText(normalizedText, availableSkills);
  console.log(`[resumeParser] Found ${matchedSkills.length} skill matches out of ${availableSkills.length} skills`);

  return {
    rawText,
    normalizedText,
    matchedSkills,
    textLength: rawText.length,
  };
}

/**
 * High-level function to parse a resume by ID or Record
 * Handles file downloading, parsing, skill extraction, and database updates.
 */
export async function performResumeParsing(resumeIdOrRecord: string | any, userId: string): Promise<any> {
  const ResumeModel = mongoose.model('Resume');
  const SkillModel = mongoose.model('Skill');
  const UserSkillModel = mongoose.model('UserSkill');

  let resume = typeof resumeIdOrRecord === 'string'
    ? await ResumeModel.findById(resumeIdOrRecord)
    : resumeIdOrRecord;

  if (!resume) throw new Error('Resume not found');

  // Update status to processing
  resume.status = 'processing';
  await resume.save();

  let targetPath = '';
  let isTempFile = false;

  try {
    // 1. Get file path
    const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
    const localPathFromFilename = path.join(uploadsDir, resume.filename);

    if (resume.localPath && fs.existsSync(resume.localPath)) {
      targetPath = resume.localPath;
    } else if (fs.existsSync(localPathFromFilename)) {
      targetPath = localPathFromFilename;
    } else if (resume.url && resume.url.startsWith('http')) {
      console.log(`[resumeParser] Downloading remote resume: ${resume.url}`);
      const response = await fetch(resume.url);
      if (!response.ok) throw new Error(`Failed to download resume: ${response.statusText}`);

      const buffer = Buffer.from(await response.arrayBuffer());
      const tempDir = path.join(process.cwd(), 'tmp', 'resume-processing');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const tempFileName = `parse_${userId}_${Date.now()}${path.extname(resume.originalName || '.pdf')}`;
      targetPath = path.join(tempDir, tempFileName);
      fs.writeFileSync(targetPath, buffer);
      isTempFile = true;
    } else {
      throw new Error(`Resume file not found. Filename: ${resume.filename}`);
    }

    // 2. Get skills
    const allSkills = await SkillModel.find({}).select('_id name normalizedName domain').lean();
    if (allSkills.length === 0) throw new Error('No skills found in database');

    const skillsForMatching: SkillMatch[] = allSkills.map((s: any) => ({
      _id: s._id.toString(),
      name: s.name,
      normalizedName: s.normalizedName,
      domain: s.domain
    }));

    // 3. Parse
    const parseResult = await parseResumeFile(targetPath, resume.mimeType, skillsForMatching);

    // 4. Update Resume Record
    resume.status = 'completed';
    resume.parsedAt = new Date();
    resume.extractedData = {
      rawText: parseResult.rawText,
      skills: parseResult.matchedSkills.map(skill => ({
        name: skill.name,
        confidence: 80
      }))
    };
    await resume.save();

    // 5. Cleanup
    if (isTempFile && targetPath && fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }

    return {
      success: true,
      skillsFound: parseResult.matchedSkills.length
    };

  } catch (error: any) {
    console.error('[resumeParser] performResumeParsing failed:', error);
    resume.status = 'failed';
    resume.parseError = error.message;
    await resume.save();

    if (isTempFile && targetPath && fs.existsSync(targetPath)) {
      try { fs.unlinkSync(targetPath); } catch (e) { }
    }

    throw error;
  }
}
