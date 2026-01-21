# ATS-Optimized Resume Generator

## Overview

This resume generator creates PDFs optimized for Applicant Tracking Systems (ATS) with actual data from your content collections.

## Key Features

### ATS Optimization
- **Simple Layout**: Single-column format, clear sections, no complex graphics
- **Standard Fonts**: Professional, readable fonts (Helvetica family)
- **Proper Formatting**: Consistent spacing, section headers, bullet points
- **Keywords**: Industry-standard terminology for ATS parsing
- **No Tables**: Tables can confuse ATS, using formatted lists instead
- **Clean Text**: ASCII-compatible encoding, no special characters

### Data-Driven
- **Content Collections**: Reads actual data from `content/` directories
- **Education**: Imports from content-collections education collection
- **Experience**: Imports from content-collections jobs collection
- **Skills**: Imports from content-collections skills collection
- **Projects**: Hardcoded based on your actual portfolio projects

### Dynamic Content
The resume is generated dynamically from:
1. **Jobs** (`content/jobs/` markdown files)
2. **Education** (`content/education/` markdown files)
3. **Skills** (`content/skills/` markdown files)
4. **Projects** (Your portfolio projects)

## Content Structure

### Required Front Matter (YAML)

All content files must include this front matter:

```yaml
---
jobTitle: Software Engineer
company: Company Name
location: Location
startDate: YYYY-MM-DD
endDate: YYYY-MM-DD (optional, use "Present" for current)
tags:
  - "Skill 1"
  - "Skill 2"
summary: >
  A brief summary of the role
  ---
  
Detailed content here...
```

### Skills Collection Format

```yaml
---
name: Technical Skills
startDate: YYYY-MM-DD
tags:
  - "Category: Skill"
summary: >
  Brief description
  ---
  
Detailed content...
```

## Usage

### Content Files

Create markdown files in the appropriate directories:

1. **Jobs** → `content/jobs/your-job.md`
2. **Education** → `content/education/your-education.md`
3. **Skills** → `content/skills/your-skills.md`

### Automatic Features

The generator automatically:
- Aggregates all skills from education and jobs
- Removes duplicates
- Sorts alphabetically for ATS readability
- Formats dates consistently (YYYY-MM-DD format)
- Includes duration for each role
- Wraps text to fit margins properly
- Creates new pages when needed

## Updating Your Resume

1. Edit or create markdown files in `content/` directories
2. The PDF generator will automatically pick up your changes
3. Download button generates fresh PDF with latest content

## Best Practices for ATS

### DO ✅
- Use standard section headers (EXPERIENCE, EDUCATION, SKILLS, PROJECTS)
- Include job titles, company names, and dates
- Use bullet points for responsibilities
- Add relevant keywords from job postings
- List technical skills in a dedicated section
- Keep formatting consistent
- Use standard date formats
- Include email and phone for contact

### DON'T ❌
- Use tables, columns, or complex layouts
- Use graphics, images, or fancy fonts
- Use non-standard section names
- Include personal information (age, marital status, etc.)
- Use colored backgrounds or excessive formatting
- Use fancy bullet points or symbols
- Include photos (unless specifically required)

## Customization

### Modify the PDF Generator

Edit `src/lib/generate-pdf.ts` to:
- Add custom sections
- Change styling (colors, fonts, spacing)
- Add contact information
- Modify project descriptions
- Adjust layout preferences

### Add More Content

Simply create new markdown files:
```bash
# Add a new job
cat > content/jobs/new-role.md << 'EOF'
---
jobTitle: Your Job Title
company: Company Name
location: Location
startDate: 2024-01-01
endDate: Present
tags:
  - "Skill 1"
  - "Skill 2"
summary: >
  Brief role description
  ---

Your detailed job description...
EOF

# Add a new skill set
cat > content/skills/new-skills.md << 'EOF'
---
name: Skill Category
startDate: 2024-01-01
tags:
  - "Skill 1"
  - "Skill 2"
summary: >
  Brief description
  ---

Detailed skill content...
EOF
```

## Troubleshooting

### Content Not Showing Up

1. Check file YAML front matter is valid
2. Ensure `startDate` and `endDate` are in YYYY-MM-DD format
3. Verify tags array syntax (proper YAML)
4. Rebuild content collections: `pnpm run build`

### PDF Issues

1. Check browser console for errors
2. Ensure content-collections generated successfully
3. Verify all content files have proper YAML front matter

## Technical Details

- **Library**: jspdf
- **Canvas Engine**: html2canvas (for text measurement)
- **Font**: Helvetica (built-in to jsPDF)
- **Page Size**: A4 (210mm x 297mm)
- **Margins**: 20mm
- **Encoding**: ASCII-compatible
- **Download Method**: Blob URL with auto-triggered download
