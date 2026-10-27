/**
 * In-application help knowledge base for the Orbit Assistant.
 *
 * Every entry is written against features that actually exist in this build of
 * HROrbit (routes, buttons and labels verified in the source). Nothing here
 * contains employee data: personal details are always answered by pointing to
 * the screen or person that owns them.
 *
 * Shape of an entry:
 *   id       stable key
 *   kind     'app' for real features, 'unavailable' for things HROrbit does not do
 *   title    short heading shown above the steps
 *   route    in-app destination the assistant can offer to open
 *   steps    beginner-friendly, numbered instructions
 *   note     optional "good to know" line
 *   keywords weighted phrases used by the matcher (multi-word phrases score higher)
 *   samples  natural phrasings, used for fuzzy similarity matching
 */

export const APP_TOPICS = [
  {
    id: 'dashboard',
    kind: 'app',
    title: 'What is on your dashboard',
    route: '/',
    routeLabel: 'Open dashboard',
    steps: [
      'Select Dashboard at the top of the sidebar (Workspace group).',
      'The top of the page shows your welcome banner, upcoming events, team summary cards and a mood check-in.',
      'Scroll down for pinned announcements, Today for you, Team pulse, your learning pick, Coming up, Recent kudos, Quick links, Featured achievements and People to celebrate.',
      'Each panel has a link such as All updates, Calendar or View all that opens the full page.',
    ],
    note: 'Everything on the dashboard is loaded from the company database for the signed-in employee. HR Admin accounts also see an Admin console button.',
    keywords: [
      ['dashboard', 3], ['home', 2], ['home page', 3], ['homepage', 3], ['widgets', 2],
      ['summary cards', 2], ['team pulse', 2], ['what is on the dashboard', 4], ['landing page', 2],
      ['mood', 1.5], ['welcome banner', 2],
    ],
    samples: ['What information is available on the dashboard?', 'What can I see on my home page?'],
  },
  {
    id: 'search',
    kind: 'app',
    title: 'Search across HROrbit',
    route: null,
    steps: [
      'Click the Search anything… field in the top bar.',
      'Type a keyword. Results are grouped from announcements, events, people in Quick Connect, quick links and learning courses.',
      'Press Enter to open the first result, or click any result to jump to its page.',
    ],
    note: 'The search box covers those five areas only — it does not search Settings, the admin console or HR FAQ answers.',
    keywords: [
      ['search', 3], ['find', 2], ['look for', 2], ['global search', 5], ['search bar', 4],
      ['search box', 4], ['where can i find', 1.5], ['command k', 3], ['shortcut', 1.5],
    ],
    samples: ['How do I search across the app?', 'Where is the global search?'],
  },
  {
    id: 'notifications',
    kind: 'app',
    title: 'Notifications and the top bar',
    route: null,
    steps: [
      'The bell icon at the top right shows your unread notification count.',
      'Click it to open the list; choosing a notification marks it read and opens its announcement, event or kudos page.',
      'Use Mark all read inside the panel to clear the badge at once.',
    ],
    note: 'The same top bar holds the colour palette, the light/dark theme toggle and your profile menu.',
    keywords: [
      ['notification', 3], ['notifications', 3], ['bell', 3], ['unread', 3], ['alerts', 2],
      ['mark all read', 4], ['badge', 2],
    ],
    samples: ['Where do I see my notifications?', 'How do I clear the notification badge?'],
  },
  {
    id: 'profile',
    kind: 'app',
    title: 'View and update your profile',
    route: '/profile',
    routeLabel: 'Open my profile',
    steps: [
      'Select My profile in the sidebar (Personal group), or click your name at the top right and choose My profile.',
      'Your Professional Details panel shows legal name, department, office location, corporate email, job title, timezone and joining date.',
      'To change display details, click Edit profile at the top right, update Role title, Work location and About me bio, then press Save changes.',
      'To change the cover photo, click the camera icon on the cover image, pick a JPG, PNG or WebP under 5 MB, then press Save cover.',
    ],
    note: 'Legal name, department, corporate email and joining date come from HR records and cannot be edited here — ask Quick Connect to correct them.',
    keywords: [
      ['profile', 3], ['my profile', 4], ['about me', 3], ['bio', 3], ['edit profile', 5],
      ['update profile', 5], ['professional details', 4], ['job title', 2], ['designation', 2],
      ['work location', 3], ['cover photo', 3], ['cover image', 3], ['cover', 3.5], ['upload cover', 4],
      ['upload photo', 4], ['upload picture', 4],
      ['avatar', 2], ['photo', 2.5], ['profile picture', 5], ['picture', 2.5], ['personal details', 3],
      ['my details', 2.5], ['change details', 2.5],
    ],
    samples: ['How do I update my profile?', 'Where can I change my bio and photo?', 'How do I view my professional details?', 'How do I upload a cover photo?'],
  },
  {
    id: 'announcements',
    kind: 'app',
    title: 'Company announcements',
    route: '/announcements',
    routeLabel: 'Open announcements',
    steps: [
      'Select Announcements in the sidebar (Workspace group).',
      'Unread posts carry a NEW label, and the sidebar badge shows how many are unread.',
      'Click a post to open its details, or use Mark as read / Mark unread on the card.',
      'Use the search box to filter posts by text.',
    ],
    note: 'HR Admins see a Manage posts button to create, edit and remove announcements.',
    keywords: [
      ['announcement', 4], ['announcements', 4], ['news', 2.5], ['updates', 2], ['company updates', 3],
      ['notice', 2.5], ['notices', 2.5], ['bulletin', 3], ['circular', 3], ['mark as read', 3],
    ],
    samples: ['Where can I find company announcements?', 'How do I read the latest company news?'],
  },
  {
    id: 'events',
    kind: 'app',
    title: 'Company events',
    route: '/events',
    routeLabel: 'Open upcoming events',
    steps: [
      'Select Upcoming events in the sidebar (Workspace group).',
      'Switch between List view and Month view with the buttons above the calendar.',
      'Each card lists the date, time, venue and category; press RSVP / Join to open the event link in a new tab.',
      'The dashboard Coming up panel shows the same events and links to this page.',
    ],
    note: 'HROrbit has no separate company-holiday calendar. Holiday dates arrive through HR communications and announcements.',
    keywords: [
      ['event', 4], ['events', 4], ['calendar', 3], ['month view', 4], ['rsvp', 4],
      ['upcoming', 2.5], ['townhall', 3], ['webinar', 2], ['holiday', 3], ['holidays', 3],
      ['company holiday', 4], ['holiday list', 4], ['holiday calendar', 5],
    ],
    samples: ['Where do I view company events?', 'How do I RSVP to an event?', 'Where can I see company holidays?'],
  },
  {
    id: 'quicklinks',
    kind: 'app',
    title: 'Quick Links and company resources',
    route: '/quick-links',
    routeLabel: 'Open quick links',
    steps: [
      'Select Quick links in the sidebar (Workspace group).',
      'Each card is an HR-managed destination: internal links open inside HROrbit, external portals open in a new tab.',
      'Type in the search box to filter the cards.',
      'The Quick links panel on your dashboard shows the same set for quick access.',
    ],
    note: 'Cards marked as placeholders do not have a destination yet and say so when clicked. HR Admins can add, edit and remove links with Manage links.',
    keywords: [
      ['quick link', 5], ['quick links', 5], ['links', 2.5], ['portal', 3], ['portals', 3],
      ['resources', 2.5], ['company resources', 4], ['shortcuts', 3], ['hr portal', 4],
      ['intranet', 3], ['bookmarks', 2],
    ],
    samples: ['How do I access HR portals?', 'Where are the company resources?'],
  },
  {
    id: 'teams',
    kind: 'app',
    title: 'Connect with colleagues on Microsoft Teams',
    route: '/hr-contacts',
    routeLabel: 'Open Quick Connect',
    steps: [
      'Select Quick Connect in the sidebar (People & growth group).',
      'Search by name, team or specialty, or pick a department from the Department filter.',
      'On a contact card choose Schedule chat to open a Microsoft Teams chat with that person, or Email Partner to send mail.',
      'The same contact cards are used for HR partners, so this is also how you reach HR directly.',
    ],
    note: 'HROrbit hands the conversation to Microsoft Teams through a chat link; the chat itself continues in Teams (app or browser).',
    keywords: [
      ['teams', 4], ['microsoft teams', 5], ['ms teams', 5], ['chat with', 3], ['message a colleague', 5],
      ['contact colleague', 4], ['quick connect', 5], ['hr contact', 4], ['people partner', 4],
      ['email partner', 5], ['schedule chat', 5], ['directory', 2.5], ['hr partner', 4], ['connect with hr', 5],
    ],
    samples: ['How can I connect with colleagues on Microsoft Teams?', 'How do I message an HR partner?'],
  },
  {
    id: 'kudos',
    kind: 'app',
    title: 'Give kudos to a colleague',
    route: '/recognition',
    routeLabel: 'Open kudos & recognition',
    steps: [
      'Select Kudos & recognition in the sidebar, or press Give Kudos on your dashboard welcome banner.',
      'Click Give Kudos to open the form.',
      'Search for the teammate (you cannot pick yourself), choose a recognition theme, and write your message.',
      'Press Send — the kudos appears in the appreciation feed and in the dashboard Recent kudos panel.',
    ],
    note: 'The feed shows who recognised whom, the theme and the message. Entries are stored in the company database.',
    keywords: [
      ['kudos', 5], ['give kudos', 6], ['give a kudos', 6], ['recognise', 4], ['recognize', 4],
      ['recognition', 4], ['appreciate', 3], ['appreciation', 4], ['praise', 3], ['compliment', 3],
      ['thank a colleague', 4], ['shout out', 4], ['shoutout', 4], ['award', 2.5],
    ],
    samples: ['How do I give kudos?', 'How can I appreciate a teammate?', 'Where is the recognition feed?'],
  },
  {
    id: 'learning',
    kind: 'app',
    title: 'Learning hub and courses',
    route: '/learning',
    routeLabel: 'Open learning hub',
    steps: [
      'Select Learning hub in the sidebar (People & growth group).',
      'Search courses or narrow the list with the category, provider, level, Free only and Saved resources filters.',
      'Use the bookmark icon on a course to add it to Saved resources.',
      'Start learning opens the provider page in a new tab.',
    ],
    note: 'The dashboard Picked for your growth panel links to the same catalogue.',
    keywords: [
      ['learning', 4], ['course', 4], ['courses', 4], ['training', 3], ['upskill', 3],
      ['learning hub', 5], ['saved resources', 4], ['bookmark', 3], ['certification', 3], ['skills', 2],
    ],
    samples: ['Where can I find learning resources?', 'How do I save a course?'],
  },
  {
    id: 'community',
    kind: 'app',
    title: 'Employee community clubs',
    route: '/community',
    routeLabel: 'Open community',
    steps: [
      'Select Employee community in the sidebar (People & growth group).',
      'Browse the clubs and their descriptions.',
      'Press Join club to join; the button changes to Joined and pressing it again leaves the club.',
    ],
    note: 'Joined clubs are kept for your session and shown in the joined count on the page.',
    keywords: [
      ['community', 4], ['clubs', 4], ['club', 3], ['interest group', 4], ['groups', 2.5],
      ['employee community', 5], ['join a club', 4],
    ],
    samples: ['How do I join a community club?', 'Where is the employee community?'],
  },
  {
    id: 'games',
    kind: 'app',
    title: 'Daily games',
    route: '/games',
    routeLabel: 'Open daily games',
    steps: [
      'Select Daily games in the sidebar (People & growth group).',
      'Pick a puzzle card — Orbit Grid or Word Connections.',
      'Play, then use Need a hint, Reset or Check grid as needed.',
    ],
    note: 'Games are a break-time extra; scores and streaks are not stored in the database.',
    keywords: [
      ['game', 4], ['games', 4], ['daily games', 5], ['puzzle', 4], ['brain break', 4],
      ['orbit grid', 4], ['word connections', 4], ['play', 2],
    ],
    samples: ['Where can I play the daily puzzle?', 'What games are available?'],
  },
  {
    id: 'settings',
    kind: 'app',
    title: 'Settings and preferences',
    route: '/settings',
    routeLabel: 'Open settings',
    steps: [
      'Select Settings in the sidebar (Personal group).',
      'Choose the Light or Dark theme under Appearance & layout. The palette icon in the top bar changes the accent colour.',
      'Notification switches are previews of the preference experience and are stored in this browser.',
      'The Workspace mode panel switches between Employee and HR Admin when your account allows it.',
      'Reset demo preferences restores the defaults.',
    ],
    note: 'Preferences live in browser storage; company data is always loaded from the server.',
    keywords: [
      ['settings', 5], ['preferences', 4], ['dark mode', 4], ['light mode', 4], ['theme', 3],
      ['appearance', 3], ['colour theme', 3], ['color theme', 3], ['notifications settings', 3],
      ['reset preferences', 4],
    ],
    samples: ['How do I switch to dark mode?', 'Where are my preferences?'],
  },
  {
    id: 'mode',
    kind: 'app',
    title: 'Employee and HR Admin mode',
    route: '/settings',
    routeLabel: 'Open workspace mode',
    steps: [
      'Open your profile menu at the top right, or go to Settings → Workspace mode.',
      'If your account has HR Admin access, use Switch to HR Admin (or Switch to Employee) to change mode.',
      'HR Admin mode adds the Admin console entry to the sidebar and Manage buttons on announcements, events and quick links.',
    ],
    note: 'The mode can never exceed the access role granted to your account, and switching does not sign you out.',
    keywords: [
      ['hr admin', 5], ['admin mode', 5], ['employee mode', 5], ['role', 2], ['switch mode', 5],
      ['workspace mode', 5], ['mode switch', 4], ['permissions', 3],
    ],
    samples: ['How do I switch to HR Admin mode?', 'Why can’t I see the admin console?'],
  },
  {
    id: 'admin',
    kind: 'app',
    title: 'Admin console',
    route: '/admin',
    routeLabel: 'Open admin console',
    steps: [
      'In HR Admin mode, select Admin console in the sidebar (Administration group).',
      'Choose Announcements, Upcoming events or Quick links and use Manage.',
      'Add, edit or remove items, then return with the back button above the form.',
    ],
    note: 'Quick Connect contacts are read-only in the admin console because they come from the employee directory. Changes affect everyone and are saved to the company database.',
    keywords: [
      ['admin console', 6], ['admin page', 4], ['manage announcements', 4], ['manage events', 4],
      ['manage links', 4], ['content management', 4],
    ],
    samples: ['How do I manage announcements as an admin?', 'Where is the admin console?'],
  },
  {
    id: 'assistant',
    kind: 'app',
    title: 'Using the HR FAQ assistant',
    route: '/faq',
    routeLabel: 'Open HR FAQ assistant',
    steps: [
      'Open the chat any time with the round launcher at the bottom right of the screen, or from the HR FAQ assistant page with Open chat assistant.',
      'Ask in plain language — for example “where do I update my profile?” or “how do I give kudos?”.',
      'Press Enter or the send arrow. Answers come from the HR FAQ database maintained by HR and from this in-app guide.',
      'Use the rotate icon in the chat header to clear the conversation, and Contact HR at the bottom left to reach a person.',
    ],
    note: 'The HR FAQ assistant page also lists every approved HR answer with search and topic filters.',
    keywords: [
      ['assistant', 3], ['chatbot', 5], ['chat', 3], ['help', 2], ['hr faq', 4],
      ['what can i ask', 5], ['how do you work', 4], ['faq', 3], ['suggestions', 2],
      ['clear chat', 4],
    ],
    samples: ['What types of questions can I ask?', 'How does this assistant work?'],
  },

  /* ---------------------------------------------------------------------
     Features HROrbit does not provide — answered honestly, never invented.
     --------------------------------------------------------------------- */
  {
    id: 'leave',
    kind: 'unavailable',
    // Policy questions ("how many days do I get?") should still be answered by
    // the approved HR FAQ rows, so that content wins when it matches.
    preferHrAnswer: true,
    title: 'Leave applications and balances',
    route: '/hr-contacts',
    routeLabel: 'Contact HR',
    steps: [
      'HROrbit does not include a leave application, leave-balance or leave-status screen yet.',
      'To apply for leave or check your balance, contact your HR partner in Quick Connect — use Email Partner or Schedule chat on their card.',
      'If you only need the policy (how many days you get), open HR FAQ assistant where the approved leave answers are listed.',
    ],
    keywords: [
      ['leave', 4], ['apply leave', 6], ['leave request', 5], ['leave balance', 6], ['leave status', 5],
      ['time off', 4], ['vacation', 4], ['pto', 4], ['casual leave', 5], ['sick leave', 5],
      ['earned leave', 5], ['leave policy', 3], ['holiday balance', 3],
    ],
    samples: ['How do I apply for leave?', 'How many leave days do I have left?', 'Where do I check my leave status?'],
  },
  {
    id: 'attendance',
    kind: 'unavailable',
    // HR's stored answer points at a module this build does not have, so the
    // honest availability answer must win here.
    preferHrAnswer: false,
    title: 'Attendance and timesheets',
    route: '/hr-contacts',
    routeLabel: 'Contact HR',
    steps: [
      'HROrbit has no attendance, check-in or timesheet module in this build.',
      'For attendance corrections or records, contact your HR partner through Quick Connect.',
      'Attendance policy questions are covered by the approved answers in HR FAQ assistant.',
    ],
    keywords: [
      ['attendance', 6], ['check in', 5], ['checkin', 5], ['timesheet', 6], ['regularise', 6],
      ['regularize', 6], ['punch in', 5], ['swipe', 4], ['work hours', 4], ['shift timing', 4],
      ['late mark', 5], ['mark attendance', 6],
    ],
    samples: ['How can I check my attendance?', 'How do I regularise my attendance?'],
  },
  {
    id: 'documents',
    kind: 'unavailable',
    preferHrAnswer: false,
    title: 'Employee documents',
    route: '/hr-contacts',
    routeLabel: 'Contact HR',
    steps: [
      'HROrbit does not store employee documents — there is no document library or document upload in this build.',
      'Request or share documents with the people team through Quick Connect.',
      'The only upload in the app is your profile cover image on My profile (camera icon, JPG/PNG/WebP up to 5 MB).',
    ],
    keywords: [
      ['document', 5], ['documents', 5], ['document library', 6], ['certificate', 4],
      ['offer letter', 5], ['experience letter', 5], ['form 16', 5], ['id card', 4], ['aadhaar', 4],
      ['pan card', 4], ['files', 3], ['file', 2],
    ],
    samples: ['Where can I upload my documents?', 'How do I download my offer letter?'],
  },
  {
    id: 'payroll',
    kind: 'unavailable',
    preferHrAnswer: true,
    title: 'Payslips and salary details',
    route: '/hr-contacts',
    routeLabel: 'Contact HR',
    steps: [
      'HROrbit does not show payslips, salary details or tax documents in this build.',
      'For your payslip or pay-related questions, contact your HR partner in Quick Connect.',
      'General payroll timing questions (for example when salary is credited) can be asked here — they are answered from the HR FAQ database.',
    ],
    keywords: [
      ['payslip', 6], ['pay slip', 6], ['salary slip', 6], ['salary', 4], ['payroll', 5],
      ['compensation', 4], ['salary credit', 4], ['tax documents', 4], ['reimbursement', 5],
      ['expense claim', 5], ['form 12bb', 5],
    ],
    samples: ['Where can I download my payslip?', 'How do I check my salary details?'],
  },
];

/** Suggested questions shown in the assistant and on the HR FAQ page. */
export const APP_SUGGESTIONS = [
  'How do I update my profile?',
  'Where can I find company announcements?',
  'How do I give kudos?',
  'How can I message a colleague on Teams?',
  'Where are the company resources?',
  'What can you help me with?',
];

export const APP_AREAS = [
  'Dashboard and global search',
  'My profile, photo and cover image',
  'Announcements, events and notifications',
  'Quick Links and Quick Connect (including Microsoft Teams)',
  'Kudos & recognition, learning hub, community clubs and daily games',
  'Settings, themes and HR Admin mode',
];
