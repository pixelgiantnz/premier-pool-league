# Premier Pool League

A multi-league platform for casual office pool competitions. Each League is a light-touch, fun-first competition played on basic 8-ball rules with no handicaps. A single physical table per venue; no booking or table management. The Platform is not used for practice or ad hoc play — only official League Games are tracked.

## Language

**Platform**:
Software that hosts many independent Leagues. Authenticated Viewers can browse active and past Leagues across the Platform. Interactive Kiosk play requires an additional Kiosk password to unlock a machine.
_Avoid_: tenant (in user-facing language), organisation

**Master Admin**:
The single administrator who manages all Leagues, the Platform Player pool, and League rosters. Authenticated by email and password.
_Avoid_: league admin, platform admin, super user

**Platform password**:
A shared credential that gates read-only Viewer access to the Platform (all Leagues, active and past). Set by the Master Admin.
_Avoid_: viewer password, access code

**Kiosk password**:
A separate credential that unlocks interactive Kiosk mode on a specific machine at the table. Without it, a device only has Viewer access even after the Platform password is entered.
_Avoid_: pin, play password

**League**:
A structured competition with a **League roster** of Players and a defined **League format**. Created and managed by the Master Admin. Becomes a **Past League** when every required Game has been played or forfeited.
_Avoid_: division

**League format**:
How many official Games each Player pair must complete — for example, single round-robin (one Game per pair) or double round-robin (two Games per pair). No fixed fixture schedule is generated; Players choose the order they play.
_Avoid_: season, schedule

**Past League**:
A completed League whose required Games are all resolved. The **Champion** is displayed on the Dashboard and in League listings. Past Leagues remain accessible for historic reference and detailed review.
_Avoid_: archived league, closed season

**Champion**:
The Player who wins the **Champion tiebreak** when a League completes. Featured on the Dashboard and in Past League listings.
_Avoid_: winner, first place

**Champion tiebreak**:
The procedure when two or more Players share the top win count at League completion. A **two-way tie** is broken by the Player who won the head-to-head Game between the two. A **multi-way tie** (three or more) sends each tied Player into **Tiebreak Games** — one additional Game per tied Player per round among the tied group — repeating rounds until exactly one Player leads.
_Avoid_: playoff, shootout

**Player**:
A person on the Platform with a display name, nickname, avatar, and optional blurb. Managed in the **Player pool** by the Master Admin; eligible for Games and the League Table only when on a League's **League roster**.
_Avoid_: member, user (when meaning a Player)

**Player pool**:
All Players registered on the Platform. The Master Admin creates and edits profiles here; a Player can belong to more than one League roster over time.
_Avoid_: directory, global roster, member list

**League roster**:
The Players assigned to a specific League for that competition. Built by adding Players from the Player pool; removing someone from a roster does not delete them from the pool.
_Avoid_: squad, team list, entrants

**Pairing**:
The official contest relationship between two Players in a League, capped by the League format (one or two Games). A Pairing is not pre-scheduled; either Player initiates a Game by selecting an opponent they have not yet finished playing.
_Avoid_: match, fixture, matchup

**Remaining opponents**:
For a given Player, the subset of League roster still eligible as an opponent — those with whom the Player has fewer completed official Games than the League format requires.
_Avoid_: unplayed list, available opponents

**Game**:
An official 1v1 8-ball session between two Players in a Pairing, tracked live from start through to a final **Game outcome**. Every Turn, Break, Shot, foul, and miss is recorded. Rules: open break; breaker chosen by the Players or by a Lag; solids/stripes assigned on the first ball legally potted after the Break; the eight-ball must be called to a pocket; scratching on the eight-ball or sinking the eight-ball unintentionally loses the Game. At most one active Game on the Platform at a time (one table).
_Avoid_: frame, practice game, match (when meaning a Game)

**Game outcome**:
How a Game ends. A **Win** or **Forfeit** records a winner, consumes one Game slot toward the Pairing cap, and updates the League Table. A **Cancel** ends with no result — the Game is treated as not played, does not consume a Pairing slot, and does not affect the League Table.
_Avoid_: abandon, draw, tie

**Assigned balls**:
The solids or stripes group belonging to a Player once group assignment has occurred in a Game.
_Avoid_: suit, group

**Turn**:
One Player's visit at the table within a Game, ending when they miss, foul, pot an opponent's Assigned ball, or win.
_Avoid_: visit, inning

**Break**:
The opening Turn of a Game, taken by the designated breaker.
_Avoid_: opening shot, break shot (when referring to the domain Turn)

**Lag**:
A pre-Game procedure the two Players use to decide who breaks, when they don't choose directly.
_Avoid_: coin flip, toss

**Shot**:
A recorded table event within a Turn — a pot, miss, or foul. Includes which ball was involved when applicable.
_Avoid_: action, play

**Kiosk**:
Touch-first interactive mode at the table for recording Shots. Unlocked by Kiosk password on a device bound to the Platform. Play flow: enter match select → choose your Player → choose a Remaining opponent → play. The active Player is derived from Turn order; the UI presents ball buttons to record each Shot. While a Game is active, the screen locks to the live Game view until the outcome is finalised.
_Avoid_: terminal, station, play mode (as a noun)

**Viewer**:
Authenticated Platform access (via Platform password) in read-only mode — the Dashboard, Past Leagues, and detailed Game summaries — without ability to start a Game or record Shots.
_Avoid_: public viewer, spectator

**Dashboard**:
The combined read-only layout showing the League Table, active Game, past Games, Player stats, and Champion for completed Leagues. Completed Games show a result; a detailed summary is available on drill-down.
_Avoid_: homepage, screen

**League Table**:
Standings for a League ranked by win count, updated after each Game with a Win or Forfeit outcome.
_Avoid_: leaderboard, standings (when the domain term League Table is intended)

**Player stats**:
Per-Player aggregates derived from recorded Games: games played, wins, losses, win streak, fouls, misses, balls potted, and favourite ball (the ball most often potted by that Player).
_Avoid_: profile, metrics
