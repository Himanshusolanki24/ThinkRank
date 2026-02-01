/**
 * Question Bank with structured questions for follow-up engine
 * Each question includes topic, subtopic, difficulty, expected keywords, and follow-ups
 */

const questionBank = {
    React: {
        useEffect: {
            easy: [
                {
                    question: "What is the purpose of the useEffect hook in React?",
                    expected_keywords: ["side effects", "lifecycle", "component", "render", "mount"],
                    follow_ups: {
                        wrong: ["Can you describe what happens when a React component first appears on the screen?"],
                        partial: ["Can you give me a specific example of a side effect you would handle with useEffect?"],
                        correct: ["How would you clean up side effects in useEffect, and why is this important?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Explain the dependency array in useEffect. What happens if you pass an empty array vs no array at all?",
                    expected_keywords: ["dependency", "empty array", "mount", "every render", "re-run", "infinite loop"],
                    follow_ups: {
                        wrong: ["What do you think happens if the code inside useEffect runs after every single render?"],
                        partial: ["What specific problem might occur if you forget to add a variable to the dependency array?"],
                        correct: ["How would you prevent a useEffect from running on mount but only on subsequent updates?"]
                    }
                }
            ],
            hard: [
                {
                    question: "How would you implement a debounced search with useEffect that properly handles cleanup and race conditions?",
                    expected_keywords: ["cleanup", "timeout", "clearTimeout", "AbortController", "race condition", "stale", "cancel"],
                    follow_ups: {
                        wrong: ["What is a race condition in the context of API calls, and why might it be a problem?"],
                        partial: ["How would you cancel a pending API request when the component unmounts or the search term changes?"],
                        correct: ["What are the trade-offs between using AbortController vs a cleanup flag for handling race conditions?"]
                    }
                }
            ]
        },
        useState: {
            easy: [
                {
                    question: "What is useState in React and how do you use it?",
                    expected_keywords: ["state", "hook", "functional component", "re-render", "initial value"],
                    follow_ups: {
                        wrong: ["Do you know what 'state' means in a web application?"],
                        partial: ["What happens to the component when you call the setState function?"],
                        correct: ["When would you use useState vs useReducer for managing state?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Why is it important to use the functional update form of setState when the new state depends on the previous state?",
                    expected_keywords: ["previous state", "stale", "closure", "batch", "async", "functional update"],
                    follow_ups: {
                        wrong: ["What do you think happens when you call setState multiple times in a row very quickly?"],
                        partial: ["Can you explain what a closure is and how it relates to state values?"],
                        correct: ["How does React's batching of state updates affect when you need functional updates?"]
                    }
                }
            ]
        },
        hooks: {
            easy: [
                {
                    question: "What are the rules of hooks in React?",
                    expected_keywords: ["top level", "conditional", "loop", "function component", "order"],
                    follow_ups: {
                        wrong: ["Do you know why React needs to track hooks in a specific order?"],
                        partial: ["What error would you see if you called a hook inside an if statement?"],
                        correct: ["How does React's internal implementation use the order of hooks to manage state?"]
                    }
                }
            ]
        }
    },
    JavaScript: {
        closures: {
            easy: [
                {
                    question: "What is a closure in JavaScript?",
                    expected_keywords: ["function", "scope", "outer", "variable", "access", "lexical"],
                    follow_ups: {
                        wrong: ["What do you understand about how JavaScript functions access variables?"],
                        partial: ["Can you give a simple example where a function remembers a variable from its outer scope?"],
                        correct: ["What are some practical use cases for closures in real applications?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Explain the classic closure problem with loops and setTimeout, and how to fix it.",
                    expected_keywords: ["var", "let", "block scope", "IIFE", "shared variable", "increment"],
                    follow_ups: {
                        wrong: ["Do you know the difference between var and let in terms of scope?"],
                        partial: ["How does using let instead of var inside a loop change the behavior?"],
                        correct: ["Besides let and IIFE, what other patterns could you use to capture loop values correctly?"]
                    }
                }
            ]
        },
        async: {
            easy: [
                {
                    question: "What is the difference between synchronous and asynchronous code in JavaScript?",
                    expected_keywords: ["blocking", "non-blocking", "wait", "callback", "event loop"],
                    follow_ups: {
                        wrong: ["What happens to your webpage if one operation takes a very long time to complete?"],
                        partial: ["Can you give an example of something that should be asynchronous in a web app?"],
                        correct: ["How does the event loop handle async operations in JavaScript?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Explain the difference between Promise.all, Promise.race, and Promise.allSettled.",
                    expected_keywords: ["all", "race", "allSettled", "reject", "first", "settle", "parallel"],
                    follow_ups: {
                        wrong: ["Do you know what a Promise represents in JavaScript?"],
                        partial: ["What happens to Promise.all if one of the promises rejects?"],
                        correct: ["When would you choose Promise.allSettled over Promise.all in a real application?"]
                    }
                }
            ]
        },
        eventLoop: {
            hard: [
                {
                    question: "Explain the difference between the microtask queue and the macrotask queue, and give examples of each.",
                    expected_keywords: ["microtask", "macrotask", "Promise", "setTimeout", "priority", "event loop"],
                    follow_ups: {
                        wrong: ["Do you know what the event loop does in JavaScript?"],
                        partial: ["In what order would a Promise.then callback and a setTimeout callback execute?"],
                        correct: ["How might knowledge of microtasks and macrotasks affect how you debug async issues?"]
                    }
                }
            ]
        }
    },
    DBMS: {
        sqlJoins: {
            easy: [
                {
                    question: "What is the difference between INNER JOIN and LEFT JOIN in SQL?",
                    expected_keywords: ["inner", "left", "matching", "null", "all rows", "outer"],
                    follow_ups: {
                        wrong: ["What do you think a JOIN does in a database query?"],
                        partial: ["What happens to rows in the left table that don't have a match when using LEFT JOIN?"],
                        correct: ["When would you prefer a LEFT JOIN over an INNER JOIN in a real application?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Explain what a self-join is and provide a use case for it.",
                    expected_keywords: ["same table", "alias", "hierarchy", "manager", "employee", "relationship"],
                    follow_ups: {
                        wrong: ["Have you worked with joining tables together in SQL?"],
                        partial: ["How would you use a self-join to find employees and their managers from the same table?"],
                        correct: ["What are the performance considerations when doing self-joins on large tables?"]
                    }
                }
            ]
        },
        indexing: {
            medium: [
                {
                    question: "How do database indexes improve query performance, and what are the trade-offs?",
                    expected_keywords: ["B-tree", "lookup", "write", "storage", "select", "insert", "update"],
                    follow_ups: {
                        wrong: ["What do you think makes some database queries faster than others?"],
                        partial: ["What happens to insert/update performance when you add more indexes?"],
                        correct: ["How would you decide which columns to index in a production database?"]
                    }
                }
            ]
        }
    },
    DataStructures: {
        arrays: {
            easy: [
                {
                    question: "What is the time complexity of accessing an element by index in an array?",
                    expected_keywords: ["O(1)", "constant", "index", "memory", "offset"],
                    follow_ups: {
                        wrong: ["Do you know what time complexity or Big O notation means?"],
                        partial: ["Why is accessing by index so fast compared to searching for a value?"],
                        correct: ["How does the time complexity change for insertion at the beginning vs end of an array?"]
                    }
                }
            ],
            medium: [
                {
                    question: "How would you find the two numbers in an array that sum to a target value with optimal time complexity?",
                    expected_keywords: ["hash map", "O(n)", "complement", "one pass", "two pointer"],
                    follow_ups: {
                        wrong: ["What is the brute force approach to this problem and its time complexity?"],
                        partial: ["How does using a hash map help reduce the time complexity?"],
                        correct: ["Can you also solve this with two pointers? What's the trade-off?"]
                    }
                }
            ]
        },
        trees: {
            medium: [
                {
                    question: "Explain the difference between BFS and DFS for tree traversal.",
                    expected_keywords: ["breadth", "depth", "queue", "stack", "level", "recursive"],
                    follow_ups: {
                        wrong: ["Do you know what tree traversal means?"],
                        partial: ["What data structure would you use to implement BFS?"],
                        correct: ["When would you choose BFS over DFS for a specific problem?"]
                    }
                }
            ]
        }
    },
    Communication: {
        teamwork: {
            easy: [
                {
                    question: "Describe a situation where you had to work with a difficult team member. How did you handle it?",
                    expected_keywords: ["communication", "listen", "understand", "collaborate", "resolve", "compromise"],
                    follow_ups: {
                        wrong: ["What approaches do you think are important when dealing with disagreements?"],
                        partial: ["What was the outcome of that situation? What did you learn?"],
                        correct: ["How has that experience changed how you approach team conflicts now?"]
                    }
                }
            ]
        }
    },
    HTML: {
        semantics: {
            easy: [
                {
                    question: "What is semantic HTML and why is it important?",
                    expected_keywords: ["meaning", "accessibility", "SEO", "screen reader", "header", "footer", "article", "section"],
                    follow_ups: {
                        wrong: ["Do you know what HTML tags like header, nav, and footer are used for?"],
                        partial: ["Can you give examples of semantic tags and when you would use them?"],
                        correct: ["How does semantic HTML affect accessibility and SEO specifically?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Explain the difference between div/span and semantic HTML5 elements. When should you use each?",
                    expected_keywords: ["div", "span", "semantic", "meaning", "accessibility", "structure", "generic"],
                    follow_ups: {
                        wrong: ["What is the purpose of div and span elements in HTML?"],
                        partial: ["How would you structure a blog post page using semantic HTML?"],
                        correct: ["How do assistive technologies interpret semantic elements differently from divs?"]
                    }
                }
            ]
        },
        forms: {
            easy: [
                {
                    question: "What are the key attributes of an HTML form element and how do you handle form submission?",
                    expected_keywords: ["action", "method", "submit", "input", "GET", "POST", "validation"],
                    follow_ups: {
                        wrong: ["What happens when a user clicks a submit button in a form?"],
                        partial: ["What is the difference between GET and POST methods for forms?"],
                        correct: ["How would you implement client-side validation before form submission?"]
                    }
                }
            ]
        }
    },
    CSS: {
        flexbox: {
            easy: [
                {
                    question: "What is CSS Flexbox and what problem does it solve?",
                    expected_keywords: ["layout", "align", "justify", "container", "direction", "responsive", "one-dimensional"],
                    follow_ups: {
                        wrong: ["How do you typically arrange elements in a row or column?"],
                        partial: ["What is the difference between justify-content and align-items?"],
                        correct: ["When would you choose Flexbox over CSS Grid for layout?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Explain flex-grow, flex-shrink, and flex-basis properties in Flexbox.",
                    expected_keywords: ["grow", "shrink", "basis", "space", "distribute", "available"],
                    follow_ups: {
                        wrong: ["What happens when flex items don't fit in the container?"],
                        partial: ["How does flex-basis differ from width property?"],
                        correct: ["How would you create a layout where one item takes remaining space?"]
                    }
                }
            ]
        },
        grid: {
            medium: [
                {
                    question: "How does CSS Grid differ from Flexbox? When would you use Grid?",
                    expected_keywords: ["two-dimensional", "rows", "columns", "template", "gap", "complex layouts"],
                    follow_ups: {
                        wrong: ["Have you worked with multi-column layouts in CSS?"],
                        partial: ["Can you describe a layout that is easier with Grid than Flexbox?"],
                        correct: ["How would you create a responsive grid that changes columns based on screen size?"]
                    }
                }
            ]
        },
        positioning: {
            easy: [
                {
                    question: "Explain the different CSS position values and when to use each.",
                    expected_keywords: ["static", "relative", "absolute", "fixed", "sticky", "document flow"],
                    follow_ups: {
                        wrong: ["What is the default position value for HTML elements?"],
                        partial: ["What is the difference between relative and absolute positioning?"],
                        correct: ["How would you create a sticky navigation bar that stays on scroll?"]
                    }
                }
            ]
        }
    },
    TypeScript: {
        types: {
            easy: [
                {
                    question: "What are the benefits of using TypeScript over plain JavaScript?",
                    expected_keywords: ["type safety", "compile", "error", "IDE", "autocomplete", "refactoring", "maintainability"],
                    follow_ups: {
                        wrong: ["What problems might occur when variables have unexpected types?"],
                        partial: ["How does TypeScript catch errors before runtime?"],
                        correct: ["What are some cases where TypeScript might be overkill for a project?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Explain the difference between interface and type alias in TypeScript. When would you use each?",
                    expected_keywords: ["interface", "type", "extend", "implements", "union", "intersection", "declaration merging"],
                    follow_ups: {
                        wrong: ["Do you know how to define the shape of an object in TypeScript?"],
                        partial: ["Can interfaces be extended or merged? What about type aliases?"],
                        correct: ["How do you decide between interface and type in a real project?"]
                    }
                }
            ]
        },
        generics: {
            medium: [
                {
                    question: "What are generics in TypeScript and why are they useful?",
                    expected_keywords: ["reusable", "type parameter", "T", "constraint", "flexible", "type-safe"],
                    follow_ups: {
                        wrong: ["Have you needed to write a function that works with multiple types?"],
                        partial: ["Can you give an example of a generic function or type?"],
                        correct: ["How do generic constraints help enforce type requirements?"]
                    }
                }
            ],
            hard: [
                {
                    question: "Explain how to use conditional types and the infer keyword in TypeScript.",
                    expected_keywords: ["conditional", "extends", "infer", "utility types", "ReturnType", "Parameters"],
                    follow_ups: {
                        wrong: ["Do you know what utility types like Partial or Required do?"],
                        partial: ["How would you extract the return type of a function using TypeScript?"],
                        correct: ["Can you create a custom utility type using conditional types?"]
                    }
                }
            ]
        }
    },
    Python: {
        basics: {
            easy: [
                {
                    question: "What are the key differences between lists and tuples in Python?",
                    expected_keywords: ["mutable", "immutable", "list", "tuple", "modify", "ordered", "hashable"],
                    follow_ups: {
                        wrong: ["Do you know what mutable and immutable mean in programming?"],
                        partial: ["When would you choose a tuple over a list?"],
                        correct: ["How does immutability of tuples affect memory and performance?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Explain list comprehensions in Python. How do they compare to regular loops?",
                    expected_keywords: ["comprehension", "concise", "iterate", "filter", "transform", "readable"],
                    follow_ups: {
                        wrong: ["How would you create a list from transforming elements of another list?"],
                        partial: ["Can you add conditions to filter elements in a list comprehension?"],
                        correct: ["When might a regular loop be preferable over a list comprehension?"]
                    }
                }
            ]
        },
        oop: {
            medium: [
                {
                    question: "Explain the concept of decorators in Python and give a use case.",
                    expected_keywords: ["decorator", "wrapper", "function", "@", "modify", "behavior", "logging", "timing"],
                    follow_ups: {
                        wrong: ["What does the @ symbol mean when placed above a function?"],
                        partial: ["How would you write a decorator that logs function calls?"],
                        correct: ["How do you pass arguments to a decorator itself?"]
                    }
                }
            ]
        }
    },
    NodeJS: {
        basics: {
            easy: [
                {
                    question: "What is Node.js and what makes it different from browser JavaScript?",
                    expected_keywords: ["server", "runtime", "V8", "event-driven", "non-blocking", "backend", "npm"],
                    follow_ups: {
                        wrong: ["Do you know where JavaScript traditionally runs?"],
                        partial: ["What does 'event-driven' or 'non-blocking' mean in Node.js?"],
                        correct: ["What types of applications is Node.js particularly good for?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Explain the difference between require and import in Node.js.",
                    expected_keywords: ["CommonJS", "ES modules", "require", "import", "dynamic", "static", "module"],
                    follow_ups: {
                        wrong: ["How do you include code from another file in Node.js?"],
                        partial: ["What is the difference between CommonJS and ES modules?"],
                        correct: ["How do you configure a Node.js project to use ES modules?"]
                    }
                }
            ]
        },
        async: {
            medium: [
                {
                    question: "How does Node.js handle asynchronous operations? Explain the event loop.",
                    expected_keywords: ["event loop", "callback", "queue", "non-blocking", "single thread", "I/O"],
                    follow_ups: {
                        wrong: ["What happens when Node.js needs to read a file from disk?"],
                        partial: ["How does Node.js handle many concurrent requests with a single thread?"],
                        correct: ["What are the different phases of the Node.js event loop?"]
                    }
                }
            ]
        },
        express: {
            easy: [
                {
                    question: "What is Express.js and how do you create a basic route?",
                    expected_keywords: ["framework", "route", "middleware", "GET", "POST", "request", "response"],
                    follow_ups: {
                        wrong: ["Do you know what a web server framework does?"],
                        partial: ["How do you add middleware to an Express application?"],
                        correct: ["How would you structure routes in a large Express application?"]
                    }
                }
            ]
        }
    },
    CPP: {
        basics: {
            easy: [
                {
                    question: "What is the difference between pointers and references in C++?",
                    expected_keywords: ["pointer", "reference", "memory", "address", "null", "dereference", "&", "*"],
                    follow_ups: {
                        wrong: ["Do you know how memory addresses work in C++?"],
                        partial: ["Can a reference be null or reassigned?"],
                        correct: ["When would you prefer a reference over a pointer as a function parameter?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Explain the RAII principle in C++ and how it helps with resource management.",
                    expected_keywords: ["RAII", "resource", "constructor", "destructor", "scope", "automatic", "smart pointer"],
                    follow_ups: {
                        wrong: ["What happens to local objects when a function ends?"],
                        partial: ["How do smart pointers use RAII to manage memory?"],
                        correct: ["How would you implement a custom RAII wrapper for a resource?"]
                    }
                }
            ]
        },
        memory: {
            medium: [
                {
                    question: "Explain the difference between stack and heap memory allocation in C++.",
                    expected_keywords: ["stack", "heap", "new", "delete", "automatic", "dynamic", "lifetime"],
                    follow_ups: {
                        wrong: ["Where are local variables stored in memory?"],
                        partial: ["When do you need to use heap allocation instead of stack?"],
                        correct: ["What are the performance implications of stack vs heap allocation?"]
                    }
                }
            ]
        }
    },
    C: {
        basics: {
            easy: [
                {
                    question: "What is a pointer in C and how do you use it?",
                    expected_keywords: ["pointer", "memory", "address", "*", "&", "dereference", "variable"],
                    follow_ups: {
                        wrong: ["What is a memory address?"],
                        partial: ["How would you pass a variable by reference using pointers?"],
                        correct: ["What are the dangers of using pointers incorrectly?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Explain dynamic memory allocation in C using malloc, calloc, and free.",
                    expected_keywords: ["malloc", "calloc", "free", "heap", "memory leak", "pointer", "size"],
                    follow_ups: {
                        wrong: ["What happens if you don't have enough memory for your data?"],
                        partial: ["What is the difference between malloc and calloc?"],
                        correct: ["How do you avoid memory leaks when using dynamic memory?"]
                    }
                }
            ]
        },
        dataStructures: {
            medium: [
                {
                    question: "How would you implement a linked list in C?",
                    expected_keywords: ["struct", "pointer", "node", "next", "malloc", "traverse", "insert"],
                    follow_ups: {
                        wrong: ["What is a linked list and how is it different from an array?"],
                        partial: ["How do you traverse a linked list to find an element?"],
                        correct: ["What are the time complexity trade-offs between linked lists and arrays?"]
                    }
                }
            ]
        }
    },
    SystemDesign: {
        basics: {
            easy: [
                {
                    question: "What is the difference between horizontal and vertical scaling?",
                    expected_keywords: ["horizontal", "vertical", "scale out", "scale up", "servers", "resources", "load"],
                    follow_ups: {
                        wrong: ["What does scaling mean in the context of web applications?"],
                        partial: ["What are the limitations of vertical scaling?"],
                        correct: ["What challenges arise when scaling horizontally?"]
                    }
                }
            ],
            medium: [
                {
                    question: "Explain the concept of caching and when you would use it.",
                    expected_keywords: ["cache", "memory", "fast", "hit", "miss", "TTL", "Redis", "invalidation"],
                    follow_ups: {
                        wrong: ["What is the purpose of storing data in memory vs disk?"],
                        partial: ["When does cached data become stale and how do you handle it?"],
                        correct: ["What caching strategies would you use for different types of data?"]
                    }
                }
            ]
        }
    },
    Algorithms: {
        sorting: {
            easy: [
                {
                    question: "Explain the difference between bubble sort and quick sort.",
                    expected_keywords: ["bubble", "quick", "O(n²)", "O(n log n)", "pivot", "partition", "comparison"],
                    follow_ups: {
                        wrong: ["What is time complexity and why does it matter?"],
                        partial: ["What is the average time complexity of quick sort?"],
                        correct: ["In what cases might quick sort perform poorly?"]
                    }
                }
            ],
            medium: [
                {
                    question: "How does merge sort work and what is its time complexity?",
                    expected_keywords: ["divide", "conquer", "merge", "O(n log n)", "stable", "recursive", "space"],
                    follow_ups: {
                        wrong: ["What is the divide and conquer approach?"],
                        partial: ["What is the space complexity of merge sort?"],
                        correct: ["When would you prefer merge sort over quick sort?"]
                    }
                }
            ]
        },
        searching: {
            easy: [
                {
                    question: "Explain binary search and when you can use it.",
                    expected_keywords: ["binary", "sorted", "half", "O(log n)", "middle", "divide"],
                    follow_ups: {
                        wrong: ["What is the simplest way to search for an element in an array?"],
                        partial: ["Why does binary search require a sorted array?"],
                        correct: ["How would you find the first occurrence of a value using binary search?"]
                    }
                }
            ]
        }
    }
};

/**
 * Get a question for a specific topic and subtopic
 */
const getQuestionForTopic = (topic, subtopic, difficulty = "easy") => {
    const topicData = questionBank[topic];
    if (!topicData) return null;

    const subtopicData = topicData[subtopic];
    if (!subtopicData) return null;

    const difficultyQuestions = subtopicData[difficulty];
    if (!difficultyQuestions || difficultyQuestions.length === 0) {
        // Fall back to easier difficulty if requested difficulty not available
        const fallbackOrder = ["easy", "medium", "hard"];
        for (const d of fallbackOrder) {
            if (subtopicData[d] && subtopicData[d].length > 0) {
                return subtopicData[d][0];
            }
        }
        return null;
    }

    return difficultyQuestions[Math.floor(Math.random() * difficultyQuestions.length)];
};

/**
 * Get all available topics
 */
const getAvailableTopics = () => {
    return Object.keys(questionBank);
};

/**
 * Get subtopics for a topic
 */
const getSubtopicsForTopic = (topic) => {
    const topicData = questionBank[topic];
    return topicData ? Object.keys(topicData) : [];
};

/**
 * Match user skills to available topics
 * Enhanced with explicit skill-to-topic mapping for better coverage
 */
const matchSkillsToTopics = (userSkills) => {
    const availableTopics = getAvailableTopics();
    const matched = [];

    // Explicit skill-to-topic mapping for common skill names
    const skillMapping = {
        // JavaScript variants
        'javascript': 'JavaScript',
        'js': 'JavaScript',
        'es6': 'JavaScript',
        'ecmascript': 'JavaScript',
        // TypeScript
        'typescript': 'TypeScript',
        'ts': 'TypeScript',
        // React variants
        'react': 'React',
        'react.js': 'React',
        'reactjs': 'React',
        'react native': 'React',
        // Node.js variants
        'node': 'NodeJS',
        'node.js': 'NodeJS',
        'nodejs': 'NodeJS',
        'express': 'NodeJS',
        'express.js': 'NodeJS',
        'expressjs': 'NodeJS',
        // HTML/CSS
        'html': 'HTML',
        'html5': 'HTML',
        'css': 'CSS',
        'css3': 'CSS',
        'scss': 'CSS',
        'sass': 'CSS',
        'tailwind': 'CSS',
        'tailwindcss': 'CSS',
        // C/C++
        'c': 'C',
        'c language': 'C',
        'c++': 'CPP',
        'cpp': 'CPP',
        'c plus plus': 'CPP',
        // Python
        'python': 'Python',
        'python3': 'Python',
        'django': 'Python',
        'flask': 'Python',
        // Database
        'sql': 'DBMS',
        'mysql': 'DBMS',
        'postgresql': 'DBMS',
        'database': 'DBMS',
        'mongodb': 'DBMS',
        // Data Structures and Algorithms
        'dsa': 'DataStructures',
        'data structures': 'DataStructures',
        'algorithms': 'Algorithms',
        'algorithm': 'Algorithms',
        // System Design
        'system design': 'SystemDesign',
        'design patterns': 'SystemDesign'
    };

    for (const skill of userSkills) {
        const normalizedSkill = skill.toLowerCase().trim();

        // First check explicit mapping
        if (skillMapping[normalizedSkill]) {
            const mappedTopic = skillMapping[normalizedSkill];
            if (!matched.includes(mappedTopic)) {
                matched.push(mappedTopic);
            }
            continue;
        }

        // Then try partial matching
        for (const topic of availableTopics) {
            if (
                topic.toLowerCase().includes(normalizedSkill) ||
                normalizedSkill.includes(topic.toLowerCase())
            ) {
                if (!matched.includes(topic)) {
                    matched.push(topic);
                }
            }
        }
    }

    // If no matches, return some defaults based on common skills
    if (matched.length === 0) {
        return ["JavaScript", "DataStructures"];
    }

    return matched;
};


/**
 * Get a random initial question based on skills
 */
const getInitialQuestion = (skills) => {
    const topics = matchSkillsToTopics(skills);
    if (topics.length === 0) return null;

    const topic = topics[0];
    const subtopics = getSubtopicsForTopic(topic);
    if (subtopics.length === 0) return null;

    const subtopic = subtopics[Math.floor(Math.random() * subtopics.length)];
    const questionData = getQuestionForTopic(topic, subtopic, "easy");

    if (!questionData) return null;

    return {
        topic,
        subtopic,
        difficulty: "easy",
        ...questionData
    };
};

module.exports = {
    questionBank,
    getQuestionForTopic,
    getAvailableTopics,
    getSubtopicsForTopic,
    matchSkillsToTopics,
    getInitialQuestion
};
