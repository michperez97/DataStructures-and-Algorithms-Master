import type { KnowledgeNode, KnowledgeEdge } from "@/db/schema";
import { GLOBAL_DSA_MAP_ID } from "./seed-ids";

// ─── Categories ──────────────────────────────────────────────────────

export const DSA_CATEGORIES = [
  "Complexity Analysis",
  "Arrays & Strings",
  "Linked Lists",
  "Stacks & Queues",
  "Hash Tables",
  "Trees",
  "Heaps & Priority Queues",
  "Graphs",
  "Sorting",
  "Searching",
  "Dynamic Programming",
  "Greedy Algorithms",
  "Divide and Conquer",
  "Recursion & Backtracking",
] as const;

export type DSACategory = (typeof DSA_CATEGORIES)[number];

// ─── Topic Definition ────────────────────────────────────────────────

interface TopicDef {
  slug: string;
  title: string;
  category: DSACategory;
  description: string;
}

/** Deterministic nodeId from slug */
function slugToId(slug: string): string {
  // Simple deterministic hash → UUID-shaped string
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `10000000-${hex.slice(0, 4)}-4000-a000-${hex}0000`;
}

// ─── Topic Definitions (~91 topics) ──────────────────────────────────

const TOPIC_DEFS: TopicDef[] = [
  // Complexity Analysis (6)
  { slug: "big-o-notation", title: "Big-O Notation", category: "Complexity Analysis", description: "Upper-bound asymptotic analysis of algorithm running time and space usage." },
  { slug: "big-omega-theta", title: "Big-Omega & Big-Theta", category: "Complexity Analysis", description: "Lower-bound (Omega) and tight-bound (Theta) asymptotic notation." },
  { slug: "time-complexity", title: "Time Complexity", category: "Complexity Analysis", description: "Analyzing how running time scales with input size." },
  { slug: "space-complexity", title: "Space Complexity", category: "Complexity Analysis", description: "Analyzing how memory usage scales with input size." },
  { slug: "amortized-analysis", title: "Amortized Analysis", category: "Complexity Analysis", description: "Average-case analysis over a sequence of operations (e.g., dynamic array resizing)." },
  { slug: "master-theorem", title: "Master Theorem", category: "Complexity Analysis", description: "Solving divide-and-conquer recurrence relations of the form T(n) = aT(n/b) + f(n)." },

  // Arrays & Strings (8)
  { slug: "static-arrays", title: "Static Arrays", category: "Arrays & Strings", description: "Fixed-size contiguous memory blocks with O(1) random access." },
  { slug: "dynamic-arrays", title: "Dynamic Arrays", category: "Arrays & Strings", description: "Resizable arrays (e.g., ArrayList, vector) with amortized O(1) append." },
  { slug: "two-pointer-technique", title: "Two-Pointer Technique", category: "Arrays & Strings", description: "Using two indices to solve problems on sorted arrays or linked structures." },
  { slug: "sliding-window", title: "Sliding Window", category: "Arrays & Strings", description: "Maintaining a window over a contiguous subarray to optimize range queries." },
  { slug: "prefix-sums", title: "Prefix Sums", category: "Arrays & Strings", description: "Precomputing cumulative sums for O(1) range-sum queries." },
  { slug: "string-matching", title: "String Matching", category: "Arrays & Strings", description: "Algorithms for finding patterns within strings (brute force, KMP, Rabin-Karp)." },
  { slug: "matrix-operations", title: "Matrix Operations", category: "Arrays & Strings", description: "2D array traversal, rotation, spiral order, and matrix search techniques." },
  { slug: "kadanes-algorithm", title: "Kadane's Algorithm", category: "Arrays & Strings", description: "Finding the maximum sum contiguous subarray in O(n) time." },

  // Linked Lists (7)
  { slug: "singly-linked-list", title: "Singly Linked List", category: "Linked Lists", description: "Linear data structure where each node points to the next node." },
  { slug: "doubly-linked-list", title: "Doubly Linked List", category: "Linked Lists", description: "Linked list with both forward and backward pointers." },
  { slug: "circular-linked-list", title: "Circular Linked List", category: "Linked Lists", description: "Linked list where the last node points back to the head." },
  { slug: "linked-list-reversal", title: "Linked List Reversal", category: "Linked Lists", description: "Reversing a linked list iteratively and recursively." },
  { slug: "fast-slow-pointers", title: "Fast & Slow Pointers", category: "Linked Lists", description: "Floyd's cycle detection and finding the middle of a linked list." },
  { slug: "merge-linked-lists", title: "Merging Linked Lists", category: "Linked Lists", description: "Merging two sorted linked lists and k-way merge techniques." },
  { slug: "lru-cache", title: "LRU Cache", category: "Linked Lists", description: "Least Recently Used cache using a doubly linked list + hash map." },

  // Stacks & Queues (7)
  { slug: "stack-fundamentals", title: "Stack Fundamentals", category: "Stacks & Queues", description: "LIFO data structure with push, pop, and peek operations." },
  { slug: "queue-fundamentals", title: "Queue Fundamentals", category: "Stacks & Queues", description: "FIFO data structure with enqueue and dequeue operations." },
  { slug: "deque", title: "Deque (Double-Ended Queue)", category: "Stacks & Queues", description: "Queue supporting insertion and removal at both ends." },
  { slug: "monotonic-stack", title: "Monotonic Stack", category: "Stacks & Queues", description: "Stack maintaining monotonically increasing or decreasing order for next-greater/smaller problems." },
  { slug: "expression-evaluation", title: "Expression Evaluation", category: "Stacks & Queues", description: "Evaluating infix, postfix, and prefix expressions using stacks." },
  { slug: "stack-queue-interconversion", title: "Stack ↔ Queue Conversion", category: "Stacks & Queues", description: "Implementing a stack using queues and vice versa." },
  { slug: "circular-queue", title: "Circular Queue", category: "Stacks & Queues", description: "Queue implementation using a circular buffer for fixed-capacity scenarios." },

  // Hash Tables (6)
  { slug: "hash-table-fundamentals", title: "Hash Table Fundamentals", category: "Hash Tables", description: "Key-value storage with O(1) average-case lookups via hashing." },
  { slug: "collision-resolution", title: "Collision Resolution", category: "Hash Tables", description: "Chaining, open addressing, linear probing, and quadratic probing strategies." },
  { slug: "hash-functions", title: "Hash Functions", category: "Hash Tables", description: "Designing good hash functions: distribution, avalanche effect, and common families." },
  { slug: "hash-sets", title: "Hash Sets", category: "Hash Tables", description: "Unordered set backed by a hash table for O(1) membership testing." },
  { slug: "frequency-counting", title: "Frequency Counting", category: "Hash Tables", description: "Using hash maps to count occurrences of elements in a collection." },
  { slug: "two-sum-pattern", title: "Two-Sum Pattern", category: "Hash Tables", description: "Classic hash map pattern for finding pairs that satisfy a target constraint." },

  // Trees (10)
  { slug: "binary-tree-basics", title: "Binary Tree Basics", category: "Trees", description: "Tree where each node has at most two children; terminology and properties." },
  { slug: "tree-traversals", title: "Tree Traversals", category: "Trees", description: "Inorder, preorder, postorder (DFS) and level-order (BFS) traversals." },
  { slug: "binary-search-trees", title: "Binary Search Trees", category: "Trees", description: "BST property, insertion, deletion, search, and in-order successor." },
  { slug: "avl-trees", title: "AVL Trees", category: "Trees", description: "Self-balancing BST with O(log n) guaranteed operations via rotations." },
  { slug: "red-black-trees", title: "Red-Black Trees", category: "Trees", description: "Self-balancing BST with color properties ensuring O(log n) operations." },
  { slug: "tries", title: "Tries (Prefix Trees)", category: "Trees", description: "Tree structure for efficient prefix-based string lookup and autocomplete." },
  { slug: "segment-trees", title: "Segment Trees", category: "Trees", description: "Tree for efficient range queries (sum, min, max) with point updates." },
  { slug: "fenwick-trees", title: "Fenwick Trees (BIT)", category: "Trees", description: "Binary Indexed Tree for efficient prefix sum queries and point updates." },
  { slug: "lowest-common-ancestor", title: "Lowest Common Ancestor", category: "Trees", description: "Finding the LCA of two nodes in a binary tree or BST." },
  { slug: "tree-serialization", title: "Tree Serialization", category: "Trees", description: "Encoding and decoding binary trees to/from string representations." },

  // Heaps & Priority Queues (5)
  { slug: "binary-heap", title: "Binary Heap", category: "Heaps & Priority Queues", description: "Complete binary tree satisfying the heap property (min-heap or max-heap)." },
  { slug: "priority-queue", title: "Priority Queue", category: "Heaps & Priority Queues", description: "Abstract data type where elements are dequeued by priority, typically via heaps." },
  { slug: "heap-sort", title: "Heap Sort", category: "Heaps & Priority Queues", description: "In-place comparison sort using a binary heap; O(n log n) worst case." },
  { slug: "top-k-elements", title: "Top-K Elements", category: "Heaps & Priority Queues", description: "Finding the k largest/smallest elements using heaps or quickselect." },
  { slug: "merge-k-sorted", title: "Merge K Sorted Lists", category: "Heaps & Priority Queues", description: "Using a min-heap to efficiently merge k sorted sequences." },

  // Graphs (10)
  { slug: "graph-representations", title: "Graph Representations", category: "Graphs", description: "Adjacency list, adjacency matrix, and edge list representations." },
  { slug: "bfs", title: "Breadth-First Search", category: "Graphs", description: "Level-by-level graph exploration; shortest path in unweighted graphs." },
  { slug: "dfs", title: "Depth-First Search", category: "Graphs", description: "Recursive/stack-based graph exploration; cycle detection and topological sort." },
  { slug: "dijkstras-algorithm", title: "Dijkstra's Algorithm", category: "Graphs", description: "Shortest path from a single source in graphs with non-negative edge weights." },
  { slug: "bellman-ford", title: "Bellman-Ford Algorithm", category: "Graphs", description: "Single-source shortest path allowing negative edge weights; detects negative cycles." },
  { slug: "topological-sort", title: "Topological Sort", category: "Graphs", description: "Linear ordering of vertices in a DAG such that every edge u→v has u before v." },
  { slug: "union-find", title: "Union-Find (Disjoint Sets)", category: "Graphs", description: "Data structure for tracking connected components with near-O(1) union and find." },
  { slug: "kruskals-algorithm", title: "Kruskal's Algorithm", category: "Graphs", description: "Minimum spanning tree using sorted edges and union-find." },
  { slug: "prims-algorithm", title: "Prim's Algorithm", category: "Graphs", description: "Minimum spanning tree using a priority queue and greedy vertex expansion." },
  { slug: "strongly-connected-components", title: "Strongly Connected Components", category: "Graphs", description: "Tarjan's or Kosaraju's algorithm for finding SCCs in directed graphs." },

  // Sorting (8)
  { slug: "bubble-sort", title: "Bubble Sort", category: "Sorting", description: "Simple comparison sort that repeatedly swaps adjacent out-of-order elements." },
  { slug: "selection-sort", title: "Selection Sort", category: "Sorting", description: "Finds the minimum element and places it in sorted position each iteration." },
  { slug: "insertion-sort", title: "Insertion Sort", category: "Sorting", description: "Builds sorted array one element at a time; efficient for small or nearly-sorted data." },
  { slug: "merge-sort", title: "Merge Sort", category: "Sorting", description: "Divide-and-conquer sort: split, recursively sort, merge; O(n log n) stable sort." },
  { slug: "quick-sort", title: "Quick Sort", category: "Sorting", description: "Divide-and-conquer with pivot partitioning; O(n log n) average, O(n²) worst case." },
  { slug: "counting-sort", title: "Counting Sort", category: "Sorting", description: "Non-comparison integer sort using frequency counting; O(n + k) time." },
  { slug: "radix-sort", title: "Radix Sort", category: "Sorting", description: "Sorts integers digit-by-digit using a stable sub-sort; O(d(n + k)) time." },
  { slug: "sorting-lower-bound", title: "Sorting Lower Bound", category: "Sorting", description: "Proof that comparison-based sorting requires Ω(n log n) comparisons." },

  // Searching (5)
  { slug: "linear-search", title: "Linear Search", category: "Searching", description: "Sequential scan; O(n) time, works on unsorted data." },
  { slug: "binary-search", title: "Binary Search", category: "Searching", description: "Divide-and-conquer search on sorted arrays; O(log n) time." },
  { slug: "binary-search-variants", title: "Binary Search Variants", category: "Searching", description: "Lower bound, upper bound, search-on-answer, and rotated array search." },
  { slug: "interpolation-search", title: "Interpolation Search", category: "Searching", description: "Improved binary search for uniformly distributed data; O(log log n) average." },
  { slug: "ternary-search", title: "Ternary Search", category: "Searching", description: "Search for a maximum or minimum of a unimodal function." },

  // Dynamic Programming (9)
  { slug: "dp-introduction", title: "DP Introduction", category: "Dynamic Programming", description: "Overlapping subproblems and optimal substructure; memoization vs tabulation." },
  { slug: "fibonacci-dp", title: "Fibonacci & Climbing Stairs", category: "Dynamic Programming", description: "Classic 1D DP problems: Fibonacci sequence, staircase variations." },
  { slug: "knapsack-01", title: "0/1 Knapsack", category: "Dynamic Programming", description: "Select items to maximize value without exceeding a weight capacity." },
  { slug: "longest-common-subsequence", title: "Longest Common Subsequence", category: "Dynamic Programming", description: "Finding the longest subsequence common to two strings; 2D DP." },
  { slug: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", category: "Dynamic Programming", description: "Finding the longest strictly increasing subsequence; O(n log n) with patience sorting." },
  { slug: "edit-distance", title: "Edit Distance", category: "Dynamic Programming", description: "Minimum insertions, deletions, and substitutions to transform one string into another." },
  { slug: "coin-change", title: "Coin Change", category: "Dynamic Programming", description: "Minimum coins to make a target amount; unbounded knapsack variant." },
  { slug: "matrix-chain-multiplication", title: "Matrix Chain Multiplication", category: "Dynamic Programming", description: "Optimal parenthesization for minimizing scalar multiplications." },
  { slug: "dp-on-trees", title: "DP on Trees", category: "Dynamic Programming", description: "Dynamic programming where subproblems are defined on subtrees." },

  // Greedy Algorithms (6)
  { slug: "greedy-introduction", title: "Greedy Introduction", category: "Greedy Algorithms", description: "Making locally optimal choices at each step; when greedy works and proving correctness." },
  { slug: "activity-selection", title: "Activity Selection", category: "Greedy Algorithms", description: "Selecting the maximum number of non-overlapping intervals." },
  { slug: "huffman-coding", title: "Huffman Coding", category: "Greedy Algorithms", description: "Optimal prefix-free encoding using a greedy bottom-up tree construction." },
  { slug: "fractional-knapsack", title: "Fractional Knapsack", category: "Greedy Algorithms", description: "Greedy approach when items can be split; sort by value-to-weight ratio." },
  { slug: "interval-scheduling", title: "Interval Scheduling", category: "Greedy Algorithms", description: "Scheduling problems: minimize lateness, maximize non-overlapping, merge intervals." },
  { slug: "minimum-spanning-tree-concepts", title: "MST Concepts", category: "Greedy Algorithms", description: "Cut property, cycle property, and why greedy works for MST algorithms." },

  // Divide and Conquer (4)
  { slug: "divide-conquer-intro", title: "Divide & Conquer Introduction", category: "Divide and Conquer", description: "Breaking problems into smaller subproblems, solving recursively, and combining results." },
  { slug: "merge-sort-analysis", title: "Merge Sort Analysis", category: "Divide and Conquer", description: "Detailed recurrence analysis and proof of O(n log n) for merge sort." },
  { slug: "closest-pair", title: "Closest Pair of Points", category: "Divide and Conquer", description: "Finding the closest pair in a 2D point set in O(n log n)." },
  { slug: "strassens-algorithm", title: "Strassen's Algorithm", category: "Divide and Conquer", description: "Matrix multiplication in O(n^2.81) using divide and conquer." },

  // Recursion & Backtracking (5)
  { slug: "recursion-basics", title: "Recursion Basics", category: "Recursion & Backtracking", description: "Base cases, recursive cases, call stack behavior, and stack overflow prevention." },
  { slug: "backtracking-framework", title: "Backtracking Framework", category: "Recursion & Backtracking", description: "Systematic search with constraint checking and pruning: choose, explore, unchoose." },
  { slug: "n-queens", title: "N-Queens Problem", category: "Recursion & Backtracking", description: "Place N queens on an N×N board such that no two attack each other." },
  { slug: "subset-generation", title: "Subset & Permutation Generation", category: "Recursion & Backtracking", description: "Generating all subsets, permutations, and combinations via recursion." },
  { slug: "sudoku-solver", title: "Sudoku Solver", category: "Recursion & Backtracking", description: "Solving constraint-satisfaction puzzles using backtracking with pruning." },
];

// ─── Build KnowledgeNodes ────────────────────────────────────────────

export const DSA_NODES: KnowledgeNode[] = TOPIC_DEFS.map((t) => ({
  nodeId: slugToId(t.slug),
  mapId: GLOBAL_DSA_MAP_ID,
  title: t.title,
  topicTags: [t.slug],
  description: t.description,
  category: t.category,
  status: "NotCovered" as const,
}));

/** Lookup slug → nodeId */
export const SLUG_TO_NODE_ID: Record<string, string> = Object.fromEntries(
  TOPIC_DEFS.map((t) => [t.slug, slugToId(t.slug)]),
);

// ─── Prerequisite Edges ──────────────────────────────────────────────

type EdgeDef = [from: string, to: string]; // [prerequisite, dependent]

const EDGE_DEFS: EdgeDef[] = [
  // Complexity Analysis foundations
  ["big-o-notation", "big-omega-theta"],
  ["big-o-notation", "time-complexity"],
  ["big-o-notation", "space-complexity"],
  ["time-complexity", "amortized-analysis"],
  ["big-o-notation", "master-theorem"],

  // Arrays build on complexity
  ["time-complexity", "static-arrays"],
  ["static-arrays", "dynamic-arrays"],
  ["static-arrays", "two-pointer-technique"],
  ["static-arrays", "sliding-window"],
  ["static-arrays", "prefix-sums"],
  ["static-arrays", "string-matching"],
  ["static-arrays", "matrix-operations"],
  ["static-arrays", "kadanes-algorithm"],
  ["dynamic-arrays", "amortized-analysis"],

  // Linked Lists
  ["static-arrays", "singly-linked-list"],
  ["singly-linked-list", "doubly-linked-list"],
  ["singly-linked-list", "circular-linked-list"],
  ["singly-linked-list", "linked-list-reversal"],
  ["singly-linked-list", "fast-slow-pointers"],
  ["singly-linked-list", "merge-linked-lists"],
  ["doubly-linked-list", "lru-cache"],
  ["hash-table-fundamentals", "lru-cache"],

  // Stacks & Queues
  ["static-arrays", "stack-fundamentals"],
  ["static-arrays", "queue-fundamentals"],
  ["queue-fundamentals", "deque"],
  ["stack-fundamentals", "monotonic-stack"],
  ["stack-fundamentals", "expression-evaluation"],
  ["stack-fundamentals", "stack-queue-interconversion"],
  ["queue-fundamentals", "stack-queue-interconversion"],
  ["queue-fundamentals", "circular-queue"],

  // Hash Tables
  ["static-arrays", "hash-table-fundamentals"],
  ["hash-table-fundamentals", "collision-resolution"],
  ["hash-table-fundamentals", "hash-functions"],
  ["hash-table-fundamentals", "hash-sets"],
  ["hash-table-fundamentals", "frequency-counting"],
  ["hash-table-fundamentals", "two-sum-pattern"],

  // Trees
  ["singly-linked-list", "binary-tree-basics"],
  ["binary-tree-basics", "tree-traversals"],
  ["binary-tree-basics", "binary-search-trees"],
  ["binary-search-trees", "avl-trees"],
  ["binary-search-trees", "red-black-trees"],
  ["binary-tree-basics", "tries"],
  ["binary-tree-basics", "segment-trees"],
  ["binary-tree-basics", "fenwick-trees"],
  ["binary-tree-basics", "lowest-common-ancestor"],
  ["tree-traversals", "lowest-common-ancestor"],
  ["binary-tree-basics", "tree-serialization"],

  // Heaps
  ["binary-tree-basics", "binary-heap"],
  ["binary-heap", "priority-queue"],
  ["binary-heap", "heap-sort"],
  ["priority-queue", "top-k-elements"],
  ["priority-queue", "merge-k-sorted"],
  ["merge-linked-lists", "merge-k-sorted"],

  // Graphs
  ["binary-tree-basics", "graph-representations"],
  ["graph-representations", "bfs"],
  ["graph-representations", "dfs"],
  ["bfs", "dijkstras-algorithm"],
  ["priority-queue", "dijkstras-algorithm"],
  ["graph-representations", "bellman-ford"],
  ["dfs", "topological-sort"],
  ["graph-representations", "union-find"],
  ["union-find", "kruskals-algorithm"],
  ["priority-queue", "prims-algorithm"],
  ["graph-representations", "prims-algorithm"],
  ["dfs", "strongly-connected-components"],

  // Sorting
  ["static-arrays", "bubble-sort"],
  ["static-arrays", "selection-sort"],
  ["static-arrays", "insertion-sort"],
  ["recursion-basics", "merge-sort"],
  ["recursion-basics", "quick-sort"],
  ["static-arrays", "counting-sort"],
  ["counting-sort", "radix-sort"],
  ["big-o-notation", "sorting-lower-bound"],

  // Searching
  ["static-arrays", "linear-search"],
  ["static-arrays", "binary-search"],
  ["binary-search", "binary-search-variants"],
  ["binary-search", "interpolation-search"],
  ["binary-search", "ternary-search"],

  // Dynamic Programming
  ["recursion-basics", "dp-introduction"],
  ["dp-introduction", "fibonacci-dp"],
  ["dp-introduction", "knapsack-01"],
  ["dp-introduction", "longest-common-subsequence"],
  ["dp-introduction", "longest-increasing-subsequence"],
  ["dp-introduction", "edit-distance"],
  ["dp-introduction", "coin-change"],
  ["dp-introduction", "matrix-chain-multiplication"],
  ["dp-introduction", "dp-on-trees"],
  ["binary-tree-basics", "dp-on-trees"],

  // Greedy
  ["dp-introduction", "greedy-introduction"],
  ["greedy-introduction", "activity-selection"],
  ["greedy-introduction", "huffman-coding"],
  ["binary-heap", "huffman-coding"],
  ["greedy-introduction", "fractional-knapsack"],
  ["greedy-introduction", "interval-scheduling"],
  ["greedy-introduction", "minimum-spanning-tree-concepts"],

  // Divide and Conquer
  ["recursion-basics", "divide-conquer-intro"],
  ["divide-conquer-intro", "merge-sort-analysis"],
  ["merge-sort", "merge-sort-analysis"],
  ["divide-conquer-intro", "closest-pair"],
  ["divide-conquer-intro", "strassens-algorithm"],
  ["master-theorem", "merge-sort-analysis"],

  // Recursion & Backtracking
  ["time-complexity", "recursion-basics"],
  ["recursion-basics", "backtracking-framework"],
  ["backtracking-framework", "n-queens"],
  ["backtracking-framework", "subset-generation"],
  ["backtracking-framework", "sudoku-solver"],
];

let edgeCounter = 0;

export const DSA_EDGES: KnowledgeEdge[] = EDGE_DEFS.map(([from, to]) => ({
  edgeId: `edge-${String(++edgeCounter).padStart(3, "0")}`,
  mapId: GLOBAL_DSA_MAP_ID,
  fromNodeId: SLUG_TO_NODE_ID[from],
  toNodeId: SLUG_TO_NODE_ID[to],
  type: "Prerequisite" as const,
}));
