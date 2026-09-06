# Vinyl Collection Registry

> **A private, local-first vinyl collection registry, listening journal, discovery engine, and collection intelligence system.**

**Vinyl Collection Registry** is a mobile-first Progressive Web App (PWA) for cataloguing, exploring, and understanding a personal physical vinyl collection.

It combines:

* a complete collection registry
* personal ratings and notes
* listening history
* discovery tools
* collection analytics
* listening intelligence
* registry health
* wishlist management
* acquisition workflows
* JSON backup and restore
* CSV export
* offline PWA functionality

The application is deliberately designed to work **without an account, backend, cloud database, Discogs integration, Gemini integration, or permanent Internet connection**.

> **Your collection belongs to you. The application is designed to remain useful even when the Internet doesn't.**

---

## Table of Contents

* [What Is This?](#what-is-this)
* [Why It Exists](#why-it-exists)
* [Core Philosophy](#core-philosophy)
* [Features](#features)
* [Application Structure](#application-structure)
* [Library](#library)
* [Record Details](#record-details)
* [Listening History](#listening-history)
* [Discover](#discover)
* [Analytics](#analytics)
* [Registry Health](#registry-health)
* [Wishlist](#wishlist)
* [Acquisition](#acquisition)
* [Artwork](#artwork)
* [Data Architecture](#data-architecture)
* [Data Ownership](#data-ownership)
* [Backup & Restore](#backup--restore)
* [CSV Export](#csv-export)
* [Offline Architecture](#offline-architecture)
* [Installing on iPhone](#installing-on-iphone)
* [Using the App Offline](#using-the-app-offline)
* [Moving the Collection to Another Device](#moving-the-collection-to-another-device)
* [Privacy](#privacy)
* [What This App Does Not Do](#what-this-app-does-not-do)
* [Technology Stack](#technology-stack)
* [Repository Structure](#repository-structure)
* [Development](#development)
* [Production Build](#production-build)
* [Linting / Type Checking](#linting--type-checking)
* [PWA Development](#pwa-development)
* [Data Safety](#data-safety)
* [Troubleshooting](#troubleshooting)
* [Architecture Principles](#architecture-principles)
* [Project Status](#project-status)
* [License](#license)

---

# What Is This?

Vinyl Collection Registry is a personal digital companion for a physical vinyl collection.

It is not intended to replace a music player or become another cloud-based music platform.

Instead, it provides a persistent local record of:

**what you own → what you listen to → how you feel about it → what you discover → what you want next**

The application has four primary destinations:

| Area          | Purpose                                          |
| ------------- | ------------------------------------------------ |
| **Library**   | Browse and manage the physical collection        |
| **Discover**  | Decide what to listen to                         |
| **Analytics** | Understand the collection and listening behavior |
| **Wishlist**  | Track records you want to acquire                |

---

# Why It Exists

Physical collections create a problem that streaming services largely solve automatically.

A streaming service already knows:

* what albums exist
* what metadata they have
* what artwork belongs to them
* what you've played
* how frequently you've played it
* what you might like next

A physical collection does not.

Vinyl Collection Registry is designed to provide that organizational and analytical layer while keeping the underlying data under the collector's control.

It can answer questions such as:

* What do I actually own?
* Which artists are represented?
* Which genres and styles dominate the collection?
* Which decades are represented?
* What records have I never played?
* What have I been playing repeatedly?
* What haven't I played recently?
* Which highly rated records are being neglected?
* What have I added recently?
* How complete is my catalogue metadata?
* What do I want to buy next?
* How has my listening behavior changed over time?

---

# Core Philosophy

## Local-first

The browser's IndexedDB database is the authoritative source of application data.

There is no remote database.

## Offline-capable

Core application functionality does not depend on an Internet connection.

The application shell is delivered as a PWA and cached through its service worker.

## User-owned data

The collection is stored locally and can be exported as structured JSON or interoperable CSV.

## No account required

There is no login or authentication system.

## No cloud dependency

There is no Supabase, Firebase, PostgreSQL, hosted database, REST backend, or GraphQL backend.

## Honest metadata

Unknown information remains unknown.

The application does not fabricate release information, editions, variants, artwork, or listening history.

## Derived data stays derived

Play counts, last-played dates, rankings, and analytics are calculated from canonical local data rather than maintained as duplicated counters.

## Personal rather than enterprise

This is a personal media registry, not warehouse-management software.

The experience prioritizes:

* browsing
* discovery
* listening
* reflection
* personal ratings
* collection intelligence

over administrative complexity.

---

# Features

## Collection Library

* Complete vinyl catalogue
* Multi-field search
* Search by artist
* Search by title
* Search by genre
* Search by style
* Search by edition
* Search by variant
* Search by label
* Search by catalog number
* Search by release year
* Sorting
* Filtering
* Dynamic filter counts
* Grid and compact library presentation
* Personal ratings
* Collection metadata
* Registration dates

## Record Management

* Add records
* Edit records
* Delete records
* Detailed record view
* Optional pressing information
* Optional edition information
* Optional packaging information
* Purchase information
* Personal notes
* Registry identifiers

Only **Artist + Title** are required to create a record. Everything else is optional.

## Listening Journal

* Log a listening session
* Automatic timestamp
* Optional session rating
* Optional listening context
* Optional listening notes
* Full listening history
* Delete individual listening sessions
* Dynamic play counts
* Dynamic last-played information

## Discovery

Six discovery modes:

1. **Choose for Me**
2. **Blind Pull**
3. **Unplayed**
4. **Fresh Additions**
5. **Genre / Style**
6. **Era / Decade**

Discovery begins with useful behavior even when there is no listening history and becomes more history-aware as real listening data accumulates.

## Analytics

### Collection Intelligence

* Total records
* Unique artists
* Genres
* Styles
* Release decades
* Release-year span
* Rating distribution
* Average personal rating
* Unrated records
* Collection growth

### Listening Intelligence

* Engagement rate
* Played vs. never played
* Total listening sessions
* Average listens per played record
* Average listens per collection record
* Most played
* Least played
* Recently spun
* Never played
* Artist rotation
* Genre rotation
* Weekday patterns
* Time-of-day patterns
* Neglected records
* Highly rated underplayed records
* Frequently played favorites
* Recent rotation

### Time Ranges

Listening analytics support:

* All Time
* Past 30 Days
* Past 90 Days
* This Year

Collection composition remains independent of listening-history filters.

---

# Application Structure

The application's primary architecture is:

```text
                    VINYL COLLECTION REGISTRY
                              │
             ┌────────────────┼────────────────┐
             │                │                │
          LIBRARY          DISCOVER         WISHLIST
             │                │                │
             └────────────────┼────────────────┘
                              │
                         ANALYTICS
                              │
                    ┌─────────┴─────────┐
                    │                   │
             Collection Data       Listen Logs
                    │                   │
                    └─────────┬─────────┘
                              │
                         IndexedDB
                              │
                     Local Application
                              │
                         PWA Shell
```

The fundamental data flow is:

```text
User
 ↓
Application
 ↓
IndexedDB
 ↓
Derived engines
 ↓
UI
```

There is intentionally no:

```text
Application
 ↓
Cloud API
 ↓
Remote database
```

in the core architecture.

---

# Library

The Library is the authoritative representation of the physical collection.

## Search

Search operates across multiple relevant metadata fields.

Supported search information includes:

* Artist
* Title
* Genre
* Style
* Edition
* Variant
* Label
* Catalog Number
* Release Year

## Sorting

Records can be sorted by:

* Artist
* Title
* Release Year
* Date Added
* Personal Rating
* Play Count
* Last Played

## Filtering

The Library supports dynamic filtering for relevant collection attributes, including:

* status
* special editions
* rating
* format
* genre
* release decade

Filter options are generated from actual collection data rather than being permanently hardcoded.

---

# Record Details

Record details are organized into several conceptual areas.

## Overview

The core identity and visual presentation of the record.

## Edition & Record Details

Optional physical and release information such as:

* Edition
* Variant
* Format
* Disc count
* RPM
* Label
* Country
* Catalog number
* Packaging extras
* Discogs ID

## Personal

Personal information such as:

* Personal rating
* Notes
* Purchase price
* Purchase date

## Listening History

A record's listening history includes:

* Total sessions
* Last listened
* Individual sessions
* Session ratings
* Context
* Notes
* Exact timestamps

## Registry Metadata

Technical registry information such as:

* Stable record ID
* Added timestamp
* Updated timestamp

---

# Listening History

Listening sessions are stored independently from the record itself.

A listening log contains:

```text
id
recordId
listenedAt
rating
note
context
```

This is intentional.

The application does **not** store a manually incremented `playCount` on the record as the source of truth.

Instead:

```text
Listen Logs
    ↓
Derived Metrics
    ↓
Play Count
Last Played
Rotation
Rankings
Analytics
```

This prevents stale statistics.

If a listening session is deleted, all dependent metrics update automatically.

---

# Catalogue Rating vs. Session Rating

These are deliberately different concepts.

## Personal Rating

The record-level rating represents your overall opinion of the record.

Range:

```text
0.5 – 5.0
```

in half-star increments.

## Session Rating

A listening-session rating describes that particular listening experience.

A great listening session does not necessarily mean the record's overall rating should change.

Likewise, an excellent record can have an ordinary listening session.

---

# Discover

Discover exists primarily to reduce choice paralysis.

It is not intended to be an AI recommendation system.

## Choose for Me

Uses actual local collection metadata and listening state to select a record and provide factual context for the choice.

## Blind Pull

Provides a small random selection from the collection.

## Unplayed

Surfaces records with zero listening sessions.

## Fresh Additions

Surfaces recently registered records.

## Genre / Style

Filters discovery to represented genre/style metadata.

## Era / Decade

Filters discovery by release period.

## Choose Again

Allows another local selection without requiring an external service.

---

# Cold-Start Behavior

The application does not require a history of listening sessions to be useful.

With zero listening history:

* collection analytics still work
* discovery still works
* unplayed records are meaningful
* collection metadata remains available
* listening analytics show honest empty states
* no fake listening data is generated

As actual listening sessions accumulate, history-aware discovery and analytics become increasingly useful.

---

# Analytics

Analytics are intentionally divided into two categories.

## Collection Intelligence

This describes **what the collection is**.

Examples:

* size
* artist diversity
* genre/style distribution
* decade representation
* release-year range
* ratings
* metadata completeness

## Listening Intelligence

This describes **how the collection is actually being used**.

Examples:

* engagement
* listening frequency
* rotation
* most-played records
* recently played records
* neglected records
* temporal patterns
* favorite/underplayed relationships

This distinction prevents collection composition from being confused with listening behavior.

---

# Registry Health

Registry Health measures metadata completeness.

It is not a quality score for the music.

It is a measure of how completely the registry describes the physical collection.

Weighted fields include:

| Field          | Weight |
| -------------- | -----: |
| Artist         |      2 |
| Title          |      2 |
| Release Year   |    1.5 |
| Genre          |    1.5 |
| Format         |      1 |
| Label          |      1 |
| Edition        |      1 |
| Variant        |      1 |
| Catalog Number |    0.5 |

The resulting metric is presented as a:

**Catalog Health Score — metadata fidelity**

---

# Wishlist

The Wishlist is intentionally separate from owned collection data.

Wishlist items can contain:

* Artist
* Title
* Desired Edition
* Target Price
* Priority
* Notes
* Discogs ID
* Added timestamp
* Updated timestamp

Priority levels:

* High
* Medium
* Low

Wishlist records do not count toward the owned collection until acquired.

---

# Acquisition

The acquisition workflow allows a wishlist item to become a collection record.

Relevant information can be carried forward, including:

* Artist
* Title
* Desired edition
* Target price
* Notes

The acquisition process can then add collection-specific information such as:

* Format
* Release year
* Label
* Edition
* Variant
* Purchase price
* Purchase date

The resulting collection record receives its own stable identity and registry timestamps.

The wishlist item is removed after acquisition to avoid duplicate state.

---

# Artwork

Album artwork intentionally does **not** depend on an external metadata service.

When a record has no supplied `coverImage`, the application generates a deterministic vinyl sleeve locally.

The artwork system uses:

* artist/title-derived hashing
* curated earthy palettes
* CSS gradients
* local SVG elements
* vinyl-groove visuals
* local vector icons

This provides every record with a stable visual identity while maintaining offline operation.

## Why There Is No Discogs Artwork

Discogs integration was deliberately excluded from the MVP.

The application may store an optional:

```text
discogsId
```

but this is only a passive reference.

It does not:

* contact Discogs
* retrieve metadata
* download artwork
* retrieve market values
* require an API key
* require Internet access

This is an intentional architectural decision.

---

# Data Architecture

The authoritative runtime database is:

```text
vinyl_collection_db
```

The primary object stores are:

```text
albums
listenLogs
wishlist
metadata
```

## Album

The current record model supports fields including:

```text
id
artist
title
releaseYear
genres
styles
label
country
format
edition
variant
packagingExtras
discCount
rpm
catalogNumber
discogsId
coverImage
purchasePrice
purchaseDate
personalRating
notes
addedAt
updatedAt
```

Most metadata is optional.

The minimum meaningful record identity is:

```text
Artist + Title
```

---

# Data Ownership

The application's data ownership model is deliberately simple:

```text
IndexedDB = Canonical Source of Truth
```

Play counts, last-played dates, rankings, and analytics are derived from the canonical records and listening logs.

There is no remote master copy.

There is no synchronization daemon.

There is no cloud database.

---

# Backup & Restore

JSON is the application's canonical full-fidelity backup format.

A backup contains:

* schema version
* export timestamp
* application version
* albums
* listening logs
* wishlist
* application settings where applicable

## Replace All

Replaces the local dataset with the validated backup.

## Merge

Merges validated backup data with the existing local dataset.

## Import Validation

Before modifying the local database, imported data is validated for:

* structure
* schema version
* required identifiers
* field types
* rating ranges
* listening-log references
* referential integrity

Invalid imports should be rejected without partially mutating the database.

---

# CSV Export

CSV is provided for interoperability.

It is **not** the canonical application data format.

Records can be exported with information including:

* ID
* Artist
* Title
* Release Year
* Genre
* Style
* Format
* Edition
* Variant
* Label
* Country
* Catalog Number
* Discogs ID
* Personal Rating
* Play Count
* Last Played
* Purchase Price
* Purchase Date
* Notes
* Added Date

Listening history and Wishlist data can also be exported.

Multi-value fields use semicolon-separated values.

JSON should be used when the goal is complete application-state recovery.

CSV should be used when the goal is interoperability with spreadsheets or other tools.

---

# Offline Architecture

The application is a Progressive Web App.

The PWA configuration uses `vite-plugin-pwa` with an automatically updating service worker and precaching for core application resources.

The production PWA caches application resources including:

* JavaScript
* CSS
* HTML
* icons
* PNG assets
* SVG assets
* font resources

The application also defines cache-first handling for Google Fonts resources.

The application shell and user database have separate responsibilities:

```text
Service Worker
       ↓
Application Resources

IndexedDB
       ↓
User Data
```

The service worker is not the collection database.

IndexedDB is.

---

# Installing on iPhone

## Recommended Method: Safari

The intended iPhone installation method is through **Safari**.

Apple supports adding a website to the iPhone Home Screen and opening it as a web app.

### 1. Open the deployed Registry

On your iPhone, open **Safari** and navigate to the deployed Vinyl Collection Registry URL.

For example:

```text
https://your-deployed-vinyl-registry-url.example
```

Use the actual deployment URL for your installation.

### 2. Open Safari's Share menu

Tap Safari's **Share** button.

### 3. Choose "Add to Home Screen"

Scroll through the Share Sheet and select:

**Add to Home Screen**

If the option isn't visible:

1. Scroll to the bottom of the Share Sheet.
2. Tap **Edit Actions**.
3. Add **Add to Home Screen**.
4. Return to the Share Sheet.

### 4. Enable Web App mode

On the Add to Home Screen screen, enable:

**Open as Web App**

Then tap:

**Add**

### 5. Launch Vinyl Registry

The Registry should now appear on your iPhone Home Screen.

Launch it from the Home Screen icon.

This provides the intended app-like PWA experience.

---

# iPhone Installation Best Practice

Install the application while connected to the Internet and allow the application to load completely before installing it.

Then:

1. Launch it from the Home Screen.
2. Browse Library.
3. Open a record.
4. Open Discover.
5. Open Analytics.
6. Open Wishlist.
7. Verify your data.
8. Test offline behavior.

This gives the browser an opportunity to establish its application cache before the first offline session.

---

# Using the App Offline

The core application is designed to remain functional without Internet access.

Offline-capable functionality includes:

* Library
* Search
* Filtering
* Sorting
* Record details
* Add/edit/delete
* Listening logs
* Listening history
* Discover
* Analytics
* Registry Health
* Wishlist
* Acquisition
* JSON export
* JSON import
* CSV export
* Local artwork

The core application does not need to contact:

* Discogs
* Gemini
* a cloud database
* an authentication server
* a remote analytics service

to perform these operations.

---

# Moving the Collection to Another Device

Because the application is local-first, devices do **not** automatically synchronize.

For example:

```text
iPhone
   │
   │ Export JSON
   ▼
Backup File
   │
   │ Transfer
   ▼
New Device
   │
   │ Import JSON
   ▼
Local IndexedDB
```

This is intentional.

The application does not maintain a cloud copy of the collection.

---

# Privacy

Vinyl Collection Registry is designed around local data ownership.

The finished application does not require:

* accounts
* authentication
* cloud storage
* remote collection databases
* remote listening-history storage
* telemetry
* Gemini runtime access
* Discogs runtime access

Your collection, ratings, notes, listening history, and wishlist are intended to remain local to the device.

The application can therefore function without transmitting collection data to a central service.

---

# What This App Does Not Do

Several exclusions are intentional.

## No Discogs Integration

There is no live Discogs API.

`discogsId` is passive metadata only.

## No Gemini

The application does not use Gemini or generative AI at runtime.

AI-assisted development of the source code does not make the finished application dependent on AI.

## No Cloud Database

There is no:

* Supabase
* Firebase
* PostgreSQL
* hosted database
* REST backend
* GraphQL backend

## No Authentication

There is no account system.

## No Remote Analytics

Listening behavior is not sent to an analytics platform.

## No Barcode / Camera Scanning

Barcode scanning and camera-based record identification are outside the MVP.

## No Condition Grading

The application does not attempt to formalize media or sleeve condition.

## No Shelf Mapping

The application does not require mapping records to physical shelves or storage locations.

## No Persistent Now Playing System

This is a collection registry and listening journal, not a music player.

## No Live Market Valuation

Purchase price can be recorded.

Real-time market valuation is intentionally outside the MVP.

---

# Technology Stack

The project currently uses:

* **React 19**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Lucide React**
* **Motion**
* **IndexedDB**
* **vite-plugin-pwa**
* **Workbox through vite-plugin-pwa**

The repository's current package configuration also contains development/runtime packages inherited from the AI Studio environment, including `@google/genai`, Express, and dotenv. They are not part of the application's intended runtime architecture.

The application itself does not use Gemini or a server backend.

---

# Repository Structure

The repository currently contains the primary application source under `src/`, with supporting public assets, scripts, configuration, and package metadata.

The application is organized conceptually around:

```text
src/
├── components/
│   ├── VinylArtwork.tsx
│   ├── RecordDetailModal.tsx
│   ├── AddEditRecordModal.tsx
│   ├── LogListenModal.tsx
│   └── ...
│
├── engines/
│   ├── analyticsEngine.ts
│   ├── discoveryEngine.ts
│   └── ...
│
├── services/
│   └── db.ts
│
├── hooks/
│   └── useVinylData.ts
│
├── views/
│   ├── LibraryView.tsx
│   ├── DiscoverView.tsx
│   ├── AnalyticsView.tsx
│   ├── WishlistView.tsx
│   └── ...
│
├── data/
│   └── seedCatalogue.ts
│
└── types.ts
```

The repository also contains:

```text
public/
scripts/
.env.example
.gitignore
bun.lock
index.html
metadata.json
package.json
tsconfig.json
vite.config.ts
```

---

# Development

## Requirements

A current Node.js installation and npm-compatible environment are sufficient for the repository's standard development scripts.

Clone the repository:

```bash
git clone https://github.com/Infinitive/Vinyl-Registry.git
```

Enter the repository:

```bash
cd Vinyl-Registry
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The repository's Vite development script runs on port `3000` and listens on `0.0.0.0`.

---

# Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The production build is the appropriate environment for evaluating final PWA behavior.

---

# Linting / Type Checking

The repository currently defines:

```bash
npm run lint
```

The current `lint` script performs TypeScript checking with:

```text
tsc --noEmit
```

This means it validates the TypeScript project without producing compiled JavaScript output.

---

# PWA Development

PWA behavior is configured through `vite-plugin-pwa`.

The current configuration:

* generates the PWA manifest
* registers an automatically updating service worker
* precaches core application assets
* includes PWA icons
* configures standalone display
* supports cached font resources
* provides development PWA support

The application manifest identifies the application as:

**Vinyl Collection Registry**

with the short name:

**VinylReg**.

The HTML document also declares Apple mobile-web-app metadata and an Apple touch icon.

---

# External Network Behavior

The application intentionally has essentially no runtime API architecture.

The current HTML references Google Fonts:

* `fonts.googleapis.com`
* `fonts.gstatic.com`

These are treated as non-core resources, with system font fallbacks available. The PWA configuration also uses cache-first strategies for those font resources.

This means typography may fall back when the fonts are unavailable, but the application itself does not depend on those remote font resources for core functionality.

---

# Data Safety

Because the application is local-first, the browser's local database is the live collection.

That is both a strength and a responsibility.

Clearing site/browser storage can potentially remove local application data.

Possible causes include:

* manually clearing website data
* resetting a browser
* resetting a device
* removing application storage
* destructive browser-storage operations

Therefore:

> **Maintain regular JSON backups.**

The recommended backup sequence is:

```text
Make Collection Changes
        ↓
Export JSON
        ↓
Keep Backup
        ↓
Continue Using App
```

Before major application updates:

```text
Export JSON
        ↓
Update Application
        ↓
Verify Collection
        ↓
Continue
```

---

# Troubleshooting

## The app doesn't work offline

First confirm that you have opened the production application successfully while online.

Then:

1. Close the application.
2. Reopen it.
3. Verify it works online.
4. Disable Wi-Fi/cellular data.
5. Launch it again.

If necessary, inspect the browser's service-worker and site-storage state.

---

## My records disappeared

Do **not** immediately clear browser data or reinstall the application.

First determine whether the browser's site storage was deleted.

If you have a JSON backup:

1. Open Vinyl Collection Registry.
2. Open the application's data/settings controls.
3. Select JSON restore/import.
4. Allow validation to complete.
5. Choose Merge or Replace All as appropriate.
6. Verify the restored collection.

---

## Why don't I have real album covers?

This is intentional.

The application does not depend on Discogs or another artwork provider.

Records without a supplied cover image receive deterministic locally generated vinyl sleeves.

This keeps the interface visually rich while preserving offline independence.

---

## I entered a Discogs ID and nothing happened

That is expected.

The `discogsId` field is a passive reference.

The application does not:

* search Discogs
* retrieve metadata
* retrieve artwork
* retrieve pricing
* synchronize releases

---

## The fonts look different offline

The application uses Google Fonts when available, but the fonts are not the source of truth for the application.

The HTML provides normal system-font fallbacks, and the PWA caches Google Fonts resources when available.

Therefore:

> Different typography while completely offline does not mean the application is broken.

---

## My records aren't automatically appearing on another device

This is expected.

There is no cloud synchronization.

Each device has its own local IndexedDB database.

Use JSON export/import to move the collection.

---

# Architecture Principles

Future development should preserve the following rules.

## 1. IndexedDB remains canonical

Do not introduce a remote database unless the project's fundamental architecture is intentionally changed.

## 2. Listening logs remain canonical for listening history

Do not introduce manually maintained play counters.

## 3. Derived metrics remain derived

`playCount`, `lastPlayed`, rankings, and analytics should continue to be calculated from canonical data.

## 4. Discogs remains passive metadata

Do not convert `discogsId` into an API dependency.

## 5. Artwork must remain offline-safe

External artwork should never become necessary for core application functionality.

## 6. Gemini remains absent from runtime architecture

The finished application should not require an AI API to function.

## 7. No cloud backend

Core functionality should remain usable without a backend.

## 8. JSON remains the full-fidelity backup

CSV remains an interoperability format.

## 9. Unknown data remains unknown

Do not fabricate missing metadata.

## 10. Stable IDs remain stable

Record and listening-log IDs should not change during ordinary edits or backup/restore operations.

## 11. Preserve referential integrity

Deleting a record must appropriately handle its associated listening history.

## 12. Avoid unnecessary feature creep

The Registry should not gradually become:

* a streaming service
* a social network
* a marketplace
* a Discogs clone
* a cloud synchronization platform
* an AI recommendation platform

unless that is an intentional future change in product direction.

---

# Project Status

## MVP — COMPLETE

The MVP is considered complete.

| System                     | Status                  |
| -------------------------- | ----------------------- |
| Local IndexedDB database   | ✅ Complete              |
| Collection Library         | ✅ Complete              |
| Record management          | ✅ Complete              |
| Record detail              | ✅ Complete              |
| Personal ratings           | ✅ Complete              |
| Listening history          | ✅ Complete              |
| Discovery                  | ✅ Complete              |
| Collection analytics       | ✅ Complete              |
| Listening analytics        | ✅ Complete              |
| Registry Health            | ✅ Complete              |
| Wishlist                   | ✅ Complete              |
| Acquisition workflow       | ✅ Complete              |
| JSON backup/restore        | ✅ Complete              |
| CSV export                 | ✅ Complete              |
| PWA                        | ✅ Complete              |
| Offline architecture       | ✅ Confirmed             |
| Mobile UX                  | ✅ Complete              |
| Accessibility hardening    | ✅ Complete              |
| External dependency audit  | ✅ Complete              |
| Discogs integration        | 🚫 Intentionally absent |
| Gemini runtime integration | 🚫 Intentionally absent |
| Cloud backend              | 🚫 Intentionally absent |

### Final Architectural Verdict

> **GREEN — ARCHITECTURE CONFIRMED**

The application is intentionally:

* local-first
* offline-capable
* self-contained
* privacy-oriented
* portable
* dependency-light at runtime
* independent of Discogs
* independent of Gemini
* independent of cloud databases

---

# Long-Term Philosophy

The vinyl records themselves are physical objects.

The Registry exists to preserve the information and experience surrounding those objects.

The collection represents what you own.

Listening history represents how you interact with it.

Ratings represent personal judgment.

Discovery helps you decide what comes next.

Analytics reveal patterns you might otherwise miss.

The Wishlist represents future intent.

The backup system protects the accumulated record of all of it.

The application therefore isn't simply an inventory.

It is a **long-term personal archive of a physical collection and the relationship with that collection over time.**

Its most important architectural property is also its simplest:

> **The collection belongs to the collector — not to a cloud service, metadata provider, or application vendor.**

---

# License

This repository does not currently define a project license.

If the repository is intended for public reuse, add an explicit license before representing the project as open source.

Until then, the repository should be treated according to the copyright and usage rights of its owner.

---

## Quick Start

For users who don't need the technical documentation:

### Install on iPhone

1. Open the deployed Vinyl Collection Registry in **Safari**.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Enable **Open as Web App**.
5. Tap **Add**.
6. Launch **VinylReg** from your Home Screen.

### Protect your collection

Periodically:

**Settings/Data → Export JSON**

Keep the resulting JSON backup somewhere safe.

### Remember

Your collection is stored locally.

There is no automatic cloud synchronization.

Your JSON backup is your portable, full-fidelity copy of the registry.

---

## Repository

**GitHub:** https://github.com/Infinitive/Vinyl-Registry

**Default branch:** `main`

**Project:** Vinyl Collection Registry
