---
name: skill-library-curator
title: Skill Library Curator
description: |
  Use when the user wants to **curate, compare, or expand their Hermes skill library** — especially when they need to:
  - Scan their local skills directory and compare it against the latest best-in-class skills.
  - Identify missing skills and generate a ready-to-use list for batch addition.
  - Get prioritized recommendations based on project context (e.g., marketing, engineering, security).
  - Format skills for copy-paste or automated download.

  Triggers:
  - "What skills am I missing?"
  - "Compare my skills with the latest list."
  - "Give me a list of the best skills I don’t have."
  - "How do I add 50+ skills at once?"
  - "Recommend skills for [project context]."
  - "Format this list for copy-paste."
  - "What are the top 20 skills for [domain]?"

  Do NOT use for:
  - One-off skill creation (use `skill-creator`).
  - Debugging individual skills (use `skill-improver`).
  - Manual skill editing (use `patch` or `write_file`).
---

# Skill Library Curator

## How to Use This Skill
1. **Scan the user’s local skills directory** using `search_files` to get the current list.
2. **Compare against the latest best-in-class skills** (provided by Hermes or a curated list).
3. **Identify missing skills** and generate a ready-to-use list for batch addition.
4. **Provide prioritized recommendations** based on project context (e.g., `GERAKAN_PEMUDA_BERDAYA`).
5. **Format the output** for copy-paste or automated download.


## Step-by-Step Workflow

### 1. Scan Local Skills
Use `search_files` to list all skills in the user’s `~/.hermes/skills` or project-specific skills directory:

```bash
search_files(path="~/GERAKAN_PEMUDA_BERDAYA/skills", pattern="*", target="files")
```

Extract the **skill names** from the results (ignore subdirectories, scripts, or support files).


### 2. Compare Against Best-in-Class Skills
Use the latest **Hermes skill list** (via `skills_list`) or a **curated list** (e.g., the 130+ skills provided in this session).

Example curated list (marketing & growth):
```bash
ab-test-setup
analytics-tracking
brand-guidelines
churn-prevention
content-humanizer
customer-success-manager
email-sequence
landing-page-generator
onboarding-cro
page-cro
referral-program
schema-markup
signup-flow-cro
social-media-analyzer
```


### 3. Identify Missing Skills
Compare the local list with the best-in-class list and **extract skills that are missing**.

Example output:
```bash
# Missing Skills: Marketing & Growth
ab-test-setup
analytics-tracking
brand-guidelines
```


### 4. Provide Prioritized Recommendations
Ask the user for **project context** (e.g., `GERAKAN_PEMUDA_BERDAYA`) and provide a **prioritized list** of 10-20 skills.

Example:
```bash
# Top 20 Skills for GERAKAN_PEMUDA_BERDAYA (Marketing & Community Focus)
ab-test-setup
analytics-tracking
brand-guidelines
churn-prevention
content-humanizer
customer-success-manager
email-sequence
landing-page-generator
onboarding-cro
page-cro
referral-program
schema-markup
signup-flow-cro
social-media-analyzer
ux-researcher-designer
```


### 5. Format for Copy-Paste or Download
Provide the list in a **ready-to-use format** for:
- Manual copy-paste into a file.
- Automated download via `hermes skill fetch`.

Example:
```bash
# Ready for copy-paste:
mkdir -p ~/GERAKAN_PEMUDA_BERDAYA/skills/marketing-growth
cd ~/GERAKAN_PEMUDA_BERDAYA/skills/marketing-growth
for skill in ab-test-setup analytics-tracking brand-guidelines; do
  hermes skill fetch $skill
  touch $skill/SKILL.md
  echo "Fetched $skill" >> progress.log
done
```


## Pitfalls
- **Avoid tumpang tindih**: Pastikan skills yang direkomendasikan belum ada di direktori lokal.
- **Prioritaskan konteks**: Selalu tanyakan **proyek atau domain** pengguna sebelum memberikan rekomendasi.
- **Format yang jelas**: Gunakan **kategori** dan **komentar** untuk memudahkan copy-paste.
- **Jangan rekomendasikan skills yang sudah ada**: Selalu bandingkan dengan daftar lokal terlebih dahulu.


## Support Files
- [Batch Skill Curation Guide](references/batch-skill-curation.md): Langkah-langkah detail untuk memindai, membandingkan, dan menambahkan skills secara batch.
- [Prioritization Framework](references/prioritization-framework.md): Cara memberikan rekomendasi prioritas berdasarkan konteks proyek.