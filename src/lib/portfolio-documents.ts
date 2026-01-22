/**
 * Portfolio Documents for RAG (Retrieval Augmented Generation)
 *
 * This module converts our structured portfolio data (skills, projects, experience)
 * into searchable text chunks for semantic similarity search.
 */

import { skillCategories } from './skills-data'
import { projects } from './projects-data'
import { experiences } from './experience-data'

export interface PortfolioDocument {
  id: string
  type: 'skill' | 'project' | 'experience'
  title: string
  content: string
  metadata: {
    category?: string
    tags?: string[]
    proficiency?: number
    status?: string
    links?: Record<string, string>
    years?: number
    level?: string
  }
}

/**
 * Convert all portfolio data into searchable documents
 */
export function getPortfolioDocuments(): PortfolioDocument[] {
  const docs: PortfolioDocument[] = []

  // Skills → Documents
  skillCategories.forEach(category => {
    category.skills.forEach(skill => {
      docs.push({
        id: `skill-${skill.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'skill',
        title: skill.name,
        content: `${skill.name}: ${category.description}. Level: ${skill.level}. ${skill.years} years of experience. Proficiency: ${skill.proficiency}%. ${skill.projects ? `Projects using ${skill.name}: ${skill.projects.join(', ')}.` : ''} ${skill.certifications ? `Certifications: ${skill.certifications.join(', ')}.` : ''} ${skill.lastUsed ? `Last used: ${skill.lastUsed}.` : ''} Category: ${category.name}.`,
        metadata: {
          category: category.name,
          tags: skill.projects || [],
          proficiency: skill.proficiency,
          years: skill.years,
          level: skill.level,
        }
      })
    })
  })

  // Projects → Documents
  projects.forEach(project => {
    const techAll = [
      ...(project.techStack?.frontend || []),
      ...(project.techStack?.backend || []),
      ...(project.techStack?.ai || []),
      ...(project.techStack?.tools || []),
    ]

    docs.push({
      id: `project-${project.id}`,
      type: 'project',
      title: project.title,
      content: `${project.title}: ${project.longDescription || project.description}. Category: ${project.category}. Tech stack: ${techAll.join(', ')}. ${project.learnings ? `Key learnings: ${project.learnings.join('. ')}.` : ''} ${project.technicalHighlights ? `Technical highlights: ${project.technicalHighlights.join('. ')}.` : ''} Status: ${project.status}. Tags: ${project.tags.join(', ')}.`,
      metadata: {
        category: project.category,
        tags: [...project.tags, ...techAll],
        status: project.status,
        links: {
          demo: project.demo || project.link || '',
          github: project.github || '',
          docs: project.docs || '',
        }
      }
    })
  })

  // Experience → Documents
  experiences.forEach(exp => {
    const techAll = [
      ...(exp.techStack?.frontend || []),
      ...(exp.techStack?.backend || []),
      ...(exp.techStack?.cloud || []),
      ...(exp.techStack?.ai || []),
      ...(exp.techStack?.tools || []),
    ]

    docs.push({
      id: `experience-${exp.id}`,
      type: 'experience',
      title: `${exp.title} at ${exp.company}`,
      content: `${exp.title} at ${exp.company} (${exp.location}). Duration: ${exp.duration} (${exp.startDate} to ${exp.endDate || 'present'}). ${exp.description}. Responsibilities: ${exp.responsibilities.join('. ')}. Achievements: ${exp.achievements.join('. ')}. Tech stack: ${techAll.join(', ')}. ${exp.highlights ? `Highlights: ${exp.highlights.join('. ')}.` : ''}`,
      metadata: {
        category: exp.category,
        tags: [...exp.skills, ...techAll],
      }
    })
  })

  return docs
}

/**
 * Get documents by type
 */
export function getDocumentsByType(type: 'skill' | 'project' | 'experience'): PortfolioDocument[] {
  return getPortfolioDocuments().filter(doc => doc.type === type)
}

/**
 * Get document by ID
 */
export function getDocumentById(id: string): PortfolioDocument | undefined {
  return getPortfolioDocuments().find(doc => doc.id === id)
}
