import { StudyFile } from '../types';

export const SAMPLE_DATA_STRUCTURES_TEXT = `
DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
COURSE CODE: CS204 | DATA STRUCTURES & ALGORITHMS
ACADEMIC COURSE PACK & EXAM REVISION GUIDE

============================================================
MODULE 1: INTRODUCTION TO DATA STRUCTURES & ASYMPTOTIC ANALYSIS
============================================================
1.1 Definition of Data Structure and Abstract Data Types (ADT)
A data structure is a specialized format for organizing, processing, retrieving, and storing data in computer memory efficiently. An Abstract Data Type (ADT) defines the mathematical model of a data structure from the user's perspective, specifying the set of values and allowable operations without detailing the concrete implementation.

1.2 Big-O Asymptotic Notation
Asymptotic notations describe the limiting behavior of an algorithm as the input size (n) approaches infinity.
- Big-O Notation (O): Represents the asymptotic upper bound. Formally, f(n) = O(g(n)) if there exist positive constants c and n0 such that 0 <= f(n) <= c * g(n) for all n >= n0. It characterizes the worst-case scenario.
- Big-Omega Notation (Ω): Represents the asymptotic lower bound (best-case execution limit).
- Big-Theta Notation (Θ): Represents the tight bound where f(n) is bounded both above and below.

Common Complexity Orders (from fastest to slowest):
O(1) Constant Time < O(log n) Logarithmic Time < O(n) Linear Time < O(n log n) Linearithmic Time < O(n^2) Quadratic Time < O(2^n) Exponential Time.

1.3 Space Complexity
Total memory required by an algorithm consists of:
1. Fixed memory: Space for constants, simple variables, and program instructions.
2. Variable memory: Dynamic allocation and call stack overhead in recursion (Auxiliary Space).

============================================================
MODULE 2: ARRAYS VS LINKED LISTS
============================================================
2.1 Arrays
An array is a linear collection of elements of identical data type placed in contiguous memory addresses.
- Access: O(1) random access via index arithmetic: Address(A[i]) = Base_Address + i * sizeof(element).
- Insertion / Deletion at arbitrary index: O(n) due to element shifting.
- Memory: Fixed capacity at declaration time; reallocation requires copying elements to a new memory block.

2.2 Singly Linked Lists
A linked list is a linear data structure where elements (nodes) are stored non-contiguously. Each node contains two fields:
1. Data field: Holds the actual stored value.
2. Next pointer: Stores the memory address of the subsequent node. The terminal node's next pointer equals NULL.
- Head Pointer: Pointer referencing the first node of the list. If Head == NULL, the list is empty.
- Access by index: O(n) sequential traversal from Head.
- Insertion at Head: O(1) time complexity. Steps: Create newNode; newNode->next = Head; Head = newNode.
- Insertion at Tail (without tail pointer): O(n) traversal required to locate node with next == NULL.
- Deletion of Head: O(1) time complexity. Steps: temp = Head; Head = Head->next; free(temp).

2.3 Doubly Linked Lists
Each node contains three fields: data, next pointer, and prev pointer (pointing to the preceding node).
- Advantage: Bidirectional traversal (forward and backward). Deletion of a known node is O(1) without needing predecessor search.
- Disadvantage: Extra 8 bytes (on 64-bit systems) overhead per node for the backward pointer, plus more pointer manipulations on updates.

2.4 Circular Linked Lists
The last node's next pointer points back to the Head node instead of NULL. Useful for round-robin CPU scheduling and streaming media buffers.

============================================================
MODULE 3: STACKS AND QUEUES
============================================================
3.1 Stacks (LIFO - Last In, First Out)
A linear list where insertions and deletions take place at only one designated end called the TOP.
- Primary Operations:
  * push(x): Inserts element x onto top. Returns Stack Overflow error if capacity reached. Time: O(1).
  * pop(): Removes and returns top element. Returns Stack Underflow error if empty. Time: O(1).
  * peek() / top(): Returns current top value without removal. Time: O(1).
  * isEmpty(): Checks if top == -1 (or top == NULL in linked list implementation).
- Key Applications:
  * Function call stack and recursion management.
  * Undo/Redo operations in text editors.
  * Balanced parentheses validation (matching '{', '[', '(').
  * Expression evaluation and conversion: Infix to Postfix (Reverse Polish Notation) using Dijkstra's Shunting-yard algorithm.

3.2 Queues (FIFO - First In, First Out)
A linear list where insertions occur at the REAR end and deletions occur at the FRONT end.
- Primary Operations:
  * enqueue(x): Adds element x to REAR. Time: O(1).
  * dequeue(): Removes element from FRONT. Time: O(1).
  * front() / peek(): Returns front item.
- Implementations & Variations:
  * Linear Queue: Suffers from "false overflow" when rear reaches array capacity while front has advanced.
  * Circular Queue: Solves false overflow using modulo arithmetic: rear = (rear + 1) % MAX_SIZE.
  * Priority Queue: Elements processed by assigned priority rather than insertion order (typically implemented via Binary Heap).
  * Deque (Double-Ended Queue): Allows insertion and deletion at both front and rear.
- Key Applications: CPU job scheduling, printer print spools, Breadth-First Search (BFS) graph traversal.

============================================================
MODULE 4: TREES AND BINARY SEARCH TREES (BST)
============================================================
4.1 Tree Terminology
A tree is a hierarchical, non-linear collection of nodes connected by directed edges.
- Root: Topmost node without a parent.
- Leaf (External Node): Node with zero children.
- Depth of a node: Number of edges from the root to that node.
- Height of a tree: Maximum number of edges from root to the furthest leaf node.

4.2 Binary Search Tree (BST) Properties
A binary tree where each node has at most two children (left and right), satisfying the strict BST Property:
1. For any node N, all values in its left subtree are strictly LESS than N's key.
2. All values in its right subtree are strictly GREATER than N's key.
3. Both left and right subtrees must independently be valid Binary Search Trees.

4.3 Tree Traversals (Depth-First)
- Inorder Traversal (Left, Root, Right): Visits nodes in strictly ascending sorted order for a BST.
- Preorder Traversal (Root, Left, Right): Useful for cloning or serializing a tree structure.
- Postorder Traversal (Left, Right, Root): Essential for bottom-up operations like deleting a tree or calculating directory sizes.
- Breadth-First (Level-Order Traversal): Visits nodes level by level using a FIFO queue.

4.4 BST Operations & Time Complexities
- Search & Insert: Follow comparator at each node.
  * Balanced BST (e.g. AVL, Red-Black Tree): O(log n) time.
  * Skewed / Degenerate BST (inserted in strictly ascending or descending order): O(n) time (degenerates into a linked list).
- Deletion in BST:
  * Case 1: Node to delete is a leaf -> Simply remove pointer from parent.
  * Case 2: Node has one child -> Replace node with its child pointer.
  * Case 3: Node has two children -> Replace node's key with its Inorder Successor (smallest value in the right subtree) or Inorder Predecessor (largest in left subtree), then recursively delete that successor node.

============================================================
MODULE 5: HASH TABLES AND COLLISION RESOLUTION
============================================================
5.1 Hash Function & Load Factor
A hash table maps keys to array buckets using a deterministic hash function: Index = Hash(Key) % Table_Size.
- Desirable properties: Uniform distribution, deterministic output, minimal computation overhead.
- Load Factor (α): α = n / m, where n is number of stored keys and m is total table slots. When α exceeds threshold (typically 0.7 to 0.75), rehashing with a doubled table size is required.

5.2 Collision Resolution Strategies
Collisions occur when two distinct keys hash to the same bucket index (Hash(K1) == Hash(K2)).
1. Separate Chaining:
   Each bucket contains a pointer to a linked list (or balanced tree) of entries.
   * Advantage: Gracefully handles high load factors; table never fills up completely.
   * Disadvantage: Cache unfriendliness due to pointer chasing.
2. Open Addressing:
   All keys are stored directly within the table array without external chaining.
   * Linear Probing: On collision, probe next slot sequentially: (hash(k) + i) % m for i = 1, 2, ... Suffers from Primary Clustering (consecutive filled slots form long clusters).
   * Quadratic Probing: Probes at quadratic intervals: (hash(k) + c1*i + c2*i^2) % m. Eliminates primary clustering but can suffer secondary clustering.
   * Double Hashing: Uses a secondary independent hash function: (hash1(k) + i * hash2(k)) % m. Prevents clustering when hash2(k) is co-prime to table size.

5.3 Performance
Average case lookup, insert, delete: O(1). Worst case (all keys hash to same bucket): O(n).
`;

export const SAMPLE_STUDY_FILE: StudyFile = {
  id: 'sample-dsa-pack-1',
  name: 'CS204_Data_Structures_Exam_Coursepack.txt',
  type: 'text/plain',
  size: 8940,
  extractedText: SAMPLE_DATA_STRUCTURES_TEXT,
  status: 'ready',
  wordCount: 1240,
  detectedTopics: [
    'Entire Material',
    'Big-O Asymptotic Analysis',
    'Arrays vs Linked Lists',
    'Singly and Doubly Linked Lists',
    'Stacks & Applications (LIFO)',
    'Queues & Circular Queues (FIFO)',
    'Binary Search Trees (BST)',
    'Tree Traversals (Inorder, Preorder, Postorder)',
    'BST Deletion Algorithm',
    'Hash Tables & Collision Resolution'
  ],
  uploadedAt: new Date().toISOString()
};
