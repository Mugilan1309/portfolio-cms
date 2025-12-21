# Personal Portfolio & CMS Platform

A custom-engineered full-stack platform designed to showcase AI & Data Science projects. 

Unlike static portfolio templates, this system features a fully dynamic Content Management System (CMS) built from scratch, allowing for real-time updates of case studies, certificates, and professional details without code deployment.

## 🏗️ System Architecture

The application is built on a modern serverless architecture, prioritizing performance, security, and type safety.

- **Frontend:** Next.js 14/15 (App Router) for server-side rendering and SEO optimization.
- **Language:** TypeScript for robust, error-free code execution.
- **Styling:** Tailwind CSS + Shadcn UI for a responsive, accessible interface.
- **Backend & Database:** Supabase (PostgreSQL) handling relational data and storage.
- **Security:** Row Level Security (RLS) policies ensuring only the authenticated admin can modify data.

## 🔥 Key Features

### 1. Dynamic Project Showcase
- **Markdown Support:** Project descriptions utilize a Markdown engine, allowing for rich-text case studies, code blocks, and embedded media.
- **Tagging System:** Projects are categorized dynamically by tech stack (e.g., Python, TensorFlow, React).

### 2. Custom Admin Dashboard
A secure, private interface built for content management:
- **Authentication:** Secure login gateway using Supabase Auth.
- **CRUD Operations:** Full capability to Create, Read, Update, and Delete projects and certificates.
- **Media Helper:** A custom-built tool that converts local screenshots into public URLs for seamless embedding into project descriptions.
- **Profile Management:** Dynamic editing of bio, headlines, and resume links.

### 3. Certificate Verification
- A dedicated section for verifying academic and professional achievements.
- Includes a custom "Full Screen" modal viewer for inspecting certificate credentials in high detail.

## 💾 Database Schema

The system utilizes a relational PostgreSQL schema:
- **`projects`**: Stores case studies, repository links, and demo videos.
- **`certificates`**: Tracks certifications, issuers, and verification links.
- **`profile`**: Centralized storage for bio, avatar, and resume data.

---
*Built by Mugilan Y as a dedicated platform for AI & Engineering Project Showcasing.*