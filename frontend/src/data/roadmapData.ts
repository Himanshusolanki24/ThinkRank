// Learning Roadmap Data
// Data sourced from official documentation and industry-standard learning paths:
// - Web Development: MDN Web Docs, freeCodeCamp curriculum
// - Basic Programming: Python.org, C documentation
// - DSA: GeeksforGeeks, LeetCode patterns
// - System Design: ByteByteGo, Designing Data-Intensive Applications
// - Data Science: Kaggle, Python Data Science Handbook

export interface RoadmapNode {
    id: string;
    title: string;
    description: string;
    icon: string; // Logo identifier
    status: 'locked' | 'active' | 'completed';
    duration: string;
    topics: string[];
    resources: {
        name: string;
        url: string;
        type: 'documentation' | 'tutorial' | 'course' | 'practice';
    }[];
}

export interface LearningPath {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    nodes: RoadmapNode[];
    source: string; // Attribution for data source
}

// Official tech logos as SVG paths or identifiers
export const TECH_LOGOS = {
    html: 'html5',
    css: 'css3',
    javascript: 'javascript',
    typescript: 'typescript',
    react: 'react',
    nodejs: 'nodejs',
    python: 'python',
    c: 'c',
    cpp: 'cpp',
    java: 'java',
    git: 'git',
    github: 'github',
    arrays: 'arrays',
    linkedlist: 'linkedlist',
    trees: 'trees',
    graphs: 'graphs',
    dp: 'dp',
    sorting: 'sorting',
    database: 'database',
    api: 'api',
    cloud: 'cloud',
    microservices: 'microservices',
    pandas: 'pandas',
    numpy: 'numpy',
    matplotlib: 'matplotlib',
    sklearn: 'sklearn',
    tensorflow: 'tensorflow',
};

export const LEARNING_PATHS: LearningPath[] = [
    {
        id: 'web-development',
        title: 'Web Development',
        description: 'Master frontend & backend web technologies',
        icon: 'web',
        color: '#3B82F6',
        gradientFrom: '#3B82F6',
        gradientTo: '#8B5CF6',
        source: 'MDN Web Docs, freeCodeCamp',
        nodes: [
            {
                id: 'html-fundamentals',
                title: 'HTML Fundamentals',
                description: 'Learn the building blocks of web pages',
                icon: 'html',
                status: 'active',
                duration: '1-2 weeks',
                topics: ['Semantic HTML', 'Forms', 'Tables', 'Accessibility'],
                resources: [
                    { name: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', type: 'documentation' },
                    { name: 'freeCodeCamp HTML', url: 'https://www.freecodecamp.org/learn/responsive-web-design/', type: 'course' },
                ],
            },
            {
                id: 'css-styling',
                title: 'CSS Styling',
                description: 'Style and layout your web pages beautifully',
                icon: 'css',
                status: 'locked',
                duration: '2-3 weeks',
                topics: ['Flexbox', 'Grid', 'Animations', 'Responsive Design'],
                resources: [
                    { name: 'MDN CSS Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS', type: 'documentation' },
                    { name: 'CSS Tricks', url: 'https://css-tricks.com/', type: 'tutorial' },
                ],
            },
            {
                id: 'javascript-basics',
                title: 'JavaScript Basics',
                description: 'Add interactivity to your websites',
                icon: 'javascript',
                status: 'locked',
                duration: '3-4 weeks',
                topics: ['Variables', 'Functions', 'Arrays', 'Objects', 'ES6+'],
                resources: [
                    { name: 'JavaScript.info', url: 'https://javascript.info/', type: 'tutorial' },
                    { name: 'MDN JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript', type: 'documentation' },
                ],
            },
            {
                id: 'dom-events',
                title: 'DOM & Events',
                description: 'Manipulate web pages dynamically',
                icon: 'javascript',
                status: 'locked',
                duration: '1-2 weeks',
                topics: ['DOM Manipulation', 'Event Handling', 'Event Delegation'],
                resources: [
                    { name: 'MDN DOM', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model', type: 'documentation' },
                ],
            },
            {
                id: 'git-github',
                title: 'Git & GitHub',
                description: 'Version control and collaboration',
                icon: 'git',
                status: 'locked',
                duration: '1 week',
                topics: ['Git Basics', 'Branching', 'Pull Requests', 'Collaboration'],
                resources: [
                    { name: 'Git Documentation', url: 'https://git-scm.com/doc', type: 'documentation' },
                    { name: 'GitHub Skills', url: 'https://skills.github.com/', type: 'course' },
                ],
            },
            {
                id: 'react-framework',
                title: 'React Framework',
                description: 'Build modern user interfaces',
                icon: 'react',
                status: 'locked',
                duration: '4-6 weeks',
                topics: ['Components', 'Hooks', 'State Management', 'React Router'],
                resources: [
                    { name: 'React Docs', url: 'https://react.dev/', type: 'documentation' },
                    { name: 'React Tutorial', url: 'https://react.dev/learn', type: 'tutorial' },
                ],
            },
        ],
    },
    {
        id: 'basic-programming',
        title: 'Basic Programming',
        description: 'Start your coding journey with fundamentals',
        icon: 'code',
        color: '#10B981',
        gradientFrom: '#10B981',
        gradientTo: '#3B82F6',
        source: 'Python.org, CS50',
        nodes: [
            {
                id: 'programming-concepts',
                title: 'Programming Concepts',
                description: 'Understand core programming ideas',
                icon: 'python',
                status: 'active',
                duration: '1-2 weeks',
                topics: ['Variables', 'Data Types', 'Operators', 'Control Flow'],
                resources: [
                    { name: 'Python.org Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'documentation' },
                    { name: 'CS50 by Harvard', url: 'https://cs50.harvard.edu/', type: 'course' },
                ],
            },
            {
                id: 'functions-modules',
                title: 'Functions & Modules',
                description: 'Organize and reuse your code',
                icon: 'python',
                status: 'locked',
                duration: '1-2 weeks',
                topics: ['Functions', 'Parameters', 'Return Values', 'Modules'],
                resources: [
                    { name: 'Real Python', url: 'https://realpython.com/defining-your-own-python-function/', type: 'tutorial' },
                ],
            },
            {
                id: 'data-structures-basic',
                title: 'Basic Data Structures',
                description: 'Lists, dictionaries, and more',
                icon: 'python',
                status: 'locked',
                duration: '2 weeks',
                topics: ['Lists', 'Tuples', 'Dictionaries', 'Sets'],
                resources: [
                    { name: 'Python Data Structures', url: 'https://docs.python.org/3/tutorial/datastructures.html', type: 'documentation' },
                ],
            },
            {
                id: 'oop-basics',
                title: 'OOP Basics',
                description: 'Object-oriented programming fundamentals',
                icon: 'python',
                status: 'locked',
                duration: '2-3 weeks',
                topics: ['Classes', 'Objects', 'Inheritance', 'Polymorphism'],
                resources: [
                    { name: 'Python OOP', url: 'https://realpython.com/python3-object-oriented-programming/', type: 'tutorial' },
                ],
            },
            {
                id: 'file-handling',
                title: 'File Handling',
                description: 'Read and write files',
                icon: 'python',
                status: 'locked',
                duration: '1 week',
                topics: ['File I/O', 'JSON', 'CSV', 'Exception Handling'],
                resources: [
                    { name: 'Python File I/O', url: 'https://docs.python.org/3/tutorial/inputoutput.html', type: 'documentation' },
                ],
            },
        ],
    },
    {
        id: 'dsa',
        title: 'DSA',
        description: 'Data Structures & Algorithms mastery',
        icon: 'algorithm',
        color: '#F59E0B',
        gradientFrom: '#F59E0B',
        gradientTo: '#EF4444',
        source: 'GeeksforGeeks, LeetCode',
        nodes: [
            {
                id: 'complexity-analysis',
                title: 'Complexity Analysis',
                description: 'Big O notation and efficiency',
                icon: 'arrays',
                status: 'active',
                duration: '1 week',
                topics: ['Time Complexity', 'Space Complexity', 'Big O', 'Best/Worst Case'],
                resources: [
                    { name: 'Big O Cheat Sheet', url: 'https://www.bigocheatsheet.com/', type: 'documentation' },
                    { name: 'GeeksforGeeks Analysis', url: 'https://www.geeksforgeeks.org/analysis-of-algorithms-set-1-asymptotic-analysis/', type: 'tutorial' },
                ],
            },
            {
                id: 'arrays-strings',
                title: 'Arrays & Strings',
                description: 'Linear data structure mastery',
                icon: 'arrays',
                status: 'locked',
                duration: '2 weeks',
                topics: ['Array Operations', 'Two Pointers', 'Sliding Window', 'String Manipulation'],
                resources: [
                    { name: 'LeetCode Arrays', url: 'https://leetcode.com/tag/array/', type: 'practice' },
                ],
            },
            {
                id: 'linked-lists',
                title: 'Linked Lists',
                description: 'Pointer-based data structures',
                icon: 'linkedlist',
                status: 'locked',
                duration: '2 weeks',
                topics: ['Singly Linked', 'Doubly Linked', 'Circular', 'Fast & Slow Pointers'],
                resources: [
                    { name: 'LeetCode Linked Lists', url: 'https://leetcode.com/tag/linked-list/', type: 'practice' },
                ],
            },
            {
                id: 'trees-graphs',
                title: 'Trees & Graphs',
                description: 'Hierarchical and network structures',
                icon: 'trees',
                status: 'locked',
                duration: '3-4 weeks',
                topics: ['Binary Trees', 'BST', 'BFS', 'DFS', 'Graph Algorithms'],
                resources: [
                    { name: 'Visualgo', url: 'https://visualgo.net/', type: 'tutorial' },
                    { name: 'LeetCode Trees', url: 'https://leetcode.com/tag/tree/', type: 'practice' },
                ],
            },
            {
                id: 'dynamic-programming',
                title: 'Dynamic Programming',
                description: 'Optimal substructure problems',
                icon: 'dp',
                status: 'locked',
                duration: '4 weeks',
                topics: ['Memoization', 'Tabulation', '1D DP', '2D DP', 'Classic Problems'],
                resources: [
                    { name: 'NeetCode DP', url: 'https://neetcode.io/roadmap', type: 'tutorial' },
                    { name: 'LeetCode DP', url: 'https://leetcode.com/tag/dynamic-programming/', type: 'practice' },
                ],
            },
            {
                id: 'sorting-searching',
                title: 'Sorting & Searching',
                description: 'Essential algorithms',
                icon: 'sorting',
                status: 'locked',
                duration: '2 weeks',
                topics: ['Quick Sort', 'Merge Sort', 'Binary Search', 'Heap Sort'],
                resources: [
                    { name: 'Sorting Visualizations', url: 'https://www.toptal.com/developers/sorting-algorithms', type: 'tutorial' },
                ],
            },
        ],
    },
    {
        id: 'system-design',
        title: 'System Design',
        description: 'Build scalable distributed systems',
        icon: 'architecture',
        color: '#8B5CF6',
        gradientFrom: '#8B5CF6',
        gradientTo: '#EC4899',
        source: 'ByteByteGo, System Design Primer',
        nodes: [
            {
                id: 'system-design-basics',
                title: 'System Design Basics',
                description: 'Fundamentals of distributed systems',
                icon: 'api',
                status: 'active',
                duration: '1-2 weeks',
                topics: ['Scalability', 'Availability', 'Consistency', 'CAP Theorem'],
                resources: [
                    { name: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'documentation' },
                    { name: 'ByteByteGo', url: 'https://bytebytego.com/', type: 'course' },
                ],
            },
            {
                id: 'databases',
                title: 'Databases',
                description: 'SQL, NoSQL, and data storage',
                icon: 'database',
                status: 'locked',
                duration: '2-3 weeks',
                topics: ['SQL vs NoSQL', 'Indexing', 'Sharding', 'Replication'],
                resources: [
                    { name: 'Database Internals', url: 'https://www.databass.dev/', type: 'documentation' },
                ],
            },
            {
                id: 'caching',
                title: 'Caching',
                description: 'Speed up your systems',
                icon: 'cloud',
                status: 'locked',
                duration: '1-2 weeks',
                topics: ['Cache Strategies', 'Redis', 'CDN', 'Cache Invalidation'],
                resources: [
                    { name: 'Caching Best Practices', url: 'https://aws.amazon.com/caching/', type: 'documentation' },
                ],
            },
            {
                id: 'load-balancing',
                title: 'Load Balancing',
                description: 'Distribute traffic efficiently',
                icon: 'cloud',
                status: 'locked',
                duration: '1 week',
                topics: ['Load Balancer Types', 'Algorithms', 'Health Checks'],
                resources: [
                    { name: 'NGINX Load Balancing', url: 'https://www.nginx.com/resources/glossary/load-balancing/', type: 'documentation' },
                ],
            },
            {
                id: 'microservices',
                title: 'Microservices',
                description: 'Design scalable architectures',
                icon: 'microservices',
                status: 'locked',
                duration: '3-4 weeks',
                topics: ['Service Design', 'API Gateway', 'Event-Driven', 'Message Queues'],
                resources: [
                    { name: 'Microservices.io', url: 'https://microservices.io/', type: 'documentation' },
                ],
            },
        ],
    },
    {
        id: 'data-science',
        title: 'Data Science',
        description: 'Analyze data and build ML models',
        icon: 'data',
        color: '#EC4899',
        gradientFrom: '#EC4899',
        gradientTo: '#F59E0B',
        source: 'Kaggle, Python Data Science Handbook',
        nodes: [
            {
                id: 'python-for-data',
                title: 'Python for Data',
                description: 'Python essentials for data science',
                icon: 'python',
                status: 'active',
                duration: '2 weeks',
                topics: ['NumPy', 'Pandas', 'Data Manipulation'],
                resources: [
                    { name: 'Python Data Science Handbook', url: 'https://jakevdp.github.io/PythonDataScienceHandbook/', type: 'documentation' },
                    { name: 'Kaggle Python Course', url: 'https://www.kaggle.com/learn/python', type: 'course' },
                ],
            },
            {
                id: 'data-visualization',
                title: 'Data Visualization',
                description: 'Create compelling visualizations',
                icon: 'matplotlib',
                status: 'locked',
                duration: '2 weeks',
                topics: ['Matplotlib', 'Seaborn', 'Plotly', 'Dashboard Design'],
                resources: [
                    { name: 'Kaggle Data Viz', url: 'https://www.kaggle.com/learn/data-visualization', type: 'course' },
                ],
            },
            {
                id: 'statistics',
                title: 'Statistics',
                description: 'Statistical foundations',
                icon: 'numpy',
                status: 'locked',
                duration: '2-3 weeks',
                topics: ['Descriptive Stats', 'Probability', 'Hypothesis Testing', 'Correlation'],
                resources: [
                    { name: 'StatQuest', url: 'https://www.youtube.com/c/joshstarmer', type: 'tutorial' },
                ],
            },
            {
                id: 'machine-learning',
                title: 'Machine Learning',
                description: 'Build predictive models',
                icon: 'sklearn',
                status: 'locked',
                duration: '4-6 weeks',
                topics: ['Regression', 'Classification', 'Clustering', 'Model Evaluation'],
                resources: [
                    { name: 'Kaggle ML Course', url: 'https://www.kaggle.com/learn/intro-to-machine-learning', type: 'course' },
                    { name: 'Scikit-learn Docs', url: 'https://scikit-learn.org/stable/tutorial/', type: 'documentation' },
                ],
            },
            {
                id: 'deep-learning',
                title: 'Deep Learning',
                description: 'Neural networks and beyond',
                icon: 'tensorflow',
                status: 'locked',
                duration: '6+ weeks',
                topics: ['Neural Networks', 'CNNs', 'RNNs', 'Transformers'],
                resources: [
                    { name: 'Fast.ai', url: 'https://www.fast.ai/', type: 'course' },
                    { name: 'TensorFlow Tutorials', url: 'https://www.tensorflow.org/tutorials', type: 'tutorial' },
                ],
            },
        ],
    },
    {
        id: 'ai-ml-engineering',
        title: 'AI/ML Engineering',
        description: 'End-to-end machine learning systems & MLOps',
        icon: 'brain',
        color: '#06B6D4',
        gradientFrom: '#06B6D4',
        gradientTo: '#8B5CF6',
        source: 'Google ML Crash Course, Stanford CS229',
        nodes: [
            {
                id: 'ml-foundations',
                title: 'ML Foundations',
                description: 'Mathematical foundations for machine learning',
                icon: 'numpy',
                status: 'active',
                duration: '2-3 weeks',
                topics: ['Linear Algebra', 'Probability & Statistics', 'Calculus', 'Optimization'],
                resources: [
                    { name: 'Mathematics for ML', url: 'https://mml-book.github.io/', type: 'documentation' },
                    { name: '3Blue1Brown Linear Algebra', url: 'https://www.3blue1brown.com/topics/linear-algebra', type: 'tutorial' },
                ],
            },
            {
                id: 'supervised-learning',
                title: 'Supervised Learning',
                description: 'Regression, classification & model evaluation',
                icon: 'sklearn',
                status: 'locked',
                duration: '3-4 weeks',
                topics: ['Linear/Logistic Regression', 'Decision Trees', 'SVMs', 'Ensemble Methods', 'Cross Validation'],
                resources: [
                    { name: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', type: 'course' },
                    { name: 'Scikit-learn Tutorials', url: 'https://scikit-learn.org/stable/tutorial/', type: 'documentation' },
                ],
            },
            {
                id: 'unsupervised-learning',
                title: 'Unsupervised Learning',
                description: 'Clustering, dimensionality reduction & anomaly detection',
                icon: 'sklearn',
                status: 'locked',
                duration: '2-3 weeks',
                topics: ['K-Means', 'DBSCAN', 'PCA', 't-SNE', 'Autoencoders'],
                resources: [
                    { name: 'Stanford CS229 Notes', url: 'https://cs229.stanford.edu/', type: 'documentation' },
                    { name: 'Kaggle Unsupervised ML', url: 'https://www.kaggle.com/learn/intro-to-machine-learning', type: 'course' },
                ],
            },
            {
                id: 'deep-learning-foundations',
                title: 'Deep Learning',
                description: 'Neural networks from scratch to production',
                icon: 'tensorflow',
                status: 'locked',
                duration: '4-6 weeks',
                topics: ['Neural Networks', 'Backpropagation', 'CNNs', 'RNNs/LSTMs', 'Transformers'],
                resources: [
                    { name: 'Fast.ai Practical DL', url: 'https://course.fast.ai/', type: 'course' },
                    { name: 'Deep Learning Book', url: 'https://www.deeplearningbook.org/', type: 'documentation' },
                ],
            },
            {
                id: 'nlp-fundamentals',
                title: 'NLP Fundamentals',
                description: 'Text processing, embeddings & language models',
                icon: 'python',
                status: 'locked',
                duration: '3-4 weeks',
                topics: ['Tokenization', 'Word Embeddings', 'Attention Mechanism', 'BERT/GPT', 'Text Classification'],
                resources: [
                    { name: 'Hugging Face NLP Course', url: 'https://huggingface.co/learn/nlp-course', type: 'course' },
                    { name: 'Stanford CS224N', url: 'https://web.stanford.edu/class/cs224n/', type: 'documentation' },
                ],
            },
            {
                id: 'computer-vision',
                title: 'Computer Vision',
                description: 'Image recognition, detection & segmentation',
                icon: 'tensorflow',
                status: 'locked',
                duration: '3-4 weeks',
                topics: ['Image Classification', 'Object Detection', 'YOLO', 'Image Segmentation', 'GANs'],
                resources: [
                    { name: 'Stanford CS231n', url: 'https://cs231n.stanford.edu/', type: 'documentation' },
                    { name: 'PyTorch Vision Tutorials', url: 'https://pytorch.org/tutorials/', type: 'tutorial' },
                ],
            },
            {
                id: 'mlops-deployment',
                title: 'MLOps & Deployment',
                description: 'Model deployment, monitoring & ML pipelines',
                icon: 'cloud',
                status: 'locked',
                duration: '3-4 weeks',
                topics: ['Model Serving', 'Docker for ML', 'MLflow', 'Feature Stores', 'A/B Testing', 'CI/CD for ML'],
                resources: [
                    { name: 'Made With ML', url: 'https://madewithml.com/', type: 'course' },
                    { name: 'MLOps Guide', url: 'https://ml-ops.org/', type: 'documentation' },
                ],
            },
        ],
    },
    {
        id: 'generative-ai',
        title: 'AI & GenAI',
        description: 'Generative AI, LLMs & AI application development',
        icon: 'sparkle',
        color: '#F59E0B',
        gradientFrom: '#F59E0B',
        gradientTo: '#EC4899',
        source: 'OpenAI Docs, LangChain, DeepLearning.AI',
        nodes: [
            {
                id: 'genai-foundations',
                title: 'GenAI Foundations',
                description: 'Understanding generative models & transformer architecture',
                icon: 'python',
                status: 'active',
                duration: '1-2 weeks',
                topics: ['Transformer Architecture', 'Attention Mechanism', 'Pre-training vs Fine-tuning', 'Foundation Models'],
                resources: [
                    { name: 'Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762', type: 'documentation' },
                    { name: 'DeepLearning.AI GenAI', url: 'https://www.deeplearning.ai/courses/generative-ai-with-llms/', type: 'course' },
                ],
            },
            {
                id: 'prompt-engineering',
                title: 'Prompt Engineering',
                description: 'Master the art of communicating with LLMs',
                icon: 'api',
                status: 'locked',
                duration: '1-2 weeks',
                topics: ['Prompt Design', 'Few-shot Learning', 'Chain-of-Thought', 'System Prompts', 'Output Formatting'],
                resources: [
                    { name: 'OpenAI Prompt Guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering', type: 'documentation' },
                    { name: 'Learn Prompting', url: 'https://learnprompting.org/', type: 'tutorial' },
                ],
            },
            {
                id: 'llm-apis',
                title: 'LLM APIs & SDKs',
                description: 'Build with OpenAI, Anthropic, and open-source LLMs',
                icon: 'api',
                status: 'locked',
                duration: '2-3 weeks',
                topics: ['OpenAI API', 'Anthropic Claude', 'Gemini API', 'Open-source LLMs', 'Streaming & Functions'],
                resources: [
                    { name: 'OpenAI API Docs', url: 'https://platform.openai.com/docs/', type: 'documentation' },
                    { name: 'Anthropic Docs', url: 'https://docs.anthropic.com/', type: 'documentation' },
                ],
            },
            {
                id: 'rag-systems',
                title: 'RAG Systems',
                description: 'Retrieval-Augmented Generation for knowledge-grounded AI',
                icon: 'database',
                status: 'locked',
                duration: '3-4 weeks',
                topics: ['Vector Databases', 'Embeddings', 'Chunking Strategies', 'Hybrid Search', 'Evaluation Metrics'],
                resources: [
                    { name: 'LangChain RAG Tutorial', url: 'https://python.langchain.com/docs/tutorials/rag/', type: 'tutorial' },
                    { name: 'Pinecone Learning', url: 'https://www.pinecone.io/learn/', type: 'documentation' },
                ],
            },
            {
                id: 'ai-agents',
                title: 'AI Agents & Tools',
                description: 'Build autonomous AI agents with tool use',
                icon: 'microservices',
                status: 'locked',
                duration: '3-4 weeks',
                topics: ['Agent Frameworks', 'Tool Calling', 'Memory Systems', 'Multi-Agent Systems', 'LangGraph'],
                resources: [
                    { name: 'LangChain Agents', url: 'https://python.langchain.com/docs/concepts/agents/', type: 'documentation' },
                    { name: 'CrewAI', url: 'https://docs.crewai.com/', type: 'tutorial' },
                ],
            },
            {
                id: 'fine-tuning',
                title: 'Fine-tuning & RLHF',
                description: 'Customize LLMs for specific domains',
                icon: 'tensorflow',
                status: 'locked',
                duration: '3-4 weeks',
                topics: ['LoRA/QLoRA', 'PEFT', 'RLHF', 'DPO', 'Dataset Preparation', 'Evaluation'],
                resources: [
                    { name: 'Hugging Face PEFT', url: 'https://huggingface.co/docs/peft', type: 'documentation' },
                    { name: 'OpenAI Fine-tuning', url: 'https://platform.openai.com/docs/guides/fine-tuning', type: 'tutorial' },
                ],
            },
            {
                id: 'ai-product-deployment',
                title: 'AI Product & Deployment',
                description: 'Ship production AI applications with guardrails',
                icon: 'cloud',
                status: 'locked',
                duration: '3-4 weeks',
                topics: ['AI Safety', 'Guardrails', 'Cost Optimization', 'Latency Optimization', 'Monitoring & Eval'],
                resources: [
                    { name: 'AI Engineering Guide', url: 'https://www.latent.space/', type: 'documentation' },
                    { name: 'Vercel AI SDK', url: 'https://sdk.vercel.ai/docs', type: 'documentation' },
                ],
            },
        ],
    },
];

export const getPathById = (pathId: string): LearningPath | undefined => {
    return LEARNING_PATHS.find(path => path.id === pathId);
};

export const getNodeProgress = (nodes: RoadmapNode[]): { completed: number; total: number; percentage: number } => {
    const completed = nodes.filter(node => node.status === 'completed').length;
    const total = nodes.length;
    return {
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
    };
};
