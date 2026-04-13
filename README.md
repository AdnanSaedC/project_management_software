# 06 - Project Management Software (Backend)

A **Node.js backend scaffold** for a project management platform inspired by Jira. This project was created as a learning exercise to understand backend project setup, Node.js module systems, and code formatting with Prettier.

## About

This is an early-stage backend project built to practice:
- Setting up a Node.js project from scratch using `npm init`
- Understanding CommonJS vs ES Modules (`type: "module"`)
- Integrating **Prettier** for consistent code formatting

## Tech Stack

- Node.js (ES Modules)
- Prettier (code formatter)

## How to Run

```bash
# Install dependencies
npm install

# Start the project
npm run dev
```

## Code Formatting

This project uses Prettier for formatting. Run the following to format all files:

```bash
# Check formatting
npx prettier . --check

# Apply formatting
npx prettier . --write
```

## File Structure

```
project_management_software/
├── index.js          # Entry point
├── package.json      # Project config and scripts
├── .prettierrc       # Prettier configuration
├── .prettierignore   # Files excluded from formatting
└── 00_notes.txt      # Project notes and learning log
```

## Status

This project is a **work in progress** / learning scaffold. Core features are not yet implemented.
