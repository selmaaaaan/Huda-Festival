module.exports = {
  CATEGORIES: ["BIDĀYAH", "ʾŪLĀ", "THĀNIYAH", "THĀNAWIYYAH", "ʿĀLIYAH", "KULLIYYAH"],

  POSITION_POINTS: {
    individual: { 1: 5, 2: 3, 3: 1 },
    starred:    { 1: 7, 2: 5, 3: 3 },
    group:      { 1: 7, 2: 5, 3: 3 },
    kulliyyah:  { 1: 10, 2: 7, 3: 5 },
  },

  GRADE_POINTS: {
    standard: { A: 5, B: 3, C: 1 },
    starred:  { A: 7, B: 5, C: 3 },
  },

  // Section VI — max individual ARTS items per category, split between stage/non-stage.
  // Group items and Kulliyyah items are NOT counted against these caps.
  CATEGORY_ITEM_LIMITS: {
    "BIDĀYAH":      { total: 12, stage: 4, nonStage: 8 },
    "ʾŪLĀ":         { total: 9,  stage: 4, nonStage: 5 },
    "THĀNIYAH":     { total: 9,  stage: 4, nonStage: 5 },
    "THĀNAWIYYAH":  { total: 10, stage: 4, nonStage: 6 },
    "ʿĀLIYAH":      { total: 9,  stage: 4, nonStage: 5 },
  },

  MINIMUM_PARTICIPATION: {
    minStageItems: 1,
    minNonStageItems: 1,
    // penalty amount/type is not specified numerically in the bylaw document —
    // leave as a manual admin decision, do not invent a number here.
  },

  DUAL_PARTICIPANT_PROGRAMS_NOTE:
    "Conversation and face-to-face programs performed by exactly two participants are " +
    "individual items; earned position and grade points are split equally between the " +
    "two participants.",

  PROCEDURAL_FEES: {
    substitutionFormFee: 10,       // ₹ per substitution form
    lateSubmissionFeePerUnit: 10,  // ₹ per 20-minute block late
    lateSubmissionUnitMinutes: 20,
    appealDeposit: 50,             // ₹, refunded if appeal is upheld, forfeited if not
  },

  DEADLINES_NOTE: {
    codeLetterCollection: "At least 10 minutes before that item's contest begins",
    venueReporting: "At least 30 minutes before scheduled start time",
    appealSubmission: "Within 30 minutes of the event's completion",
    substitutionSubmission: "Immediately after the incident that forced the substitution",
  },

  TIEBREAK_ORDER: [
    "Highest number of First Positions won",
    "Highest total number of A Grades won",
    "Highest cumulative points earned in Stage Items specifically",
    "If still tied: officially declared a Shared Title",
  ],
};
