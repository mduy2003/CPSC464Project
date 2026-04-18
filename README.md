# Study Group Finder Prototype

## Overview

Study Group Finder is a prototype web application for CPSC 464 that helps students:

- Create an account and log in
- Create study groups by course
- Browse and search available groups
- Join and leave study groups

This repository is focused on implementation of the prototype code only.

## Implemented MVP Features

- User registration and login/logout
- Session-based authentication
- Create study groups (title, course code, description)
- Browse all study groups
- Search groups by course and keyword
- Join and leave groups
- SQLite persistence for users, groups, and memberships

## Scope Boundary

Included in prototype:

- Core group discovery and membership workflows

Not included yet:

- Messaging
- Notifications
- LMS integration
- Recommendation engine
- Admin dashboard

## Tech Stack

- Backend: Node.js + Express
- Views/UI: EJS templates + CSS
- Database: SQLite (`data/study_groups.db`)
- Authentication: `bcryptjs` + `express-session`

## Project Structure

```
src/
  app.js
  db.js
  middleware/
    auth.js
  routes/
    auth.js
    groups.js
views/
  partials/
  login.ejs
  signup.ejs
  groups.ejs
  new-group.ejs
public/
  css/
data/
README.md
package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ (or newer LTS)

### Install

```bash
npm install
```

### Run

```bash
npm start
```

Open:

`http://localhost:3000`

## Demo Checklist

- Sign up a new user
- Log in
- Create a group
- Search groups by course or keyword
- Join a group
- Leave a group
- Log out

## Authors

* Duy Nguyen  / mduy2003@csu.fullerton.edu
* Michael Bui / buimichael@csu.fullerton.edu

## Course Information

CPSC 464 - System Architecture Project
