# Tech Stack

## Context

Global tech stack defaults for Agent OS projects, overridable in project-specific `.agent-os/product/tech-stack.md`.

- **App Framework**: Django (latest stable)
- **Language**: Python 3.11+
- **Primary Database**: PostgreSQL 15+
- **ORM**: Django ORM
- **JavaScript Framework**: React (latest stable)
- **Build Tool**: Default Django + custom React bundling (to be decided per project)
- **Import Strategy**: ES Modules (for frontend)
- **Package Manager**: npm
- **Node Version**: 18+ (LTS)
- **CSS Framework**: TailwindCSS (latest)
- **UI Components**: Custom & open-source from community libraries
- **UI Installation**: Manually integrated as needed
- **Font Provider**: Google Fonts
- **Font Loading**: Hosted via CDN
- **Icons**: Mixed (Lucide, Heroicons, other SVGs)
- **Application Hosting**: To be decided (e.g., Vercel, Render, DigitalOcean)
- **Hosting Region**: Based on performance/testing needs
- **Database Hosting**: To be decided (e.g., Supabase, Railway, ElephantSQL)
- **Database Backups**: Manual/local (automated TBD)
- **Asset Storage**: Local or free tier (e.g., Firebase, Supabase)
- **CDN**: Optional for now
- **Asset Access**: Public or restricted via app logic
- **CI/CD Platform**: GitHub (manual for now, automation planned)
- **CI/CD Trigger**: None currently (manual deployment)
- **Tests**: Not in use currently (will be added later)
- **Production Environment**: main branch (basic)
- **Staging Environment**: optional, created per need
