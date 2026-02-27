// ─── COT4400 Source Questions ───────────────────────────────────────
// Professor Cobo's actual quiz/midterm questions, stored as typed data.
// These serve as few-shot examples for AI-generated quiz variants.
// Code style is C (matching Cobo's originals). Generated variants use Java.

import { ASSESSMENT_IDS } from "./cot4400-course";

export type CoboQuestionType =
  | "BigO"
  | "ShortAnswer"
  | "Trace"
  | "BackSubstitution"
  | "MasterTheorem"
  | "Hashing"
  | "StepCount"
  | "WriteAlgorithm";

export interface SourceQuestion {
  questionId: string;
  assessmentRef: string;
  type: CoboQuestionType;
  prompt: string;
  code?: string;
  answerKey: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  formatRequirements: string;
  topicTags: string[];
}

function qId(quiz: string, num: number): string {
  return `00000000-0000-4000-a000-cot4400q${quiz}${String(num).padStart(2, "0")}`;
}

// ─── Quiz 1: Asymptotic Complexity (5 questions) ────────────────────

const quiz1Questions: SourceQuestion[] = [
  {
    questionId: qId("1", 1),
    assessmentRef: ASSESSMENT_IDS.quiz1,
    type: "BigO",
    prompt: "Determine the asymptotic complexity of the following code.",
    code: `Multiply(A, B, n)
for (i=0; i<n; i++)
    for (j=0; j < n; j++)
    {   C[i,j] = 0;
        for (k=0; k<n; k++)
            C[i,j] = C[i,j] + A[j,k] * B[k,j]
    }`,
    answerKey: "O(n³)",
    explanation:
      "Three nested loops each run n times. The outermost loop runs n iterations, the middle loop runs n iterations for each outer iteration, and the innermost loop runs n iterations for each middle iteration. Total operations: n × n × n = n³.",
    difficulty: "Medium",
    formatRequirements: "Must show work (step counting), not just the answer.",
    topicTags: ["BigO", "TimeComplexity"],
  },
  {
    questionId: qId("1", 2),
    assessmentRef: ASSESSMENT_IDS.quiz1,
    type: "BigO",
    prompt: "Determine the asymptotic complexity of the following code.",
    code: `for (i=0; i<n; i++)
    for (j=0; j<i; j++)
        a+=j;`,
    answerKey: "O(n²)",
    explanation:
      "The inner loop runs from 0 to i (not n), creating a dependent loop. Total iterations: 0 + 1 + 2 + ... + (n-1) = n(n-1)/2. Dropping constants: O(n²). The key is recognizing j < i, not j < n.",
    difficulty: "Medium",
    formatRequirements: "Must show work. Note the dependent inner loop bound (j < i, not j < n).",
    topicTags: ["BigO", "TimeComplexity"],
  },
  {
    questionId: qId("1", 3),
    assessmentRef: ASSESSMENT_IDS.quiz1,
    type: "BigO",
    prompt: "Determine the asymptotic complexity of the following code.",
    code: `for (i=0; i*i<n; i++)
    k+=A[i];`,
    answerKey: "O(√n)",
    explanation:
      "The loop condition is i*i < n, meaning the loop runs while i < √n. So the loop executes √n times, each doing O(1) work. Total: O(√n).",
    difficulty: "Medium",
    formatRequirements: "Must show work. Note the i*i < n condition (square root loop).",
    topicTags: ["BigO", "TimeComplexity"],
  },
  {
    questionId: qId("1", 4),
    assessmentRef: ASSESSMENT_IDS.quiz1,
    type: "BigO",
    prompt: "Determine the asymptotic complexity of the following code.",
    code: `for (i=n; i>=1; i=i/2)
    k+= A[i];`,
    answerKey: "O(log n)",
    explanation:
      "The loop variable i starts at n and is halved each iteration (i = i/2), running until i < 1. The number of halvings from n to 1 is log₂(n). Each iteration does O(1) work. Total: O(log n).",
    difficulty: "Medium",
    formatRequirements: "Must show work. Note i = i/2 (halving loop from n down to 1).",
    topicTags: ["BigO", "TimeComplexity"],
  },
  {
    questionId: qId("1", 5),
    assessmentRef: ASSESSMENT_IDS.quiz1,
    type: "BigO",
    prompt: "Determine the asymptotic complexity of the following code.",
    code: `a=10;
i=0;
while (i < n)
{   a+=i;
    i++;
}`,
    answerKey: "O(n)",
    explanation:
      "Simple while loop where i increments by 1 from 0 to n. The loop body does O(1) work per iteration. Total iterations: n. Total: O(n).",
    difficulty: "Medium",
    formatRequirements: "Must show work.",
    topicTags: ["BigO", "TimeComplexity"],
  },
];

// ─── Quiz 2: Back Substitution — Decreasing (3 questions) ──────────

const quiz2Questions: SourceQuestion[] = [
  {
    questionId: qId("2", 1),
    assessmentRef: ASSESSMENT_IDS.quiz2,
    type: "BackSubstitution",
    prompt:
      "Solve the following recurrence relation using back substitution.\nT(n) = T(n-1) + 5  for n > 1\nT(0) = 1",
    answerKey: "O(n)",
    explanation:
      "Level 1: T(n) = T(n-1) + 5\nLevel 2: T(n) = T(n-2) + 5 + 5 = T(n-2) + 10\nLevel 3: T(n) = T(n-3) + 15\nk-th level: T(n) = T(n-k) + 5k\nSolve: when k = n, T(0) + 5n = 1 + 5n = O(n)",
    difficulty: "Medium",
    formatRequirements:
      "Show 3 expansions, then the k-th level pattern, then solve when k reaches the base case.",
    topicTags: ["BigO", "TimeComplexity"],
  },
  {
    questionId: qId("2", 2),
    assessmentRef: ASSESSMENT_IDS.quiz2,
    type: "BackSubstitution",
    prompt:
      "Solve the following recurrence relation using back substitution.\nT(n) = 2T(n-1) + 1  for n > 1\nT(1) = 1",
    answerKey: "O(2ⁿ)",
    explanation:
      "Level 1: T(n) = 2T(n-1) + 1\nLevel 2: T(n) = 2[2T(n-2) + 1] + 1 = 4T(n-2) + 2 + 1\nLevel 3: T(n) = 8T(n-3) + 4 + 2 + 1\nk-th level: T(n) = 2ᵏ · T(n-k) + (2ᵏ - 1)\nSolve: when k = n-1, T(1) · 2ⁿ⁻¹ + (2ⁿ⁻¹ - 1) = 2ⁿ⁻¹ + 2ⁿ⁻¹ - 1 = 2ⁿ - 1 = O(2ⁿ)",
    difficulty: "Medium",
    formatRequirements:
      "Show 3 expansions, then the k-th level pattern, then solve when k reaches the base case.",
    topicTags: ["BigO", "TimeComplexity"],
  },
  {
    questionId: qId("2", 3),
    assessmentRef: ASSESSMENT_IDS.quiz2,
    type: "BackSubstitution",
    prompt:
      'Solve the following recurrence relation using back substitution.\nPlease note the base case.\nT(n) = 3T(n-1)  for n > 1\nT(1) = 4',
    answerKey: "O(3ⁿ)",
    explanation:
      "Level 1: T(n) = 3T(n-1)\nLevel 2: T(n) = 3 · 3T(n-2) = 9T(n-2)\nLevel 3: T(n) = 27T(n-3) = 3³ · T(n-3)\nk-th level: T(n) = 3ᵏ · T(n-k)\nSolve: when k = n-1, 3ⁿ⁻¹ · T(1) = 3ⁿ⁻¹ · 4 = 4 · 3ⁿ⁻¹ = O(3ⁿ)",
    difficulty: "Medium",
    formatRequirements:
      "Show 3 expansions, then the k-th level pattern, then solve when k reaches the base case. Note the non-standard base case T(1) = 4.",
    topicTags: ["BigO", "TimeComplexity"],
  },
];

// ─── Quiz 3: Back Substitution — Dividing (1 question) ─────────────

const quiz3Questions: SourceQuestion[] = [
  {
    questionId: qId("3", 1),
    assessmentRef: ASSESSMENT_IDS.quiz3,
    type: "BackSubstitution",
    prompt:
      "Solve the following recurrence relation using back substitution. Please note the base case.\nT(n) = 2T(n/2) + 4n  for n > 4\nT(4) = 1",
    answerKey: "O(n log n)",
    explanation:
      "Level 1: T(n) = 2T(n/2) + 4n\nLevel 2: T(n) = 2[2T(n/4) + 4(n/2)] + 4n = 4T(n/4) + 4n + 4n\nLevel 3: T(n) = 8T(n/8) + 4n + 4n + 4n\nk-th level: T(n) = 2ᵏ · T(n/2ᵏ) + 4nk\nSolve: when n/2ᵏ = 4, so 2ᵏ = n/4, k = log₂(n/4) = log₂(n) - 2\nT(n) = (n/4) · T(4) + 4n(log₂(n) - 2) = n/4 + 4n·log₂(n) - 8n = O(n log n)",
    difficulty: "Medium",
    formatRequirements:
      "Show 3 expansions, then the k-th level, then solve. Don't simplify the equation you get when you solve the recurrence. Note base case T(4) = 1.",
    topicTags: ["BigO", "TimeComplexity", "DivideAndConquer"],
  },
];

// ─── Quiz 4: Master Theorem (4 questions) ───────────────────────────

const quiz4Questions: SourceQuestion[] = [
  {
    questionId: qId("4", 1),
    assessmentRef: ASSESSMENT_IDS.quiz4,
    type: "MasterTheorem",
    prompt: "Solve using the Master Theorem.\nT(N) = 4T(N/2) + N",
    answerKey: "O(N²)",
    explanation:
      "a = 4, b = 2, k = 1\nlog_b(a) = log₂(4) = 2\nSince log_b(a) = 2 > k = 1: Case 1 (a > bᵏ, i.e., 4 > 2¹)\nT(N) = O(N²) = O(N^(log₂(4)))",
    difficulty: "Medium",
    formatRequirements: "Show a, b, k values. State which case and subcase applies.",
    topicTags: ["MasterTheorem", "DivideAndConquer"],
  },
  {
    questionId: qId("4", 2),
    assessmentRef: ASSESSMENT_IDS.quiz4,
    type: "MasterTheorem",
    prompt: "Solve using the Master Theorem.\nT(N) = 8T(N/2) + N²",
    answerKey: "O(N³)",
    explanation:
      "a = 8, b = 2, k = 2\nlog_b(a) = log₂(8) = 3\nSince log_b(a) = 3 > k = 2: Case 1 (a > bᵏ, i.e., 8 > 2² = 4)\nT(N) = O(N³) = O(N^(log₂(8)))",
    difficulty: "Medium",
    formatRequirements: "Show a, b, k values. State which case and subcase applies.",
    topicTags: ["MasterTheorem", "DivideAndConquer"],
  },
  {
    questionId: qId("4", 3),
    assessmentRef: ASSESSMENT_IDS.quiz4,
    type: "MasterTheorem",
    prompt: "Solve using the Master Theorem.\nT(N) = 9T(N/3) + N²",
    answerKey: "O(N² log N)",
    explanation:
      "a = 9, b = 3, k = 2\nlog_b(a) = log₃(9) = 2\nSince log_b(a) = 2 = k = 2: Case 2 (a = bᵏ, i.e., 9 = 3²)\nT(N) = O(N² log N)",
    difficulty: "Medium",
    formatRequirements: "Show a, b, k values. State which case and subcase applies.",
    topicTags: ["MasterTheorem", "DivideAndConquer"],
  },
  {
    questionId: qId("4", 4),
    assessmentRef: ASSESSMENT_IDS.quiz4,
    type: "MasterTheorem",
    prompt: "Solve using the Master Theorem.\nT(N) = T(N/2) + N²",
    answerKey: "O(N²)",
    explanation:
      "a = 1, b = 2, k = 2\nlog_b(a) = log₂(1) = 0\nSince log_b(a) = 0 < k = 2: Case 3 (a < bᵏ, i.e., 1 < 2² = 4)\nT(N) = O(N²)",
    difficulty: "Medium",
    formatRequirements: "Show a, b, k values. State which case and subcase applies.",
    topicTags: ["MasterTheorem", "DivideAndConquer"],
  },
];

// ─── Quiz 5: Hashing (3 questions) ─────────────────────────────────

const quiz5Questions: SourceQuestion[] = [
  {
    questionId: qId("5", 1),
    assessmentRef: ASSESSMENT_IDS.quiz5,
    type: "Hashing",
    prompt:
      "Given the input: {4371, 1323, 6173, 4199, 4344, 9679, 1989} and a hash function: h(x) = x mod 10, show the resulting:\n\na. Hash table if chaining is used.\nb. Hash table if linear probing is used.",
    answerKey:
      "Chaining:\n0: (empty)\n1: 4371\n2: (empty)\n3: 1323 → 6173\n4: 4344\n5: (empty)\n6: (empty)\n7: (empty)\n8: (empty)\n9: 4199 → 9679 → 1989\n\nLinear Probing:\n0: 1989\n1: 4371\n2: (empty)\n3: 1323\n4: 6173\n5: 4344\n6: (empty)\n7: (empty)\n8: (empty)\n9: 4199\n10: 9679",
    explanation:
      "h(x) = x mod 10 maps each key to its last digit.\n4371→1, 1323→3, 6173→3, 4199→9, 4344→4, 9679→9, 1989→9.\n\nChaining: Collisions at index 3 (1323, 6173) and index 9 (4199, 9679, 1989) are stored as linked lists.\n\nLinear probing: Insert in order. 6173 hashes to 3 (taken by 1323) → probe to 4 (open). 9679 hashes to 9 (taken by 4199) → probe to 10. 1989 hashes to 9 (taken) → 10 (taken) → 0 (open).",
    difficulty: "Medium",
    formatRequirements:
      "Show the resulting hash table for each method. For chaining, show linked lists at each index. For linear probing, show the probe sequence for collisions.",
    topicTags: ["HashTableFundamentals", "CollisionResolution"],
  },
  {
    questionId: qId("5", 2),
    assessmentRef: ASSESSMENT_IDS.quiz5,
    type: "Hashing",
    prompt:
      "What is the resulting hash function if you apply rehashing to the set of values in Question 1? Choose a size that is at least twice as large and prime. Show the result in the new hash table if linear probing is used.",
    answerKey:
      "Original table size = 10. Double = 20. Next prime ≥ 20 is 23.\nNew hash function: h(x) = x mod 23\nRehash all 7 values into the new size-23 table using linear probing.",
    explanation:
      "When a hash table gets too full, we rehash: pick a new size ≥ 2× the original that is prime (23), create a new hash function h(x) = x mod 23, and re-insert all elements. Using 23: 4371 mod 23 = 1, 1323 mod 23 = 12, 6173 mod 23 = 8, 4199 mod 23 = 13, 4344 mod 23 = 18, 9679 mod 23 = 19, 1989 mod 23 = 11. No collisions with mod 23.",
    difficulty: "Medium",
    formatRequirements:
      "Choose new size (at least 2× original, must be prime). Show new hash function. Show resulting table.",
    topicTags: ["HashTableFundamentals", "CollisionResolution"],
  },
  {
    questionId: qId("5", 3),
    assessmentRef: ASSESSMENT_IDS.quiz5,
    type: "ShortAnswer",
    prompt:
      "What are the advantages and disadvantages of linear probing vs chaining collision resolution?",
    answerKey:
      "Chaining advantages: No clustering, handles high load factors well, deletion is simple.\nChaining disadvantages: Extra memory for linked list pointers, cache-unfriendly.\nLinear probing advantages: No extra pointers needed, cache-friendly, simple implementation.\nLinear probing disadvantages: Primary clustering, performance degrades significantly as load factor approaches 1, deletion requires lazy deletion (tombstones).",
    explanation:
      "Chaining stores colliding elements in linked lists at each index — simple but uses extra memory for pointers and has poor cache locality. Linear probing stores everything in the table itself with sequential probing — cache-friendly but suffers from primary clustering where long runs of occupied slots form, degrading performance.",
    difficulty: "Medium",
    formatRequirements: "Explain advantages and disadvantages of both methods.",
    topicTags: ["HashTableFundamentals", "CollisionResolution"],
  },
];

// ─── Midterm (11 questions) ─────────────────────────────────────────

const midtermQuestions: SourceQuestion[] = [
  {
    questionId: qId("m", 1),
    assessmentRef: ASSESSMENT_IDS.midterm,
    type: "BackSubstitution",
    prompt:
      'From the following function generate:\n\na. The recurrence relation for funcA(...), in the form T(n).\nb. Solve the recurrence relation using back substitution and provide O(.). You must generate at least three iterations up to the kth level and solve for n as k approaches n.\n\nNote: what discFunc(..) returns is irrelevant to the analysis.',
    code: `int funcA(int A[], int n)
{
    if (n == 1)
        return A[0];
    return discFunc(A[n-1], funcA(A, n-1));
}`,
    answerKey: "O(n)",
    explanation:
      "Part a: T(n) = T(n-1) + c for n > 1, T(1) = 1 (one recursive call with n-1, discFunc is O(1)).\nPart b:\nLevel 1: T(n) = T(n-1) + c\nLevel 2: T(n) = T(n-2) + 2c\nLevel 3: T(n) = T(n-3) + 3c\nk-th level: T(n) = T(n-k) + kc\nSolve: k = n-1, T(1) + (n-1)c = 1 + (n-1)c = O(n)",
    difficulty: "Medium",
    formatRequirements:
      "Part a: derive recurrence relation from code. Part b: show 3 expansions, k-th level, solve.",
    topicTags: ["BigO", "TimeComplexity"],
  },
  {
    questionId: qId("m", 2),
    assessmentRef: ASSESSMENT_IDS.midterm,
    type: "BackSubstitution",
    prompt:
      "Solve the recurrence relation using the back substitution method.\nT(n) = T(n-1) + 2n  for n ≥ 1\nT(0) = 1",
    answerKey: "O(n²)",
    explanation:
      "Level 1: T(n) = T(n-1) + 2n\nLevel 2: T(n) = T(n-2) + 2(n-1) + 2n\nLevel 3: T(n) = T(n-3) + 2(n-2) + 2(n-1) + 2n\nk-th level: T(n) = T(n-k) + 2·Σ(i from n-k+1 to n) of i\nSolve: k = n, T(0) + 2(1 + 2 + ... + n) = 1 + 2·n(n+1)/2 = 1 + n(n+1) = O(n²)",
    difficulty: "Medium",
    formatRequirements: "Show 3 expansions, k-th level, solve.",
    topicTags: ["BigO", "TimeComplexity"],
  },
  {
    questionId: qId("m", 3),
    assessmentRef: ASSESSMENT_IDS.midterm,
    type: "MasterTheorem",
    prompt: "Using Master's Theorem for dividing functions solve for:\nT(n) = 8T(n/2) + n³",
    answerKey: "O(n³ log n)",
    explanation:
      "a = 8, b = 2, k = 3\nlog_b(a) = log₂(8) = 3\nSince log_b(a) = 3 = k = 3: Case 2 (a = bᵏ)\nT(n) = O(n³ log n)",
    difficulty: "Medium",
    formatRequirements: "Show a, b, k. State case and subcase.",
    topicTags: ["MasterTheorem", "DivideAndConquer"],
  },
  {
    questionId: qId("m", 4),
    assessmentRef: ASSESSMENT_IDS.midterm,
    type: "MasterTheorem",
    prompt:
      "Using Master's Theorem for dividing functions solve for:\nT(n) = 2T(n/2) + n² logₙ 2",
    answerKey: "O(n²)",
    explanation:
      "a = 2, b = 2. Note: logₙ(2) = ln(2)/ln(n) = O(1/log n), so f(n) = n² · logₙ(2) = n²/log(n).\nn^(log_b(a)) = n^(log₂(2)) = n¹ = n.\nSince f(n) = n²/log(n) grows faster than n (polynomially), Case 3 applies.\nT(n) = O(n² logₙ 2) which simplifies to O(n²/log n), but the dominant term is O(n²).",
    difficulty: "Hard",
    formatRequirements:
      "Show a, b, k. State case and subcase. Note the log base n (not base 2).",
    topicTags: ["MasterTheorem", "DivideAndConquer"],
  },
  {
    questionId: qId("m", 5),
    assessmentRef: ASSESSMENT_IDS.midterm,
    type: "ShortAnswer",
    prompt:
      "Explain how hash functions work and why they are used in data structures such as hash tables.",
    answerKey:
      "Hash functions map keys to indices in a fixed-size array. The goal is to distribute keys uniformly to minimize collisions. Hash tables use hash functions to achieve O(1) expected-time get/put/remove operations. A hash function takes an input key, applies a deterministic computation (e.g., h(x) = x mod m), and produces an index in [0, m-1]. When two keys map to the same index (collision), resolution strategies like chaining or probing are used.",
    explanation:
      "A hash function is a mapping h: K → {0, 1, ..., m-1} from keys to table indices. It must be deterministic (same key always maps to same index), efficient to compute (O(1)), and distribute keys uniformly across the table. Hash tables use this to convert key-based lookup into array-based lookup, achieving O(1) expected time for insertions, deletions, and searches.",
    difficulty: "Medium",
    formatRequirements:
      "Elaborate on your response. Show proof in mathematical notation if possible.",
    topicTags: ["HashTableFundamentals", "HashFunctions"],
  },
  {
    questionId: qId("m", 6),
    assessmentRef: ASSESSMENT_IDS.midterm,
    type: "ShortAnswer",
    prompt:
      "What is meant by universal hashing? Why is it desirable to use a hash function that has the property of universality? You can use the division hash function shown in class to elaborate.",
    answerKey:
      "A universal hash family H is a set of hash functions where for any two distinct keys x, y, the probability Pr[h(x) = h(y)] ≤ 1/m for randomly chosen h ∈ H. This guarantees good average-case behavior regardless of input distribution. The division method: h_{a,b}(x) = ((ax + b) mod p) mod m, where p is prime, a ∈ {1,...,p-1}, b ∈ {0,...,p-1}.",
    explanation:
      "Universal hashing prevents adversarial inputs from causing worst-case O(n) behavior. By randomly choosing a hash function from a universal family at runtime, no fixed input set can consistently cause collisions. The expected number of collisions for any pair of keys is at most 1/m, ensuring O(1 + n/m) expected chain length.",
    difficulty: "Medium",
    formatRequirements:
      "Elaborate with mathematical notation. Reference the division hash function from class.",
    topicTags: ["HashTableFundamentals", "HashFunctions"],
  },
  {
    questionId: qId("m", 7),
    assessmentRef: ASSESSMENT_IDS.midterm,
    type: "ShortAnswer",
    prompt:
      "With respect to the universal hash family, what is a prime field, and what are properties of prime fields?",
    answerKey:
      "A prime field Z_p is the set {0, 1, 2, ..., p-1} with arithmetic modulo p. Properties: closed under addition and multiplication mod p, every non-zero element has a multiplicative inverse, forms a finite field. Relevant to hashing because universal hash families are constructed using operations in prime fields.",
    explanation:
      "Z_p (integers modulo a prime p) forms a field: addition and multiplication are closed, associative, commutative; additive identity 0, multiplicative identity 1; every non-zero element a has an inverse a⁻¹ such that a·a⁻¹ ≡ 1 (mod p). This algebraic structure is why universal hash functions use prime moduli — it guarantees uniform distribution of hash values.",
    difficulty: "Medium",
    formatRequirements: "Provide detailed explanation with mathematical properties.",
    topicTags: ["HashTableFundamentals", "HashFunctions"],
  },
  {
    questionId: qId("m", 8),
    assessmentRef: ASSESSMENT_IDS.midterm,
    type: "ShortAnswer",
    prompt:
      "Fill in the time efficiencies/complexities table for hash table operations and unsorted list:\n\n| Method | Unsorted List | Hash Table (expected) | Hash Table (worst case) |\n| get | | | |\n| put | | | |\n| remove | | | |\n| size, isEmpty | | | |",
    answerKey:
      "| Method | Unsorted List | Hash Table (expected) | Hash Table (worst case) |\n| get | O(n) | O(1) | O(n) |\n| put | O(n) | O(1) | O(n) |\n| remove | O(n) | O(1) | O(n) |\n| size, isEmpty | O(1) | O(1) | O(1) |",
    explanation:
      "Unsorted list: get/put/remove require linear scan → O(n). size/isEmpty maintained as counter → O(1).\nHash table expected: with good hash function, O(1) for get/put/remove.\nHash table worst case: all keys hash to same slot → degenerates to linked list → O(n) for get/put/remove.\nsize/isEmpty: O(1) in all cases (maintained separately).",
    difficulty: "Medium",
    formatRequirements: "Fill in the table with Big-O notation.",
    topicTags: ["HashTableFundamentals"],
  },
  {
    questionId: qId("m", 9),
    assessmentRef: ASSESSMENT_IDS.midterm,
    type: "Hashing",
    prompt:
      "Draw the 11-entry hash table that results from using h(x) = (3x + 5) mod 11 to hash the keys {12, 44, 13, 88, 23, 94, 11, 39, 20, 16, 5}, assuming collisions are handled by chaining.",
    answerKey:
      "0: 13\n1: 94 → 39\n2: (empty)\n3: (empty)\n4: (empty)\n5: 44 → 88 → 11\n6: (empty)\n7: (empty)\n8: 12 → 23\n9: 16 → 5\n10: 20",
    explanation:
      "Apply h(x) = (3x + 5) mod 11:\nh(12) = 41 mod 11 = 8\nh(44) = 137 mod 11 = 5\nh(13) = 44 mod 11 = 0\nh(88) = 269 mod 11 = 5\nh(23) = 74 mod 11 = 8\nh(94) = 287 mod 11 = 1\nh(11) = 38 mod 11 = 5\nh(39) = 122 mod 11 = 1\nh(20) = 65 mod 11 = 10\nh(16) = 53 mod 11 = 9\nh(5) = 20 mod 11 = 9\n\nChaining: collisions at indices 5 (44,88,11), 8 (12,23), 1 (94,39), 9 (16,5).",
    difficulty: "Medium",
    formatRequirements: "Draw the hash table showing chains at each index.",
    topicTags: ["HashTableFundamentals", "CollisionResolution"],
  },
  {
    questionId: qId("m", 10),
    assessmentRef: ASSESSMENT_IDS.midterm,
    type: "Hashing",
    prompt:
      "Show the resulting table from the previous question assuming collisions are handled by linear probing. Use h(x) = (3x + 5) mod 11 with keys {12, 44, 13, 88, 23, 94, 11, 39, 20, 16, 5}.",
    answerKey:
      "0: 13\n1: 94\n2: 39\n3: 16\n4: 5\n5: 44\n6: 88\n7: 11\n8: 12\n9: 23\n10: 20",
    explanation:
      "Insert in order using linear probing:\n12 → index 8 (open)\n44 → index 5 (open)\n13 → index 0 (open)\n88 → index 5 (taken) → 6 (open)\n23 → index 8 (taken) → 9 (open)\n94 → index 1 (open)\n11 → index 5 (taken) → 6 (taken) → 7 (open)\n39 → index 1 (taken) → 2 (open)\n20 → index 10 (open)\n16 → index 9 (taken) → 10 (taken) → 0 (taken) → 1 (taken) → 2 (taken) → 3 (open)\n5 → index 9 (taken) → 10 (taken) → 0 (taken) → 1 (taken) → 2 (taken) → 3 (taken) → 4 (open)",
    difficulty: "Medium",
    formatRequirements: "Draw the hash table showing the result of linear probing.",
    topicTags: ["HashTableFundamentals", "CollisionResolution"],
  },
  {
    questionId: qId("m", 11),
    assessmentRef: ASSESSMENT_IDS.midterm,
    type: "WriteAlgorithm",
    prompt:
      "a. (10 pts) Write a recursive merge sort RMergeSort(L).\nb. (5 pts) Write the recurrence relation for RMergeSort.\nc. (10 pts) Solve the recurrence relation from Part b using back substitution to get the worst case time complexity.",
    answerKey: "O(n log n)",
    explanation:
      "Part a:\nRMergeSort(L):\n  if |L| <= 1: return L\n  mid = |L| / 2\n  left = RMergeSort(L[0..mid-1])\n  right = RMergeSort(L[mid..|L|-1])\n  return Merge(left, right)\n\nPart b: T(n) = 2T(n/2) + n for n > 1, T(1) = 1\n\nPart c:\nLevel 1: T(n) = 2T(n/2) + n\nLevel 2: T(n) = 4T(n/4) + 2n\nLevel 3: T(n) = 8T(n/8) + 3n\nk-th level: T(n) = 2ᵏ · T(n/2ᵏ) + kn\nSolve: when n/2ᵏ = 1, k = log₂(n)\nT(n) = n · T(1) + n · log₂(n) = n + n·log(n) = O(n log n)",
    difficulty: "Medium",
    formatRequirements:
      "Part a: write the algorithm. Part b: derive recurrence. Part c: show 3 expansions, k-th level, solve.",
    topicTags: ["BigO", "TimeComplexity", "MergeSort"],
  },
];

// ─── Export All ─────────────────────────────────────────────────────

export const COT4400_SOURCE_QUESTIONS: SourceQuestion[] = [
  ...quiz1Questions,
  ...quiz2Questions,
  ...quiz3Questions,
  ...quiz4Questions,
  ...quiz5Questions,
  ...midtermQuestions,
];
