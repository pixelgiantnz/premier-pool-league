# Platform Player pool separate from League rosters

Players exist once on the Platform in a shared **Player pool** (profile: name, nickname, avatar, blurb). Each League has a **League roster** — a subset of pool Players assigned to that competition. Removing someone from a roster does not delete their pool profile; the same person can appear on multiple League rosters over time (e.g. successive office seasons).

We chose this because the Master Admin manages people independently of any one League: profiles are reused, roster changes stay lightweight, and historic Leagues keep stable membership without duplicating identity data. The alternative (Players owned only by a single League) forces re-entry of the same people for every new League and blurs “person” with “entrant in this competition.”
