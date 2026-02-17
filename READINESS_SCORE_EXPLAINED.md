# 📊 How Your Readiness Score is Calculated

## Overview
Your **Readiness Score** measures how prepared you are for a specific role based on your skills compared to industry benchmarks. It's a data-driven assessment that helps you understand exactly where you stand and what you need to improve.

---

## 🎯 The Complete Calculation Process

### Step 1: Data Collection

The system gathers two key pieces of information:

1. **Role Benchmarks** - What skills the role requires
   - Each skill has a **required level** (beginner, intermediate, advanced, expert)
   - Each skill has a **weight** (1-10) indicating importance
   - Each skill is marked as **required** or **optional**

2. **Your Skills** - What you currently have
   - Your claimed skill level
   - How you added it (resume, self-reported, or validated by mentor)
   - Validation status (pending, validated, rejected)

---

## 🧮 The Scoring Formula

### 1️⃣ Skill Level Points (0-1 Scale)

Each skill level has a base point value:

```
none         → 0.00 points (0%)
beginner     → 0.25 points (25%)
intermediate → 0.50 points (50%)
advanced     → 0.75 points (75%)
expert       → 1.00 points (100%)
```

**Example**: If you have "JavaScript" at **intermediate** level, you start with **0.50 points**.

---

### 2️⃣ Validation Multiplier (Credibility Factor)

Your skills are worth more when they're verified:

```
✅ Validated (mentor-confirmed)  → 1.0x multiplier (100% credit)
👤 Self-reported                 → 0.8x multiplier (80% credit)
📄 Resume-extracted              → 0.7x multiplier (70% credit)
```

**Why?** This encourages you to get your skills validated by mentors for maximum credibility.

**Example**: 
- Intermediate JavaScript (0.50) that's **self-reported** → 0.50 × 0.8 = **0.40 raw score**
- Same skill but **validated by mentor** → 0.50 × 1.0 = **0.50 raw score**

---

### 3️⃣ Weight Application (Importance Factor)

Each skill benchmark has a weight (1-100) that reflects its importance for the role.

```
Weighted Score = Raw Score × Benchmark Weight
```

**Example**: 
If JavaScript has a weight of **25** (very important):
- Raw score: 0.40 (intermediate, self-reported)
- Weighted score: 0.40 × 25 = **10 points out of 25 possible**

---

### 4️⃣ Aggregation Across All Skills

The system processes **every skill** in the role's benchmark:

```
Total Score = Sum of all weighted scores
Max Possible Score = Sum of all weights (typically 100)
```

**Example Breakdown**:

| Skill | Required Level | Weight | Your Level | Validation | Raw Score | Weighted Score | Max Possible |
|-------|----------------|--------|------------|------------|-----------|----------------|--------------|
| JavaScript | Advanced | 25 | Intermediate | Self | 0.40 | 10.0 | 25 |
| React | Intermediate | 20 | Advanced | Validated | 0.75 | 15.0 | 20 |
| Git | Beginner | 15 | Beginner | Validated | 0.25 | 3.75 | 15 |
| CSS | Intermediate | 15 | None | - | 0.00 | 0.0 | 15 |
| Testing | Beginner | 10 | None | - | 0.00 | 0.0 | 10 |
| **TOTAL** | | **85** | | | | **28.75** | **85** |

---

### 5️⃣ Final Percentage Calculation

```
Readiness Percentage = (Total Score / Max Possible Score) × 100
```

**From the example above**:
```
Readiness = (28.75 / 85) × 100 = 33.8%
```

This is your **overall readiness score** for the role.

---

## 🚨 Required vs Optional Skills

### Required Skills
- **MUST HAVE** for the role
- If you're missing ANY required skill or have it at "none" level, you'll be flagged
- The system tracks: `requiredSkillsMet / requiredSkillsTotal`
- Flag: `hasAllRequired = true/false`

### Optional Skills
- **NICE TO HAVE** but not mandatory
- They contribute to your score but won't block you
- Help you stand out from other candidates

**Example**:
```
Required Skills: 5 total
- JavaScript (Advanced) ✅ You have it
- React (Intermediate) ✅ You have it  
- Git (Beginner) ✅ You have it
- CSS (Intermediate) ❌ Missing
- Testing (Beginner) ❌ Missing

Result: 3/5 required skills met → hasAllRequired = false
```

---

## 📈 How to Improve Your Score

### Strategy 1: Fill Skill Gaps
**Impact**: Highest
- Add missing skills, especially **required** ones
- Even adding at "beginner" level is better than nothing

### Strategy 2: Level Up Existing Skills
**Impact**: Medium-High
- Move from beginner → intermediate (+0.25 points)
- Move from intermediate → advanced (+0.25 points)
- Focus on high-weight skills first

### Strategy 3: Get Skills Validated
**Impact**: Medium
- Self-reported (0.8x) → Validated (1.0x) = **+25% boost**
- Resume-extracted (0.7x) → Validated (1.0x) = **+43% boost**
- Request mentor validation through the platform

### Strategy 4: Prioritize High-Weight Skills
**Impact**: Strategic
- A skill with weight 25 has 2.5x more impact than weight 10
- Check your skill breakdown to see which skills matter most

---

## 🎯 Skill Gap Analysis

The system automatically identifies your **skill gaps** and prioritizes them:

### Priority Calculation
```
Priority = Importance Bonus + (Levels Needed × 10) + Weight

Where:
- Importance Bonus = 100 (if required) or 0 (if optional)
- Levels Needed = How many levels you need to improve
- Weight = The skill's importance weight
```

**Example**:
```
Skill: CSS (Required, Weight: 15)
Current: None (0)
Required: Intermediate (2)
Levels Needed: 2

Priority = 100 + (2 × 10) + 15 = 135 (HIGH PRIORITY)
```

Gaps are sorted by priority, so you always know what to work on first.

---

## 📊 Real Calculation Example

Let's walk through a complete example for a **Frontend Developer** role:

### Role Benchmarks
```
1. JavaScript - Advanced, Weight: 25, Required
2. React - Intermediate, Weight: 20, Required
3. CSS - Intermediate, Weight: 15, Required
4. Git - Beginner, Weight: 15, Required
5. TypeScript - Intermediate, Weight: 10, Optional
6. Testing - Beginner, Weight: 10, Optional
7. Webpack - Beginner, Weight: 5, Optional

Total Weight: 100
```

### Your Skills
```
1. JavaScript - Intermediate, Self-reported
2. React - Advanced, Validated by mentor
3. Git - Beginner, Validated by mentor
4. HTML - Expert, Self-reported (not in benchmark, ignored)
```

### Calculation

| Skill | Weight | Your Level | Level Points | Validation | Multiplier | Raw Score | Weighted Score |
|-------|--------|------------|--------------|------------|------------|-----------|----------------|
| JavaScript | 25 | Intermediate | 0.50 | Self | 0.8 | 0.40 | **10.0** |
| React | 20 | Advanced | 0.75 | Validated | 1.0 | 0.75 | **15.0** |
| CSS | 15 | None | 0.00 | - | 0.0 | 0.00 | **0.0** |
| Git | 15 | Beginner | 0.25 | Validated | 1.0 | 0.25 | **3.75** |
| TypeScript | 10 | None | 0.00 | - | 0.0 | 0.00 | **0.0** |
| Testing | 10 | None | 0.00 | - | 0.0 | 0.00 | **0.0** |
| Webpack | 5 | None | 0.00 | - | 0.0 | 0.00 | **0.0** |

**Results**:
```
Total Score: 28.75
Max Possible: 100
Readiness: 28.75 / 100 = 28.8%

Required Skills: 4 total
Required Skills Met: 2 (JavaScript, React, Git - but JS is only intermediate, not advanced)
Has All Required: false (missing CSS, JS not at required level)

Skills Matched: 3
Skills Missing: 4
```

### Your Skill Gaps (Prioritized)
```
1. CSS - Priority 135 (Required, 2 levels needed, weight 15)
2. JavaScript - Priority 125 (Required, 1 level needed, weight 25)
3. TypeScript - Priority 20 (Optional, 2 levels needed, weight 10)
4. Testing - Priority 11 (Optional, 1 level needed, weight 10)
5. Webpack - Priority 6 (Optional, 1 level needed, weight 5)
```

---

## 🔄 When is Readiness Recalculated?

Your score is automatically recalculated when:

1. ✅ **You add a new skill**
2. ✅ **You update a skill level**
3. ✅ **A mentor validates your skill**
4. ✅ **You change your target role**
5. ✅ **You manually request recalculation**

Each calculation creates a **snapshot** so you can track your progress over time.

---

## 📸 Readiness Snapshots

Every calculation is saved as a snapshot with:
- Timestamp
- Total score and percentage
- Complete skill breakdown
- Trigger (what caused the recalculation)
- Gap analysis

You can view your **history** to see how you've improved over time!

---

## 💡 Pro Tips

### 1. Focus on Required Skills First
Missing required skills has the biggest negative impact. Get them to at least the minimum level.

### 2. Get Validation Early
A validated intermediate skill is worth more than an unvalidated advanced skill:
- Intermediate + Validated: 0.50 × 1.0 = 0.50
- Advanced + Self: 0.75 × 0.8 = 0.60 (only 20% better)

### 3. Target High-Weight Skills
Improving a weight-25 skill by one level gives you 6.25 points.
Improving a weight-5 skill by one level gives you 1.25 points.

### 4. Use the Roadmap
The platform generates a personalized roadmap based on your gaps. Follow it!

### 5. Track Your Progress
Check your snapshot history regularly to see your improvement trajectory.

---

## 🎓 Understanding Your Dashboard

### Readiness Percentage
- **0-30%**: Just starting - focus on fundamentals
- **30-50%**: Building foundation - keep learning
- **50-70%**: Getting there - refine and validate
- **70-85%**: Strong candidate - polish weak areas
- **85-100%**: Excellent - ready to apply!

### Required Skills Badge
- ✅ Green: All required skills met
- ❌ Red: Missing required skills (blocks readiness)

### Skill Breakdown
- Each skill shows your level vs required
- Color-coded: Green (met), Yellow (partial), Red (missing)
- Validation status clearly indicated

---

## 🔍 Technical Details

### Pure Calculation
The calculation is a **pure function** - same inputs always produce same outputs. No randomness, no external factors.

### Performance
- Calculation happens in milliseconds
- Results are cached
- No impact on platform performance

### Accuracy
- Based on industry-standard skill levels
- Weights determined by role requirements
- Validation multipliers encourage quality over quantity

---

## ❓ FAQ

**Q: Why is my score lower than expected?**
A: Check if your skills are validated. Self-reported skills only count for 80%, resume skills for 70%.

**Q: Can I improve my score without learning new skills?**
A: Yes! Get your existing skills validated by mentors for an instant boost.

**Q: What if I have skills not in the benchmark?**
A: They don't count toward this role's readiness, but they're still valuable for your profile.

**Q: How often should I recalculate?**
A: It happens automatically when you make changes. Manual recalculation is rarely needed.

**Q: Can I see my score history?**
A: Yes! Check the "Progress" or "History" section to see all your snapshots.

---

## 🎯 Summary

Your readiness score is calculated using:

1. **Skill Level Points** (0-1 scale based on your proficiency)
2. **Validation Multiplier** (0.7-1.0 based on verification)
3. **Benchmark Weights** (importance of each skill)
4. **Aggregation** (sum across all skills)
5. **Percentage** (your score / max possible × 100)

**Formula**:
```
For each skill:
  Raw Score = Level Points × Validation Multiplier
  Weighted Score = Raw Score × Benchmark Weight

Total Score = Sum of all Weighted Scores
Readiness % = (Total Score / Max Possible Score) × 100
```

Focus on **required skills**, get **validation**, and prioritize **high-weight** skills for maximum impact!

---

**Need help improving your score?** Check your personalized roadmap or request mentor guidance! 🚀
