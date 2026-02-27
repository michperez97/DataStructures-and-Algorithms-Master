// ─── COT4400 Course Definition ──────────────────────────────────────
// Fixed course + module + assessment IDs for Professor Cobo's
// Design and Analysis of Algorithms course at MDC, Spring 2026.

export const COT4400_COURSE_ID = "00000000-0000-4000-a000-cot440000001";

// ─── Assessment IDs ─────────────────────────────────────────────────

export const ASSESSMENT_IDS = {
  quiz1: "00000000-0000-4000-a000-cot4400a0001",
  quiz2: "00000000-0000-4000-a000-cot4400a0002",
  quiz3: "00000000-0000-4000-a000-cot4400a0003",
  quiz4: "00000000-0000-4000-a000-cot4400a0004",
  quiz5: "00000000-0000-4000-a000-cot4400a0005",
  midterm: "00000000-0000-4000-a000-cot4400a0006",
  final: "00000000-0000-4000-a000-cot4400a0007",
} as const;

// ─── Module IDs (one per week) ──────────────────────────────────────

function weekModuleId(week: number): string {
  return `00000000-0000-4000-a000-cot4400w${String(week).padStart(4, "0")}`;
}

// ─── Types ──────────────────────────────────────────────────────────

export interface WeekDefinition {
  weekNumber: number;
  moduleId: string;
  name: string;
  topics: string;
  topicTags: string[];
  assessmentRefs: string[];
}

export interface AssessmentDefinition {
  assessmentId: string;
  name: string;
  type: "Quiz" | "Exam";
  week: number;
  topicTags: string[];
  format: {
    questionCount: number;
    pointsEach?: number;
    totalPoints?: number;
    timeMinutes: number;
    instructions: string;
  };
}

// ─── Topic Tag → DSA Taxonomy Slug ──────────────────────────────────
// Maps the PascalCase week/assessment topicTags to the kebab-case
// slugs used by the topic-explorer knowledge graph.

export const TOPIC_TAG_TO_SLUG: Record<string, string> = {
  BigO: "big-o-notation",
  BigOmegaTheta: "big-omega-theta",
  TimeComplexity: "time-complexity",
  DivideAndConquer: "divide-conquer-intro",
  MasterTheorem: "master-theorem",
  HashTableFundamentals: "hash-table-fundamentals",
  CollisionResolution: "collision-resolution",
  HashFunctions: "hash-functions",
  SelectionSort: "selection-sort",
  InsertionSort: "insertion-sort",
  BubbleSort: "bubble-sort",
  MergeSort: "merge-sort",
  QuickSort: "quick-sort",
  CountingSort: "counting-sort",
  RadixSort: "radix-sort",
  BinarySearchTrees: "binary-search-trees",
  TreeTraversals: "tree-traversals",
  AVLTrees: "avl-trees",
  GraphRepresentations: "graph-representations",
  BFS: "bfs",
  DFS: "dfs",
  ShortestPath: "dijkstras-algorithm",
  MinimumSpanningTree: "minimum-spanning-tree-concepts",
};

// ─── 16 Week Schedule ───────────────────────────────────────────────

export const COT4400_WEEKS: WeekDefinition[] = [
  {
    weekNumber: 1,
    moduleId: weekModuleId(1),
    name: "Course Introduction & Algorithm Analysis Basics",
    topics: "Syllabus, what is an algorithm, RAM model, primitive operations",
    topicTags: ["BigO"],
    assessmentRefs: [],
  },
  {
    weekNumber: 2,
    moduleId: weekModuleId(2),
    name: "Asymptotic Complexity",
    topics: "Big-O, Big-Omega, Big-Theta, loop analysis, step counting",
    topicTags: ["BigO", "BigOmegaTheta", "TimeComplexity"],
    assessmentRefs: [ASSESSMENT_IDS.quiz1],
  },
  {
    weekNumber: 3,
    moduleId: weekModuleId(3),
    name: "Back Substitution — Decreasing",
    topics: "Recurrence relations, back substitution for T(n-1) patterns",
    topicTags: ["BigO", "TimeComplexity"],
    assessmentRefs: [ASSESSMENT_IDS.quiz2],
  },
  {
    weekNumber: 4,
    moduleId: weekModuleId(4),
    name: "Back Substitution — Dividing",
    topics: "Back substitution for T(n/2) patterns, non-standard base cases",
    topicTags: ["BigO", "TimeComplexity", "DivideAndConquer"],
    assessmentRefs: [ASSESSMENT_IDS.quiz3],
  },
  {
    weekNumber: 5,
    moduleId: weekModuleId(5),
    name: "Master Theorem Introduction",
    topics: "Master Theorem statement, three cases, a/b/k identification",
    topicTags: ["MasterTheorem", "DivideAndConquer"],
    assessmentRefs: [],
  },
  {
    weekNumber: 6,
    moduleId: weekModuleId(6),
    name: "Master Theorem Applications",
    topics: "Applying Master Theorem to recurrences, edge cases, subcases",
    topicTags: ["MasterTheorem", "DivideAndConquer"],
    assessmentRefs: [ASSESSMENT_IDS.quiz4],
  },
  {
    weekNumber: 7,
    moduleId: weekModuleId(7),
    name: "Hashing",
    topics: "Hash functions, chaining, linear probing, rehashing, universal hashing",
    topicTags: ["HashTableFundamentals", "CollisionResolution", "HashFunctions"],
    assessmentRefs: [ASSESSMENT_IDS.quiz5],
  },
  {
    weekNumber: 8,
    moduleId: weekModuleId(8),
    name: "Midterm Review & Exam",
    topics: "Comprehensive review: complexity, recurrences, Master Theorem, hashing",
    topicTags: [
      "BigO",
      "TimeComplexity",
      "MasterTheorem",
      "HashTableFundamentals",
      "CollisionResolution",
    ],
    assessmentRefs: [ASSESSMENT_IDS.midterm],
  },
  {
    weekNumber: 9,
    moduleId: weekModuleId(9),
    name: "Sorting — Elementary",
    topics: "Selection sort, insertion sort, bubble sort, stability",
    topicTags: ["SelectionSort", "InsertionSort", "BubbleSort"],
    assessmentRefs: [],
  },
  {
    weekNumber: 10,
    moduleId: weekModuleId(10),
    name: "Sorting — Efficient",
    topics: "Merge sort, quicksort, analysis using recurrences",
    topicTags: ["MergeSort", "QuickSort"],
    assessmentRefs: [],
  },
  {
    weekNumber: 11,
    moduleId: weekModuleId(11),
    name: "Sorting — Linear Time",
    topics: "Counting sort, radix sort, lower bounds on comparison sorting",
    topicTags: ["CountingSort", "RadixSort"],
    assessmentRefs: [],
  },
  {
    weekNumber: 12,
    moduleId: weekModuleId(12),
    name: "Trees & Binary Search Trees",
    topics: "BST operations, traversals, analysis",
    topicTags: ["BinarySearchTrees", "TreeTraversals"],
    assessmentRefs: [],
  },
  {
    weekNumber: 13,
    moduleId: weekModuleId(13),
    name: "Balanced Trees",
    topics: "AVL trees, rotations, height analysis",
    topicTags: ["AVLTrees"],
    assessmentRefs: [],
  },
  {
    weekNumber: 14,
    moduleId: weekModuleId(14),
    name: "Graphs — Basics",
    topics: "Graph representations, BFS, DFS",
    topicTags: ["GraphRepresentations", "BFS", "DFS"],
    assessmentRefs: [],
  },
  {
    weekNumber: 15,
    moduleId: weekModuleId(15),
    name: "Graphs — Applications",
    topics: "Shortest paths, minimum spanning trees",
    topicTags: ["ShortestPath", "MinimumSpanningTree"],
    assessmentRefs: [],
  },
  {
    weekNumber: 16,
    moduleId: weekModuleId(16),
    name: "Final Review & Exam",
    topics: "Comprehensive review of all course material",
    topicTags: [
      "BigO",
      "MasterTheorem",
      "HashTableFundamentals",
      "MergeSort",
      "QuickSort",
      "BinarySearchTrees",
      "AVLTrees",
      "BFS",
      "DFS",
    ],
    assessmentRefs: [ASSESSMENT_IDS.final],
  },
];

// ─── 7 Assessments ──────────────────────────────────────────────────

export const COT4400_ASSESSMENTS: AssessmentDefinition[] = [
  {
    assessmentId: ASSESSMENT_IDS.quiz1,
    name: "Quiz 1 — Asymptotic Complexity",
    type: "Quiz",
    week: 2,
    topicTags: ["BigO", "BigOmegaTheta", "TimeComplexity"],
    format: {
      questionCount: 5,
      pointsEach: 20,
      timeMinutes: 30,
      instructions:
        "All questions are 20 pts. You must show your work. Just writing down the asymptotic complexity is not sufficient.",
    },
  },
  {
    assessmentId: ASSESSMENT_IDS.quiz2,
    name: "Quiz 2 — Back Substitution (Decreasing)",
    type: "Quiz",
    week: 3,
    topicTags: ["BigO", "TimeComplexity"],
    format: {
      questionCount: 3,
      pointsEach: 20,
      timeMinutes: 30,
      instructions:
        "Solve the following recurrence relations using back substitution. You must show the expansion down three levels, then what happens at the kth level, and finally solving when k = n, just like I showed you in class.",
    },
  },
  {
    assessmentId: ASSESSMENT_IDS.quiz3,
    name: "Quiz 3 — Back Substitution (Dividing)",
    type: "Quiz",
    week: 4,
    topicTags: ["BigO", "TimeComplexity", "DivideAndConquer"],
    format: {
      questionCount: 1,
      pointsEach: 50,
      timeMinutes: 30,
      instructions:
        "Solve the following recurrence relation using back substitution. You must show the expansion down three levels, then what happens at the kth level, and finally solving when k = n. Don't simplify the equation you get when you solve the recurrence. Please note the base case.",
    },
  },
  {
    assessmentId: ASSESSMENT_IDS.quiz4,
    name: "Quiz 4 — Master Theorem",
    type: "Quiz",
    week: 6,
    topicTags: ["MasterTheorem", "DivideAndConquer"],
    format: {
      questionCount: 4,
      timeMinutes: 30,
      instructions:
        "You must show values obtained for a, b, and k. And you must state which case and subcase you used.",
    },
  },
  {
    assessmentId: ASSESSMENT_IDS.quiz5,
    name: "Quiz 5 — Hashing",
    type: "Quiz",
    week: 7,
    topicTags: ["HashTableFundamentals", "CollisionResolution", "HashFunctions"],
    format: {
      questionCount: 3,
      timeMinutes: 30,
      instructions:
        "Show the resulting hash table for each collision resolution method. For rehashing, choose a table size that is at least twice as large and prime.",
    },
  },
  {
    assessmentId: ASSESSMENT_IDS.midterm,
    name: "Midterm Exam",
    type: "Exam",
    week: 8,
    topicTags: [
      "BigO",
      "TimeComplexity",
      "MasterTheorem",
      "HashTableFundamentals",
      "CollisionResolution",
      "HashFunctions",
    ],
    format: {
      questionCount: 11,
      totalPoints: 105,
      timeMinutes: 100,
      instructions:
        "Answer in as much detail as you can provide, which requires you to elaborate on your response. Do not be vague, and if you can show proof of your argument in mathematical notation, or a mathematical proof, the better it will be.",
    },
  },
  {
    assessmentId: ASSESSMENT_IDS.final,
    name: "Final Exam",
    type: "Exam",
    week: 16,
    topicTags: [
      "BigO",
      "MasterTheorem",
      "HashTableFundamentals",
      "MergeSort",
      "QuickSort",
      "BinarySearchTrees",
      "AVLTrees",
      "BFS",
      "DFS",
    ],
    format: {
      questionCount: 0,
      timeMinutes: 120,
      instructions: "Comprehensive final exam. Questions will be added as the course progresses.",
    },
  },
];
