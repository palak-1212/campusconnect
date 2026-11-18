# Campus Connect (College Project)

Plain HTML + CSS + vanilla JavaScript. No server, no database, no installs.
All data (orders, applications, events, resumes, notifications, login session) is stored in the browser's `localStorage`.

## How to run
Double-click **login.html** (or **index.html**) - it opens in any modern browser.
(Optional: any static server also works, e.g. `python -m http.server`.)

## Demo logins
| Role           | Username    | Password       | Can open                                                      |
|----------------|-------------|----------------|---------------------------------------------------------------|
| Student        | `student`   | `student123`   | All 7 tabs (view only for marks/attendance)                   |
| Faculty        | `faculty`   | `faculty123`   | Home, Canteen, Clubs, Classroom Hub (edit), Notifications     |
| Placement Head | `placement` | `placement123` | Home, Placement Cell (manage), Resume Hub (review), Notifications |

Opening a page your role cannot access sends you back to Home; opening any page while logged out sends you to Login.
Use **Logout** (sidebar / top bar / "More" on mobile). "Reset demo data" on the login page restores the starting data.

## Folder layout
```
login.html            index.html (Home)      canteen.html   clubs.html
academics.html        placement.html         resume.html    notifications.html
css/style.css         js/data.js  (accounts, seed data, login + page guard)
js/main.js (sidebar/topbar/home)   js/login.js   js/canteen.js   js/clubs.js
js/academics.js   js/placement.js   js/resume.js   js/notifications.js
```
Note: fonts load from Google Fonts when online; offline it falls back to system fonts.
