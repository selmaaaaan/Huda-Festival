# Backend Route Mapping

This document maps the exact JSON shapes currently expected by the frontend for each route in `src/app/api/*/route.ts`, along with their Prisma model sources.

## 1. `GET /api/announcements`
**Source:** `Announcement` model
**Return Shape:**
```json
[
  {
    "id": "cuid",
    "title": "string",
    "content": "string",
    "type": "string",
    "createdAt": "date-string"
  }
]
```

## 2. `GET /api/candidates`
**Source:** `Candidate` (with `Team`, `Result`, and `Programme`)
**Return Shape:**
```json
[
  {
    "id": "cuid",
    "name": "string",
    "admissionNo": 1234,
    "category": "string",
    "class": "string",
    "points": 10,
    "wins": 2,
    "podiums": 3,
    "team": {
      "code": "string",
      "name": "string",
      "color": "string"
    },
    "results": [
      {
        "id": "cuid",
        "programme": {
          "code": "string",
          "name": "string",
          "type": "string"
        },
        "rank": 1,
        "grade": "A",
        "points": 5
      }
    ]
  }
]
```

## 3. `GET /api/candidates/[id]`
**Source:** `Candidate` (with `Team`, `Result`, and `Programme`)
**Return Shape:** Same as `/api/candidates`, but a single object instead of an array. The `results[].programme` also includes `venue` and `day`.
```json
{
  "id": "cuid",
  "name": "string",
  "admissionNo": 1234,
  "category": "string",
  "class": "string",
  "points": 10,
  "wins": 2,
  "podiums": 3,
  "team": {
    "code": "string",
    "name": "string",
    "color": "string"
  },
  "results": [
    {
      "id": "cuid",
      "programme": {
        "code": "string",
        "name": "string",
        "type": "string",
        "venue": "string",
        "day": 1
      },
      "rank": 1,
      "grade": "A",
      "points": 5
    }
  ]
}
```

## 4. `GET /api/gallery`
**Source:** `GalleryItem`
**Return Shape:**
```json
[
  {
    "id": "cuid",
    "url": "string",
    "caption": "string",
    "width": 800,
    "height": 600,
    "createdAt": "date-string"
  }
]
```

## 5. `GET /api/leaderboard`
**Source:** `Team`, `Candidate`, `Programme`, `Result`
**Return Shape:**
```json
{
  "teamLeaderboard": [
    {
      "rank": 1,
      "id": "cuid",
      "code": "string",
      "name": "string",
      "color": "string",
      "motto": "string",
      "points": 100,
      "members": 20,
      "golds": 5
    }
  ],
  "topIndividuals": [
    {
      "rank": 1,
      "id": "cuid",
      "name": "string",
      "admissionNo": 1234,
      "category": "string",
      "class": "string",
      "points": 50,
      "team": {
        "code": "string",
        "name": "string",
        "color": "string"
      }
    }
  ],
  "topProgrammes": [
    {
      "id": "cuid",
      "code": "string",
      "name": "string",
      "category": "string",
      "type": "string",
      "results": [
         // Full Result objects based on schema...
      ]
    }
  ]
}
```

## 6. `GET /api/programmes`
**Source:** `Programme` (with `Result` count)
**Return Shape:**
```json
[
  {
    "id": "cuid",
    "code": "string",
    "name": "string",
    "category": "string",
    "type": "string",
    "format": "string",
    "quota": 1,
    "groupSize": 1,
    "maxParticipants": 10,
    "description": "string",
    "day": 1,
    "venue": "string",
    "startTime": "date-string",
    "endTime": "date-string",
    "resultCount": 5,
    "isResultPublished": true
  }
]
```

## 7. `GET /api/results`
**Source:** `Result` (with `Candidate`, `Team`, `Programme`)
**Return Shape:**
*(When `programmeId` is passed, returns an array of winners for that programme)*
```json
[
  {
    "id": "cuid",
    "rank": 1,
    "grade": "A",
    "points": 5,
    "candidate": {
      "id": "cuid",
      "name": "string",
      "admissionNo": 1234,
      "team": {
        "code": "string",
        "name": "string",
        "color": "string"
      }
    }
  }
]
```
*(When no `programmeId` is passed, returns results grouped by programme)*
```json
[
  {
    "programme": {
      "id": "cuid",
      "code": "string",
      "name": "string",
      "type": "string",
      "category": "string",
      "venue": "string",
      "day": 1
    },
    "winners": [
      {
        "name": "string",
        "team": "string",
        "teamColor": "string",
        "rank": 1,
        "grade": "A",
        "points": 5,
        "admissionNo": 1234
      }
    ]
  }
]
```

## 8. `GET /api/schedule`
**Source:** `Programme`
**Return Shape:**
```json
{
  "days": [
    { "day": 1, "date": "2026-01-16", "label": "Friday, 16 Jan" },
    { "day": 2, "date": "2026-01-17", "label": "Saturday, 17 Jan" },
    { "day": 3, "date": "2026-01-18", "label": "Sunday, 18 Jan" }
  ],
  "venues": ["Stage 1", "Stage 2"],
  "items": [
    {
      "id": "cuid",
      "code": "string",
      "name": "string",
      "day": 1,
      "venue": "string",
      "startTime": "date-string",
      "endTime": "date-string"
    }
  ]
}
```

## 9. `GET /api/stats`
**Source:** Counts from `Team`, `Programme`, `Candidate`, `Result`, and unique `venue`s.
**Return Shape:**
```json
{
  "teams": 5,
  "programmes": 150,
  "candidates": 600,
  "results": 300,
  "venues": 4,
  "days": 3,
  "dates": ["2026-01-16", "2026-01-17", "2026-01-18"]
}
```
