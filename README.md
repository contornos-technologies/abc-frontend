# ABC Frontend

Frontend application for the ABC project, built with React, Vite, and Tailwind CSS v4.

This repository contains the full frontend setup, layout structure, linting configuration, and documentation required to start feature development.

---

## Technologies Used

- React (with Vite)
- Tailwind CSS v4
- JavaScript (ESM)
- ESLint
- npm

---

## Project Structure

src/
pages/
components/
hooks/
services/
App.jsx
main.jsx
index.css

---

## Prerequisites

Before running the project, make sure you have:

- Node.js (version 18 or higher recommended)
- npm installed

You can verify by running:

node -v  
npm -v

---

## Installation

Clone the repository:

git clone https://github.com/Fernando2300/abc-frontend.git

Navigate into the project directory:

cd abc-frontend

Install dependencies:

npm install

---

## Running the Project

Start the development server:

npm run dev

The application will be available at:

http://localhost:5173

---

## Available Scripts

npm run dev  
Starts the development server with hot reload.

npm run build  
Builds the project for production.

npm run preview  
Previews the production build locally.

npm run lint  
Runs ESLint to check code quality.

---

## Tailwind CSS

This project uses Tailwind CSS version 4.

Tailwind is configured globally in index.css and works across all components and pages.

---

## Development Guidelines

- All new features should be developed in the develop branch
- Follow existing folder structure
- Keep components small and reusable
- Use Tailwind utility classes instead of custom CSS when possible
- Ensure the project builds without errors before committing

---

## Git Workflow

- main: protected, stable branch
- develop: active development branch
- Use clear commit messages following this pattern:

feat: new feature  
fix: bug fix  
chore: tooling or configuration changes

---

## Quick Start Guide

1. Clone the repository
2. Install dependencies with npm install
3. Run npm run dev
4. Open http://localhost:5173 in the browser
5. Start building features

---

## Project Status

Base frontend infrastructure completed.  
Ready for feature development and backend integration.

---

## Maintainer

Contornos Designs
