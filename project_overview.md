Project Overview

Build a fully responsive, production-ready football prediction website for the FIFA World Cup 2026 Final between:

> 🇦🇷 Argentina vs 🇪🇸 Spain



The website should be accessible from any modern web browser (desktop, tablet, and mobile) without requiring an app installation.

The website should feature a premium FIFA World Cup-inspired design with real-time match updates, live rankings, achievement badges, analytics, and a polished, professional user experience. It should be scalable to support thousands of concurrent users and be reusable for future football matches or tournaments by simply creating a new match.


---

Project Objectives

The website should:

Allow users to register and create an account.

Allow only one prediction per registered user.

Automatically calculate points as the match progresses.

Update the leaderboard live.

Display live match information.

Support both automatic API updates and manual admin updates.

Be secure, responsive, fast, and easy to maintain.

Follow modern UI/UX standards with smooth animations and excellent mobile support.



---

User Registration

Every user must create an account before participating.

Registration Fields

Full Name

Username

Mobile Number

Password

Confirm Password


Username Rules

Every username must be unique.

No two users can have the same username.

If the username already exists, display:


> "This username is already taken. Please choose another username."



Mobile Number Rules

Every mobile number must be unique.

Only one account may be created using a mobile number.

If the mobile number is already registered, display:


> "This mobile number is already registered."



Password Rules

Passwords must:

Be at least 8 characters.

Include one uppercase letter.

Include one lowercase letter.

Include one number.

Include one special character.


Passwords must always be securely hashed and never stored as plain text.


---

User Login

Users will log in using:

Username

Password


Do not require the mobile number after registration.

Include:

Remember Me

Forgot Password

Logout


Forgot Password should allow password reset using the registered mobile number (or OTP if implemented).


---

Prediction Lock

Predictions automatically close on:

20 July 2026 at 12:30 AM

After this time:

No new predictions.

No editing predictions.

Prediction forms become read-only.

Display:


> 🔒 Predictions are now closed.



Display a live countdown timer until predictions lock.


---

Prediction Page

The prediction page should be clean, visually attractive, and easy to use.

Use dropdown menus for every prediction requiring a player, team, or number.

Users should never manually type player names.


---

Prediction Categories

1. Match Winner (15 Points)

Question:

Who will win the FIFA World Cup Final?

Dropdown:

Argentina

Spain


Points:

15


---

2. Exact Score Prediction (10 Points)

Predict the final score.

Dropdown:

Argentina Goals:

0–10

Spain Goals:

0–10

Example:

Argentina 3

Spain 2

Points:

10

Only exact score receives points.


---

3. First Team To Score (10 Points)

Dropdown:

Argentina

Spain


Points:

10


---

4. First Goal Scorer (10 Points)

Dropdown containing every available player.

Example:

Argentina

Lionel Messi

Julian Alvarez

Lautaro Martinez

Enzo Fernandez

Rodrigo De Paul

Alexis Mac Allister

etc.


Spain

Lamine Yamal

Nico Williams

Pedri

Dani Olmo

Alvaro Morata

Fabian Ruiz

etc.


Points:

10


---

Bonus Predictions

Man of the Match (10 Points)

Dropdown with all players.


---

Total Goals (5 Points)

Dropdown:

0

1

2

3

4

5

6

7+


---

Match Ends In (10 Points)

Dropdown:

90 Minutes

Extra Time

Penalties



---

Both Teams To Score (5 Points)

Dropdown:

Yes

No


---

Total Yellow Cards (5 Points)

Dropdown:

0–10


---

Red Card? (5 Points)

Dropdown:

Yes

No


---

Team With Most Possession (5 Points)

Dropdown:

Argentina

Spain


---

Total Corners (5 Points)

Dropdown:

0–20


---

Last Goal Scorer (10 Points)

Dropdown with all available players.


---

Live Match Integration

The website must support both automatic and manual updates.

Method 1 – Automatic

Use a free football API such as:

API-Football (Free Tier)

Football-Data.org

ScoreBat (where applicable)


Automatically fetch:

Live Score

Match Time

Goal Scorers

Goal Timeline

Cards

Corners

Possession (if available)

Match Status

Final Result



---

Method 2 – Manual Admin Control

The admin must be able to manually update or override any match information.

Editable fields:

Live Score

Match Status

Winner

Goal Events

Goal Scorers

First Goal Scorer

Last Goal Scorer

Yellow Cards

Red Cards

Possession

Corners

Man of the Match


Whenever the API or the admin updates match data, the leaderboard should automatically recalculate and refresh for every connected user.


---

Live Match Center

Display:

Current Score

Match Minute

Match Status

Goal Timeline

Goal Scorers

Yellow Cards

Red Cards

Corners

Possession

Shots (if supported)

Live Commentary (if available)


All updates should appear in real time using Socket.IO or an equivalent technology.


---

Live Leaderboard

The leaderboard should update automatically throughout the match.

Display:

Rank

Username

Total Points

Correct Predictions

Achievement Badge


Include a podium for:

🥇 First

🥈 Second

🥉 Third


---

Searchable Leaderboard

Allow searching by:

Username


Admin may additionally search by:

Name

Mobile Number


Sorting options:

Rank

Points

Submission Time



---

User Dashboard

Each user should have a personal dashboard displaying:

Username

Current Rank

Total Points

Submitted Predictions

Prediction History

Correct Predictions

Incorrect Predictions

Achievement Badges

Progress Bar


Predictions become read-only after the lock time.


---

Achievement Badges

Examples:

🏆 World Champion Predictor

🎯 Perfect Score

⚽ Goal Prophet

🔥 Hot Streak

⭐ Early Bird

🥇 Top Predictor

🥈 Runner-Up

🥉 Third Place

Badges should be displayed on user profiles and the leaderboard.


---

Live Notifications

Display notifications such as:

✅ +10 Points Earned

🔥 Your rank has increased!

📈 You entered the Top 10!

🥇 You are now Rank #1!

🏆 Congratulations!


---

Winner Celebration

After the match finishes:

Celebrate the Top 3 users with:

Confetti animation

Trophy graphics

Winner banners



---

Hall of Fame

Create a permanent Hall of Fame page displaying:

Champion

Runner-Up

Third Place

Top 10 Predictors

Highest Score

Perfect Predictors

Total Participants

Match Statistics

Prediction Contest Date


This allows future tournaments to maintain historical records.


---

Admin Dashboard

Create a secure admin panel.

Admin Credentials

Username:

Messi

Password:

WCW2026

The admin should be able to:

Lock predictions

Unlock predictions (before the deadline if required)

Create new matches

Edit existing matches

Add or remove players

Update squads

Update scores

Update goal events

Update cards

Update possession

Update corners

Update Man of the Match

Override API data

Export users to Excel

Export predictions

Export leaderboard

View all registered users

Reset user passwords

Delete fraudulent or duplicate accounts



---

Admin Analytics Dashboard

Display charts and statistics such as:

Total registered users

Prediction submission timeline

Percentage predicting Argentina

Percentage predicting Spain

Most common score prediction

Most selected First Goal Scorer

Most selected Man of the Match

Average predicted goals

Prediction distribution

Leaderboard statistics

Prediction accuracy after the match


Use professional charts (bar charts, pie charts, line graphs, and heat maps where appropriate).


---

Tie-Break Rules

If multiple users finish with the same number of points, ranking should be decided in the following order:

1. Exact Score Prediction


2. Match Winner Prediction


3. First Goal Scorer Prediction


4. Man of the Match Prediction


5. Earlier Submission Time




---

Rules Page

Create a dedicated Rules page containing:

Every user must register before participating.

One account per mobile number.

Every username must be unique.

One prediction per registered account.

Predictions automatically close on 20 July 2026 at 12:30 AM.

Predictions cannot be edited after submission or after the lock time.

Duplicate or fraudulent accounts may be removed.

Live leaderboard updates automatically during the match.

Admin decisions are final.

Tie-break rules are applied in the following order:

1. Exact Score


2. Match Winner


3. First Goal Scorer


4. Man of the Match


5. Earlier Submission Time





---

Database Structure

Users

User ID

Full Name

Username

Mobile Number

Password (hashed)

Registration Time

Last Login

IP Address

Browser Fingerprint



---

Predictions

User ID

Match Winner

Exact Score

First Team To Score

First Goal Scorer

Man of the Match

Total Goals

Yellow Cards

Red Card

Possession

Corners

Last Goal Scorer

Submission Time



---

Match

Match ID

Teams

Kickoff Time

Live Score

Goal Events

Match Status

Cards

Possession

Corners

Winner

Final Result



---

Leaderboard

User ID

Points

Rank

Correct Predictions

Badge



---

UI / UX Requirements

Theme:

Premium FIFA World Cup Theme

Color Palette:

Dark Blue

Black

White

Gold


Include:

Stadium background

FIFA-style trophy graphics

Argentina and Spain flags

Team logos (ensure proper licensing or placeholders during development)

Glassmorphism cards

Smooth page transitions

Hover animations

Loading animations

Skeleton loaders

Responsive layout

Mobile-first design

Dark mode

Clean typography

Professional sports styling



---

Technology Stack

Frontend

Next.js

React

TypeScript

Tailwind CSS

Framer Motion


Backend

Node.js

Express.js


Database

Supabase PostgreSQL


Authentication

Username + Password


Real-Time Updates

Socket.IO


Football Data

Free football API (API-Football Free Tier, Football-Data.org, or another suitable free provider)


Deployment

Frontend:

Vercel


Backend:

Railway or Render


Database:

Supabase



---

Security Requirements

Password hashing (bcrypt or Argon2).

Input validation.

SQL injection protection.

XSS protection.

CSRF protection where applicable.

Secure admin authentication.

Rate limiting on login and prediction submission.

Secure session management.

HTTPS-ready deployment.

Audit logs for all admin actions.



---

Additional Features

Live countdown timer until prediction lock.

Searchable leaderboard.

User profile with prediction history.

Achievement badges.

Live confetti animation for winners.

Admin analytics dashboard.

Export to Excel and CSV.

Toast notifications.

Real-time synchronization across all connected users.

Reusable architecture for future matches and tournaments.



---

Final Deliverable

Develop a modern, production-ready football prediction website that provides an engaging fan experience for the FIFA World Cup 2026 Final between Argentina and Spain. The platform must feature secure user registration, unique usernames, live match tracking, automatic and manual score updates, automatic point calculation, a real-time leaderboard, achievement badges, analytics, a Hall of Fame, and a powerful admin dashboard. The codebase should be clean, modular, scalable, well-documented, and follow industry best practices so that future matches and tournaments can be added with minimal changes. The website should feel polished, reliable, and visually comparable to a professional sports prediction platform.