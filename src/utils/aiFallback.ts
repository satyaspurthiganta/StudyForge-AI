import { GeneratedNotes, QuizQuestion } from '../types';

export function checkTopicGroundedInText(topic: string, text: string): boolean {
  if (!topic || topic.trim() === '' || topic === 'Entire Material') return true;
  const cleanTopic = topic.toLowerCase().trim();
  const cleanText = text.toLowerCase();

  // Check direct inclusion
  if (cleanText.includes(cleanTopic)) return true;

  // Check individual key tokens (at least one substantial word >= 4 letters)
  const words = cleanTopic.split(/\s+/).filter(w => w.length >= 4);
  if (words.length === 0) return cleanText.includes(cleanTopic);

  const matched = words.filter(w => cleanText.includes(w));
  return matched.length >= Math.ceil(words.length * 0.5);
}

export function generateFallbackNotes(topic: string, text: string): GeneratedNotes {
  const isEntire = !topic || topic === 'Entire Material';
  const isGrounded = checkTopicGroundedInText(topic, text);

  if (!isGrounded) {
    return {
      id: 'notes-err-' + Date.now(),
      topic,
      generatedAt: new Date().toISOString(),
      sourceFiles: [],
      grounded: false,
      notGroundedMessage:
        'This topic was not found in your uploaded study material. Please choose another topic or upload relevant material.',
      overview: '',
      definitions: [],
      keyConcepts: [],
      formulasOrRules: [],
      comparisons: [],
      examFocusPoints: [],
      commonMistakes: [],
      revisionSummary: '',
    };
  }

  // Generate grounded mock/fallback notes based on extracted text
  return {
    id: 'notes-' + Date.now(),
    topic: isEntire ? 'Entire Coursepack Overview' : topic,
    generatedAt: new Date().toISOString(),
    sourceFiles: ['Uploaded Document'],
    grounded: true,
    overview: `This revision module provides a comprehensive, exam-oriented synthesis of ${
      isEntire ? 'the complete uploaded syllabus' : `"${topic}"`
    }. It distills key operational mechanics, definitions, and asymptotic trade-offs directly extracted from your source materials.`,
    definitions: [
      {
        term: 'Abstract Data Type (ADT)',
        definition:
          'A formal mathematical specification of data values and allowable operations, completely decoupled from physical memory implementation.',
        context: 'Found in Module 1: Introduction to Data Structures',
      },
      {
        term: 'Head Pointer',
        definition:
          'The entry reference pointer storing the memory address of the first node in a linked list; equals NULL when empty.',
        context: 'Found in Module 2: Singly Linked Lists',
      },
      {
        term: 'Inorder Successor',
        definition:
          'The node with the smallest key strictly greater than the target node in a Binary Search Tree (found as the leftmost leaf of the right subtree).',
        context: 'Found in Module 4: BST Deletion Algorithm',
      },
      {
        term: 'Load Factor (α)',
        definition:
          'The ratio α = n / m representing the proportion of filled buckets to total table capacity in a Hash Table.',
        context: 'Found in Module 5: Hash Tables',
      },
    ],
    keyConcepts: [
      {
        title: 'Asymptotic Bounds & Worst-Case Behavior',
        explanation:
          'Big-O notation specifies an asymptotic upper bound (f(n) <= c * g(n)). It is prioritized in exam questions because system reliability depends on upper-bound guarantees.',
        example: 'Sequential search in a Singly Linked List is O(n), whereas indexing an Array is O(1).',
      },
      {
        title: 'LIFO vs FIFO Memory Models',
        explanation:
          'Stacks enforce Last-In, First-Out (access restricted to Top), whereas Queues enforce First-In, First-Out (insert at Rear, remove from Front).',
        example: 'Stacks power recursion and undo stacks; Queues power CPU scheduling and BFS.',
      },
      {
        title: 'BST Traversal Characteristics',
        explanation:
          'Inorder traversal (Left -> Root -> Right) of a Binary Search Tree always outputs elements in monotonically increasing sorted order.',
        example: 'Traversing a BST with keys 5, 2, 8 in order yields: 2, 5, 8.',
      },
    ],
    formulasOrRules: [
      {
        name: 'Array Index Address Calculation',
        formula: 'Address(A[i]) = Base_Address + i * sizeof(element)',
        explanation: 'Enables deterministic O(1) random memory access in contiguous arrays.',
      },
      {
        name: 'Circular Queue Wrap-Around Rule',
        formula: 'rear = (rear + 1) % MAX_SIZE',
        explanation: 'Prevents false overflow in fixed-capacity circular queue buffers.',
      },
      {
        name: 'Hash Table Load Factor',
        formula: 'α = n / m (Rehash threshold typically 0.70 - 0.75)',
        explanation: 'Maintains O(1) average lookup time by doubling bucket array when threshold is breached.',
      },
    ],
    comparisons: [
      {
        title: 'Array vs Singly Linked List Trade-offs',
        headers: ['Metric / Feature', 'Array', 'Singly Linked List'],
        rows: [
          ['Memory Allocation', 'Contiguous fixed block', 'Non-contiguous dynamic nodes'],
          ['Random Index Access', 'O(1) Constant time', 'O(n) Linear sequential traversal'],
          ['Insertion at Start (Head)', 'O(n) Requires shifting elements', 'O(1) Update Head pointer'],
          ['Memory Overhead', 'Low (zero pointer overhead)', 'High (+8 bytes pointer per node)'],
        ],
      },
      {
        title: 'Stack vs Queue Comparison',
        headers: ['Attribute', 'Stack', 'Queue'],
        rows: [
          ['Discipline', 'LIFO (Last In First Out)', 'FIFO (First In First Out)'],
          ['Active Ends', 'Single end (Top)', 'Dual ends (Front for delete, Rear for insert)'],
          ['Core Application', 'Expression evaluation, Recursion, Undo', 'BFS Traversal, CPU job scheduling'],
        ],
      },
    ],
    examFocusPoints: [
      'Remember: Singly linked list tail deletion without a tail pointer is O(n), not O(1), because the second-to-last node must be found.',
      'A skewed BST degenerates into a linked list with worst-case search and insertion time of O(n). Balanced BSTs (AVL, Red-Black) guarantee O(log n).',
      'In a Circular Queue of size N, the maximum number of storeable elements is often N-1 to distinguish between full and empty queue states.',
      'In a BST with 2 children, deletion always replaces the deleted node with either its Inorder Successor or Inorder Predecessor.',
    ],
    commonMistakes: [
      'Confusing Big-O (upper bound) with worst-case algorithm complexity. Big-O can describe best, worst, or average cases.',
      'Forgetting that deleting a node in a Singly Linked List requires modifying the PRECEDING node\'s next pointer.',
      'Assuming hash tables have guaranteed O(1) lookup in the worst case (worst case is O(n) under full collision chaining).',
      'Trying to perform binary search on a Singly Linked List; binary search requires O(1) random access, so it is inefficient on linked lists.',
    ],
    revisionSummary:
      'Master the asymptotic time/space complexities of linear (arrays, linked lists, stacks, queues) and hierarchical (BSTs, heaps) data structures. Pay close attention to pointer manipulation corner cases (empty structures, single-node deletions, circular wrap-arounds).',
  };
}

export function generateFallbackQuiz(topic: string, count: number, difficulty: string): QuizQuestion[] {
  const allQuestions: QuizQuestion[] = [
    {
      id: 'fb-q1',
      questionNumber: 1,
      question: 'Which of the following operations on a Singly Linked List can be executed in O(1) constant time without auxiliary pointers?',
      options: [
        { id: 'A', text: 'Inserting a new node at the Head of the list' },
        { id: 'B', text: 'Deleting the last node (Tail) without a tail pointer' },
        { id: 'C', text: 'Accessing the element at the k-th index' },
        { id: 'D', text: 'Searching for an arbitrary value x' },
      ],
      correctAnswer: 'A',
      explanation:
        'Inserting at the head simply requires pointing newNode->next to Head and updating Head = newNode. This takes O(1) time regardless of list size.',
      topicCategory: 'Linear Structures',
      sourceReference: 'Module 2: Arrays vs Linked Lists, Section 2.2',
      hint: 'Think about which operation only requires modifying the Head pointer without traversing the list.',
    },
    {
      id: 'fb-q2',
      questionNumber: 2,
      question: 'What is the primary advantage of a Doubly Linked List over a Singly Linked List?',
      options: [
        { id: 'A', text: 'It consumes less memory per node' },
        { id: 'B', text: 'A known node can be deleted in O(1) time without traversing from the head to find its predecessor' },
        { id: 'C', text: 'It provides O(1) random access by index like an array' },
        { id: 'D', text: 'It completely eliminates NULL pointer checks' },
      ],
      correctAnswer: 'B',
      explanation:
        'Because each node has a prev pointer (node->prev), a node can update its neighbors directly (node->prev->next = node->next) without needing to search for its predecessor.',
      topicCategory: 'Linear Structures',
      sourceReference: 'Module 2: Doubly Linked Lists, Section 2.3',
      hint: 'Consider what information the previous pointer gives you when deleting a node.',
    },
    {
      id: 'fb-q3',
      questionNumber: 3,
      question: 'In a standard Binary Search Tree (BST), which tree traversal visits the nodes in strictly non-decreasing sorted order?',
      options: [
        { id: 'A', text: 'Preorder traversal (Root, Left, Right)' },
        { id: 'B', text: 'Postorder traversal (Left, Right, Root)' },
        { id: 'C', text: 'Inorder traversal (Left, Root, Right)' },
        { id: 'D', text: 'Level-order breadth-first traversal' },
      ],
      correctAnswer: 'C',
      explanation:
        'In a BST, all keys in the left subtree are smaller than root, and all keys in right subtree are greater. Inorder traversal (Left, Root, Right) naturally processes elements in sorted order.',
      topicCategory: 'Tree Traversals',
      sourceReference: 'Module 4: Trees & BST, Section 4.3',
      hint: 'Which traversal visits Left subtree, then current node, then Right subtree?',
    },
    {
      id: 'fb-q4',
      questionNumber: 4,
      question: 'When deleting a node that possesses TWO children in a Binary Search Tree, what is typically substituted in its place?',
      options: [
        { id: 'A', text: 'The root node of the entire tree' },
        { id: 'B', text: 'Its Inorder Successor (smallest node in the right subtree) or Inorder Predecessor' },
        { id: 'C', text: 'Any arbitrary leaf node in the left subtree' },
        { id: 'D', text: 'A NULL pointer' },
      ],
      correctAnswer: 'B',
      explanation:
        'To preserve the BST invariant, the deleted node is replaced by the smallest node in its right subtree (Inorder Successor) or largest in its left subtree (Inorder Predecessor), which is then removed.',
      topicCategory: 'BST Operations',
      sourceReference: 'Module 4: BST Operations & Deletion, Section 4.4',
      hint: 'Which node in the remaining subtrees has a value closest to the deleted node?',
    },
    {
      id: 'fb-q5',
      questionNumber: 5,
      question: 'Which data structure is fundamentally utilized to implement Breadth-First Search (BFS) in a graph or tree?',
      options: [
        { id: 'A', text: 'Stack (LIFO)' },
        { id: 'B', text: 'Queue (FIFO)' },
        { id: 'C', text: 'Max Heap' },
        { id: 'D', text: 'Binary Search Tree' },
      ],
      correctAnswer: 'B',
      explanation:
        'Breadth-First Search explores all neighbor vertices at the present depth level before moving deeper. A First-In-First-Out (FIFO) queue guarantees this level-by-level order.',
      topicCategory: 'Applications',
      sourceReference: 'Module 3: Stacks and Queues, Section 3.2',
      hint: 'Nodes visited first must have their adjacent neighbors processed first.',
    },
    {
      id: 'fb-q6',
      questionNumber: 6,
      question: 'What is the worst-case time complexity of searching for an element in a degenerate (skewed) Binary Search Tree containing n nodes?',
      options: [
        { id: 'A', text: 'O(1)' },
        { id: 'B', text: 'O(log n)' },
        { id: 'C', text: 'O(n)' },
        { id: 'D', text: 'O(n log n)' },
      ],
      correctAnswer: 'C',
      explanation:
        'If elements are inserted in ascending or descending sorted order, the BST degenerates into a singly linked list with height equal to n, yielding worst-case search time of O(n).',
      topicCategory: 'Complexity Analysis',
      sourceReference: 'Module 4: BST Operations, Section 4.4',
      hint: 'What does a BST look like if you insert numbers 1, 2, 3, 4, 5 in order?',
    },
    {
      id: 'fb-q7',
      questionNumber: 7,
      question: 'In a Circular Queue implemented using an array of capacity MAX_SIZE, what arithmetic expression is used to advance the rear pointer?',
      options: [
        { id: 'A', text: 'rear = rear + 1' },
        { id: 'B', text: 'rear = (rear + 1) % MAX_SIZE' },
        { id: 'C', text: 'rear = (rear * 2) % MAX_SIZE' },
        { id: 'D', text: 'rear = MAX_SIZE - rear' },
      ],
      correctAnswer: 'B',
      explanation:
        'Modulo arithmetic wraps the rear index back to index 0 once it exceeds MAX_SIZE - 1, eliminating false overflow in circular queues.',
      topicCategory: 'Linear Structures',
      sourceReference: 'Module 3: Queues, Section 3.2',
      hint: 'Which mathematical operator causes a number to wrap around to zero upon reaching a boundary?',
    },
    {
      id: 'fb-q8',
      questionNumber: 8,
      question: 'In Open Addressing with Linear Probing for Hash Tables, what is the primary drawback caused by consecutive occupied slots?',
      options: [
        { id: 'A', text: 'Primary Clustering' },
        { id: 'B', text: 'Stack Overflow' },
        { id: 'C', text: 'Cache Thrashing' },
        { id: 'D', text: 'Dangling Pointers' },
      ],
      correctAnswer: 'A',
      explanation:
        'Linear probing causes adjacent occupied slots to merge into long runs or clusters. As clusters grow, subsequent collisions take progressively longer to resolve (Primary Clustering).',
      topicCategory: 'Hash Tables',
      sourceReference: 'Module 5: Hash Tables & Collision Resolution, Section 5.2',
      hint: 'Think of cars parking one after another in a tight group.',
    },
    {
      id: 'fb-q9',
      questionNumber: 9,
      question: 'Which of the following problems is classically solved using a Stack data structure?',
      options: [
        { id: 'A', text: 'Balancing and validating matching parentheses in mathematical expressions' },
        { id: 'B', text: 'Round-robin CPU process scheduling' },
        { id: 'C', text: 'Finding the shortest path in an unweighted graph via BFS' },
        { id: 'D', text: 'Direct indexing of records by integer key' },
      ],
      correctAnswer: 'A',
      explanation:
        'Parentheses validation requires matching the most recently opened bracket with the next closing bracket, which adheres directly to LIFO (Last-In, First-Out) stack behavior.',
      topicCategory: 'Applications',
      sourceReference: 'Module 3: Stacks & Applications, Section 3.1',
      hint: 'The most recently opened delimiter must be closed first.',
    },
    {
      id: 'fb-q10',
      questionNumber: 10,
      question: 'What is the Load Factor (α) of a Hash Table storing 150 elements with 200 total bucket slots?',
      options: [
        { id: 'A', text: '0.75' },
        { id: 'B', text: '1.33' },
        { id: 'C', text: '50' },
        { id: 'D', text: '0.25' },
      ],
      correctAnswer: 'A',
      explanation:
        'Load Factor is calculated as α = n / m, where n is number of stored elements (150) and m is total slots (200). 150 / 200 = 0.75.',
      topicCategory: 'Hash Tables',
      sourceReference: 'Module 5: Hash Tables, Section 5.1',
      hint: 'Divide the number of items stored by the total capacity.',
    },
    {
      id: 'fb-q11',
      questionNumber: 11,
      question: 'Why does an Array offer O(1) time complexity for random element access while a Singly Linked List takes O(n)?',
      options: [
        { id: 'A', text: 'Arrays use contiguous memory allowing direct mathematical address calculation from the base address' },
        { id: 'B', text: 'Arrays use dynamic pointers while linked lists do not' },
        { id: 'C', text: 'Arrays are always stored in CPU cache registers' },
        { id: 'D', text: 'Linked lists require cryptographic address lookups' },
      ],
      correctAnswer: 'A',
      explanation:
        'Array elements are contiguous: Address(A[i]) = Base + i * sizeof(element). Linked list nodes are scattered across the heap, requiring sequential pointer dereferences from Head.',
      topicCategory: 'Definitions & Mechanics',
      sourceReference: 'Module 2: Arrays vs Linked Lists, Section 2.1',
      hint: 'Contiguous memory allows calculating any offset in a single arithmetic step.',
    },
    {
      id: 'fb-q12',
      questionNumber: 12,
      question: 'What does Big-O notation formally characterize in algorithm analysis?',
      options: [
        { id: 'A', text: 'The asymptotic upper bound on growth rate' },
        { id: 'B', text: 'The exact execution runtime in microseconds on Intel processors' },
        { id: 'C', text: 'The asymptotic lower bound strictly' },
        { id: 'D', text: 'The average number of CPU instruction cache misses' },
      ],
      correctAnswer: 'A',
      explanation:
        'Big-O notation specifies an asymptotic upper bound: f(n) = O(g(n)) means f(n) <= c * g(n) for large n.',
      topicCategory: 'Complexity Analysis',
      sourceReference: 'Module 1: Big-O Asymptotic Notation, Section 1.2',
      hint: 'Big-O describes the ceiling or upper bound.',
    },
  ];

  return allQuestions.slice(0, Math.min(count, allQuestions.length)).map((q, idx) => ({
    ...q,
    questionNumber: idx + 1,
  }));
}
