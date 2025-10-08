# Brand Training Quality Rubric

## Purpose
Objective framework for evaluating brand training output quality. Use this during user calls to assess whether brand training is working.

---

## Scoring System

### Overall On-Brand Score (1-10)

Use this during calls when asking: **"On a scale of 1-10, how on-brand does this feel?"**

| Score | Meaning | User Reaction | Business Impact |
|-------|---------|---------------|-----------------|
| **9-10** | 🎯 **Exceptional** - Indistinguishable from human-created brand content | "Wow, that's spot-on!" / Immediately downloads | Will pay and invite team |
| **7-8** | ✅ **Strong** - Clearly on-brand with minor tweaks needed | "That's pretty good" / Would use with light editing | Will pay if consistent |
| **5-6** | ⚠️ **Acceptable** - Recognizably the brand but noticeably off | "It's close but..." / Hesitant to use | Might pay, needs work |
| **3-4** | ❌ **Weak** - Some brand elements present but mostly generic | "Not quite right" / Wouldn't use | Won't pay yet |
| **1-2** | 🚫 **Failure** - No brand resemblance, generic AI output | "This isn't my brand" / Disappointed | Churn risk |

---

## Component Breakdown

Break down the overall score into specific dimensions for diagnosis.

### 1. Color Accuracy (1-10)

**What to evaluate:**
- Primary brand colors present and accurate
- Secondary/accent colors match
- Color palette proportions feel right
- No unexpected or off-brand colors

| Score | Description | Example |
|-------|-------------|---------|
| 10 | Perfect color match, exact hex values | Brand colors #FF5733 and #3498DB are exactly right |
| 8 | Colors very close, slight shade variation | Brand blue is slightly lighter but still recognizable |
| 6 | Colors in the ballpark but noticeably off | Blue is there but looks more navy than sky blue |
| 4 | Some brand colors present, others wrong | Got primary color right but secondary is way off |
| 2 | Colors completely wrong or generic | Totally different palette, no brand colors visible |

**Red flags:**
- User says: "The colors are off"
- Side-by-side comparison shows clear mismatch
- Brand colors weren't uploaded correctly

**Fix:**
- Check color input (did they provide accurate hex codes?)
- Verify LoRA training included color conditioning
- May need to emphasize colors in prompt

---

### 2. Style Match (1-10)

**What to evaluate:**
- Illustration technique (flat, 3D, line art, gradient, etc.)
- Level of abstraction (realistic vs stylized)
- Shape language (geometric, organic, mixed)
- Texture and detail level

| Score | Description | Example |
|-------|-------------|---------|
| 10 | Style is indistinguishable from brand examples | "I genuinely can't tell this wasn't made by our designer" |
| 8 | Style strongly resembles brand, minor differences | "Feels like our brand, maybe slightly more rounded" |
| 6 | Style somewhat similar but missing key elements | "It's flat design but ours has more texture" |
| 4 | Generic style that doesn't match brand | "This looks like generic AI, not our style" |
| 2 | Completely wrong style | "Our brand is minimalist line art, this is 3D rendered" |

**Red flags:**
- User says: "The style doesn't feel like us"
- Training images were inconsistent styles
- LoRA didn't capture distinctive style elements

**Fix:**
- Review training images for consistency
- May need more training images (closer to 30)
- Might need longer training time or better hyperparameters

---

### 3. Composition & Layout (1-10)

**What to evaluate:**
- Subject placement (centered, rule of thirds, etc.)
- Background vs foreground balance
- Negative space usage
- Visual hierarchy

| Score | Description | Example |
|-------|-------------|---------|
| 10 | Composition matches brand conventions exactly | "We always center subjects, and it did that perfectly" |
| 8 | Composition feels on-brand with minor differences | "Usually we have more breathing room but this works" |
| 6 | Acceptable composition but doesn't feel branded | "It's fine but doesn't have our signature layout" |
| 4 | Composition feels generic or off | "Too cluttered - we're minimalist" |
| 2 | Composition actively contradicts brand style | "We never center subjects, always use asymmetry" |

**Red flags:**
- User says: "The layout is wrong"
- Composition doesn't match training examples
- Might be prompt issue vs training issue

**Fix:**
- Include composition keywords in prompt
- Check if training images had consistent composition
- May need to guide users on prompt engineering

---

### 4. Brand Elements & Motifs (1-10)

**What to evaluate:**
- Recurring visual elements (shapes, patterns, icons)
- Character style consistency (if applicable)
- Signature details (shadows, outlines, highlights)
- Brand-specific quirks

| Score | Description | Example |
|-------|-------------|---------|
| 10 | All signature brand elements present | "It has our rounded corners and subtle gradients - perfect" |
| 8 | Most key elements present, minor details missing | "Has our character style but missing our signature shadow" |
| 6 | Some elements present but inconsistent | "Sometimes has our style, sometimes generic" |
| 4 | Few or no distinctive brand elements | "Could be anyone's illustration, no unique details" |
| 2 | Completely generic, no brand markers | "This is just stock AI art" |

**Red flags:**
- User says: "It's missing the thing that makes it ours"
- Can't identify any unique brand markers
- LoRA didn't learn distinctive elements

**Fix:**
- Training images need more consistency in key elements
- May need to emphasize elements in prompt
- Might need stronger LoRA training weight

---

### 5. Production Readiness (1-10)

**What to evaluate:**
- Technical quality (resolution, clarity)
- Edge cases handled well (text, faces, complex objects)
- Consistency across multiple generations
- Requires editing or ready to publish

| Score | Description | User Behavior |
|-------|-------------|---------------|
| 10 | Perfect, publish immediately | Downloads and uses without edits |
| 8 | Minor cleanup needed (crop, color adjust) | Downloads with plan to lightly edit |
| 6 | Needs moderate editing in Figma/Illustrator | "I'd need to clean this up first" |
| 4 | Major edits required | "Easier to start from scratch" |
| 2 | Unusable, fundamental issues | Doesn't download, tries again |

**Red flags:**
- User says: "I'd need to heavily edit this"
- Artifacts, distortions, or quality issues
- Inconsistent quality across generations

**Fix:**
- May be prompt issue (too complex, conflicting keywords)
- Could be model limitation (Imagen 3 vs SDXL differences)
- Might need better training data quality

---

## Diagnostic Matrix

Use this to quickly diagnose issues during calls.

| User Says... | Likely Issue | Quick Test | Fix |
|--------------|--------------|------------|-----|
| "Colors are off" | Color accuracy | Compare hex codes side-by-side | Re-check color inputs, retrain with emphasis on colors |
| "Doesn't feel like my style" | Style match | Show training images vs output | Need more consistent training data |
| "It's too generic" | Brand elements missing | Ask what makes their brand unique | LoRA not strong enough, increase training weight |
| "Sometimes good, sometimes bad" | Consistency | Generate 5 more in a row | Prompt engineering needed, or LoRA instability |
| "Not good enough to use" | Production readiness | Ask what specific changes needed | May need model upgrade or post-processing |
| "Preset styles are better" | Training failed | Compare preset vs brand output | Critical failure - investigate training logs |

---

## Comparative Assessment

### Side-by-Side Test

During calls, always do this test:

1. Ask user to show their **favorite** existing brand illustration
2. Generate similar prompt with MediaForge
3. Put them **side-by-side** on screen
4. Ask: **"What's the same? What's different?"**

**Scoring criteria:**

| Similarity Level | Score | User Reaction | Action |
|------------------|-------|---------------|--------|
| **Nearly Identical** | 9-10 | "Wow, I honestly can't tell the difference" | Success! Document what worked |
| **Clearly Similar** | 7-8 | "Definitely the same family, minor differences" | Good enough - note differences for iteration |
| **Somewhat Similar** | 5-6 | "I can see the connection but it's noticeably different" | Needs work - prioritize fixing gaps |
| **Vaguely Similar** | 3-4 | "There are hints of our style but mostly different" | Major issues - debug training |
| **Not Similar** | 1-2 | "These don't look related at all" | Training failed - investigate immediately |

---

## Consistency Test

### Multi-Generation Consistency

After first generation, have user generate **5 more** with different prompts.

**Track scores for each:**

| Generation | Prompt | Score (1-10) | Notes |
|------------|--------|--------------|-------|
| 1 | "Team collaboration" | 8 | Good colors, style slightly off |
| 2 | "Data analytics" | 7 | Colors perfect, composition generic |
| 3 | "Customer success" | 9 | Best one yet! |
| 4 | "Product launch" | 6 | Colors shifted, style inconsistent |
| 5 | "Remote work" | 8 | Back to good |

**Average score:** _____ / 10

**Consistency assessment:**

| Average Score | Variance | Assessment | Business Impact |
|---------------|----------|------------|-----------------|
| **8-10** | Low (<2 points) | Excellent - production ready | User will pay and use heavily |
| **7-8** | Low (<2 points) | Good - reliable with minor tweaks | User will pay if consistent |
| **6-8** | High (3+ points) | Inconsistent - reliability issue | User hesitant due to unpredictability |
| **<6** | Any | Poor - not ready for production | User won't pay yet |

**Red flags:**
- Scores vary by 3+ points → Consistency problem
- Later generations worse than first → Prompt drift or randomness
- User stops generating → Frustrated with quality

---

## User Segment Patterns

Different user types have different quality bars.

### Segment 1: Strong Brand Identity (Stripe, Linear, Notion-level)

**Characteristics:**
- 50+ existing branded illustrations
- Detailed style guide
- Professional designer/agency created brand

**Quality bar:** 8-10 required
- They know exactly what their brand looks like
- Will notice small deviations
- High standards for production use

**Success criteria:**
- Color accuracy: 9+
- Style match: 8+
- Would use without edits

---

### Segment 2: Developing Brand (Most SaaS startups)

**Characteristics:**
- 10-20 existing illustrations
- Some brand guidelines
- Mix of designer work and DIY

**Quality bar:** 6-8 acceptable
- Still figuring out their brand
- More forgiving of variations
- Happy to iterate

**Success criteria:**
- Color accuracy: 7+
- Style match: 6+
- Would use with light edits

---

### Segment 3: Minimal Brand (Early stage)

**Characteristics:**
- <10 existing illustrations
- Logo + colors only
- No style guide

**Quality bar:** 5-7 acceptable
- Don't have established style yet
- Open to suggestions
- Might use presets instead

**Success criteria:**
- Preset styles might be better fit
- Brand training may be premature
- Educate on building brand first

---

## Go/No-Go Thresholds

After 10 user sessions, calculate these metrics:

### Brand Training Success Rate

**Formula:** (Users scoring 7+ on average) / (Total users) × 100

| Success Rate | Assessment | Action |
|--------------|------------|--------|
| **70-100%** | ✅ Ship it! | Brand training works, launch payments |
| **50-69%** | ⚠️ Needs work | Fix common issues, test 5 more users |
| **<50%** | 🚫 Not ready | Major rework needed, don't launch payments |

---

### Quality Consistency

**Formula:** Average score variance across all users' 5-generation tests

| Avg Variance | Assessment | Action |
|--------------|------------|--------|
| **<2 points** | ✅ Consistent | Reliable enough for production |
| **2-3 points** | ⚠️ Variable | Prompt engineering education needed |
| **>3 points** | 🚫 Unreliable | LoRA training instability, fix before launch |

---

### Willingness to Pay

**Correlation with quality scores:**

| Avg Quality Score | % Who Would Pay $29/mo | Business Viability |
|-------------------|------------------------|-------------------|
| **8-10** | 80-100% | Strong PMF, launch now |
| **7-8** | 50-80% | Moderate PMF, iterate |
| **6-7** | 20-50% | Weak PMF, major work needed |
| **<6** | <20% | No PMF, pivot or fix |

---

## Red Flag Scenarios

**Immediate escalation required if:**

### 🚨 Critical Failures (Stop onboarding, fix immediately)

1. **"Preset styles are better than my trained brand"**
   - Training is making things worse
   - Core feature broken
   - Action: Debug LoRA training pipeline

2. **"This doesn't look like my brand at all"** (3+ users)
   - Training not capturing style
   - Wrong architecture or hyperparameters
   - Action: Review training methodology

3. **"It's so inconsistent I can't rely on it"** (5+ users)
   - Production readiness failure
   - Won't pay for unreliable tool
   - Action: Fix consistency issues before more users

### ⚠️ Major Issues (Fix before next 5 users)

1. **Average on-brand score <6 across first 5 users**
   - Quality bar not met
   - Action: Improve training or reset expectations

2. **<50% would pay $29/mo after seeing brand results**
   - Pricing/value mismatch
   - Action: Improve quality or adjust pricing

3. **Users prefer presets over brand training**
   - Core differentiator not valuable
   - Action: Understand why, fix or pivot

---

## Success Patterns

**Launch-ready signals:**

### ✅ Strong Product-Market Fit

1. **Average on-brand score 7.5+ across 10 users**
   - Consistently hitting quality bar
   - Production-ready

2. **70%+ would pay $29/mo immediately**
   - Clear value proposition
   - Price point validated

3. **Users generate 20+ images in first session**
   - High engagement
   - Forming habit

4. **Users invite teammates unprompted**
   - Viral coefficient
   - Word-of-mouth validation

5. **Users show you where they published MediaForge output**
   - Real production use
   - Not just testing

---

## Documentation Template (During Calls)

**Quick scorecard to fill out during each call:**

```
User: [Name] | Company: [Name] | Date: [Date]

Brand Maturity: Strong / Developing / Minimal

FIRST GENERATION SCORES:
[ ] Color Accuracy: __ /10
[ ] Style Match: __ /10
[ ] Composition: __ /10
[ ] Brand Elements: __ /10
[ ] Production Ready: __ /10
→ Overall: __ /10

CONSISTENCY (5 generations):
Gen 1: __ /10
Gen 2: __ /10
Gen 3: __ /10
Gen 4: __ /10
Gen 5: __ /10
→ Average: __ /10
→ Variance: __ points

BUSINESS VALIDATION:
Would pay $29/mo: Yes / Maybe / No
Reason: _________________________________

DIRECT QUOTE:
"_________________________________________________"

ACTION ITEMS:
[ ] _________________________________
[ ] _________________________________
```

---

## After 10 Users - Final Assessment

**Calculate these metrics:**

1. **Average on-brand score:** _____ / 10
2. **Consistency variance:** _____ points
3. **% who would pay $29/mo:** _____%
4. **% who scored 7+ on average:** _____%

**Go/No-Go Decision:**

- [ ] ✅ **SHIP IT** - 70%+ success rate, 70%+ would pay, avg score 7.5+
- [ ] ⚠️ **ITERATE** - 50-70% success rate, identify and fix top 3 issues
- [ ] 🚫 **MAJOR REWORK** - <50% success rate, core feature needs redesign

**Top 3 Most Common Issues:**
1. _________________________________
2. _________________________________
3. _________________________________

**Most Requested Features:**
1. _________________________________
2. _________________________________
3. _________________________________

**Verdict:**
> _________________________________________________________________
> _________________________________________________________________

---

*Last updated: 2025-10-07*
