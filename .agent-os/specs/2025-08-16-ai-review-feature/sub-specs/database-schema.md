# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-16-ai-review-feature/spec.md

## Changes

- New tables for AI review results and progress tracking
- Modifications to existing models to support AI review features
- Indexes for efficient querying of AI review data

## Specifications

```sql
-- AI Review Result table
CREATE TABLE ai_review_ai_review_result (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    overall_score DECIMAL(5,2),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES problems_submission(id) ON DELETE CASCADE
);

-- Progress Tracking table
CREATE TABLE ai_review_progress_snapshot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    snapshot_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_submissions INTEGER NOT NULL,
    accepted_submissions INTEGER NOT NULL,
    accuracy_rate DECIMAL(5,2) NOT NULL,
    category_breakdown TEXT, -- JSON field for category-wise stats
    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_ai_review_submission ON ai_review_ai_review_result(submission_id);
CREATE INDEX idx_progress_user_date ON ai_review_progress_snapshot(user_id, snapshot_date);
```

## Rationale

- The AI Review Result table stores the analysis results for each code submission
- The Progress Snapshot table tracks user progress over time for comprehensive analysis
- Foreign key constraints ensure data integrity
- Indexes improve query performance for common access patterns
- JSON field for category breakdown allows flexible storage of detailed statistics