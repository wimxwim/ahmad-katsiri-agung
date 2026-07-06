# Batch Skill Curation Guide

## Overview
This guide provides **step-by-step instructions** for curating, comparing, and adding skills in batch. Use this when:
- You need to **identify missing skills** in a local directory.
- You want to **generate a ready-to-use list** for copy-paste or automated download.
- You need **prioritized recommendations** based on project context.


## Step 1: Scan Local Skills
Use `search_files` to list all skills in the user’s directory:

```bash
search_files(path="~/GERAKAN_PEMUDA_BERDAYA/skills", pattern="*", target="files")
```

**Extract skill names** from the results (ignore subdirectories, scripts, or support files).

Example output:
```json
{
  "files": [
    "/home/ngome/GERAKAN_PEMUDA_BERDAYA/skills/ab-testing/SKILL.md",
    "/home/ngome/GERAKAN_PEMUDA_BERDAYA/skills/analytics/SKILL.md"
  ]
}
```

**Process the output** to extract skill names:
```python
import re
skill_names = [re.search(r'skills/([^/]+)/SKILL.md', f).group(1) for f in files]
```


## Step 2: Compare Against Best-in-Class Skills
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


## Step 3: Identify Missing Skills
Compare the local list with the best-in-class list and **extract missing skills**.

Example Python snippet:
```python
best_in_class = ["ab-test-setup", "analytics-tracking", "brand-guidelines"]
local_skills = ["ab-testing", "analytics"]
missing_skills = [skill for skill in best_in_class if skill not in local_skills]
```


## Step 4: Provide Prioritized Recommendations
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


## Step 5: Format for Copy-Paste or Download
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