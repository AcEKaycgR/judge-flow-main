# Spec Requirements Document

> Spec: Create Problem and TestCase Models
> Created: 2025-08-15
> Status: Planning

## Overview

This spec details the foundational database changes required for the problem-solving feature. It involves creating a new `TestCase` model to properly store multiple test cases for each problem and refining the existing `Problem` model. This is a prerequisite for implementing the problem submission and judging logic.

## User Stories

### Create Robust Problems

*   **As a** problem setter (admin),
*   **I want to** associate a single problem with multiple, distinct test cases,
*   **so that** I can create a comprehensive test suite for judging user solutions.

### Differentiate Test Cases

*   **As a** problem setter (admin),
*   **I want to** mark some test cases as "shown" and others as "hidden",
*   **so that** I can provide users with examples while judging their code against a more thorough private test set.

## Spec Scope

1.  **Create `TestCase` Model**: A new `TestCase` model will be created in `problems/models.py`. It will contain a foreign key to the `Problem` model, `input` data, `output` data, and an `is_hidden` boolean flag.
2.  **Refine `Problem` Model**: The existing `sample_input` and `sample_output` fields on the `Problem` model will be removed, as their function will be replaced by the new `TestCase` model (where `is_hidden=False`).
3.  **Database Migrations**: New database migration files will be generated and applied to reflect these model changes.

## Out of Scope

-   Creating the admin interface for managing problems and test cases.
-   Any changes to the API or frontend. This spec is purely for database model changes.

## Expected Deliverable

1.  A new `TestCase` model is defined in `problems/models.py`.
2.  The `Problem` model in the same file is updated to remove the redundant sample fields.
3.  A new migration file is successfully generated.
4.  The migration is successfully applied to the database, resulting in the updated schema.
