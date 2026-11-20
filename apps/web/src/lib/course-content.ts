export interface CourseLabTemplate {
  objectiveTitle: string;
  targetRole: string;
  defaultHostIp: string;
  attackPodOrCluster: string;
  devOrAttackPodLabel: string;
  terminalUser: string;
  terminalHostname: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    command: string;
  }>;
  terminalInitialHistory: string[];
  initialModules: Array<{
    id: string;
    title: string;
    type: 'lecture' | 'live' | 'lab' | 'notes';
    duration: string;
    statusBadge?: string;
  }>;
  initialNotes: Array<{
    id: string;
    title: string;
    description: string;
    fileName: string;
    fileSize: string;
  }>;
}

export function getCourseLabTemplate(courseTitle: string, category: string, targetLabIp?: string): CourseLabTemplate {
  const ip = targetLabIp || '10.10.15.50';
  const lowerCat = (category || '').toLowerCase();
  const lowerTitle = (courseTitle || '').toLowerCase();

  // 1. FULL STACK DEVELOPMENT & WEB/SOFTWARE
  if (lowerTitle.includes('full stack') || (lowerCat.includes('web') && !lowerTitle.includes('java') && !lowerTitle.includes('mobile') && !lowerTitle.includes('ui/ux'))) {
    return {
      objectiveTitle: 'Full-Stack MERN Architecture, REST APIs & Cloud Deployment',
      targetRole: 'Full Stack Engineer',
      defaultHostIp: ip,
      attackPodOrCluster: '10.10.14.82 (Dev Cluster)',
      devOrAttackPodLabel: 'Dev Cluster',
      terminalUser: 'developer',
      terminalHostname: 'darkspace-dev',
      steps: [
        {
          stepNumber: 1,
          title: 'REST API MICROSERVICE HEALTH PROBE',
          description: 'Probe backend Express API container and verify route endpoints and CORS configuration:',
          command: `curl -s http://${ip}:5000/api/v1/health | jq .`,
        },
        {
          stepNumber: 2,
          title: 'NEXT.JS SSR SESSION & STATE VERIFICATION',
          description: 'Inspect the Next.js production server-rendered authentication endpoint:',
          command: `curl -s http://${ip}:3000/api/auth/session | jq .`,
        },
        {
          stepNumber: 3,
          title: 'DOCKER COMPOSE CLUSTER ORCHESTRATION',
          description: 'Verify live microservices running across frontend, backend API, and MongoDB replica set:',
          command: 'docker ps --filter "name=dss-prod" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"',
        },
      ],
      terminalInitialHistory: [
        `developer@darkspace-dev:~$ curl -s http://${ip}:5000/api/v1/health | jq .`,
        '{\n  "status": "UP",\n  "cluster": "dss-mern-prod-01",\n  "database": "connected (mongodb://10.10.15.50:27017)",\n  "uptime": "14d 06h 22m"\n}',
        'developer@darkspace-dev:~$ _',
      ],
      initialModules: [
        { id: 'm1', title: '1. Full Stack MERN Architecture & State Management', type: 'lecture', duration: '45 Min' },
        { id: 'm2', title: '2. Live Interactive Class: Building & Deploying Microservices', type: 'live', duration: 'LIVE', statusBadge: 'LIVE' },
        { id: 'm3', title: '3. Hands-on Lab: RESTful API & Next.js Service Mesh', type: 'lab', duration: '+100 pts' },
        { id: 'm4', title: '4. Module Notes & Docker Production Cheatsheet', type: 'notes', duration: 'PDF' },
        { id: 'm5', title: '5. Capstone Project Verification & Code Review', type: 'lab', duration: 'ASSIGNMENT' },
      ],
      initialNotes: [
        { id: 'n1', title: 'Full Stack Production Architecture Blueprint', description: 'Diagrams for Next.js SSR, Express Gateway, JWT refresh rotation, and MongoDB sharding.', fileName: 'fullstack-architecture-v2.pdf', fileSize: '3.4 MB' },
        { id: 'n2', title: 'Docker & Kubernetes Production Cheatsheet', description: 'Handy CLI commands for container builds, ingress routing, and multi-stage Next.js Dockerfiles.', fileName: 'docker-production-cheatsheet.pdf', fileSize: '1.8 MB' },
      ],
    };
  }

  // 2. JAVA (CORE + ADV + JSP)
  if (lowerTitle.includes('java')) {
    return {
      objectiveTitle: 'Enterprise Java Backend, Spring Boot Microservices & JPA',
      targetRole: 'Java Backend Architect',
      defaultHostIp: ip,
      attackPodOrCluster: '10.10.14.82 (App Server)',
      devOrAttackPodLabel: 'App Server',
      terminalUser: 'java-engineer',
      terminalHostname: 'darkspace-enterprise',
      steps: [
        {
          stepNumber: 1,
          title: 'MAVEN BUILD & UNIT TEST EXECUTION',
          description: 'Trigger Maven clean build and run automated JUnit 5 test suites on the service module:',
          command: 'mvn clean test -Dtest=EnterpriseOrderServiceTest',
        },
        {
          stepNumber: 2,
          title: 'SPRING BOOT ACTUATOR & HIKARICP POOL VERIFICATION',
          description: 'Query Spring Boot actuator metrics for connection pool latency and JVM heap allocation:',
          command: `curl -s http://${ip}:8080/actuator/health | jq .`,
        },
        {
          stepNumber: 3,
          title: 'HIBERNATE / JPA TRANSACTION ISOLATION TEST',
          description: 'Test transactional rollback and concurrent database writes under high load:',
          command: `curl -X POST http://${ip}:8080/api/v1/transactions/simulate-load -d '{"concurrency": 200}'`,
        },
      ],
      terminalInitialHistory: [
        `java-engineer@darkspace-enterprise:~$ curl -s http://${ip}:8080/actuator/health | jq .`,
        '{\n  "status": "UP",\n  "components": {\n    "db": { "status": "UP", "database": "PostgreSQL 16" },\n    "diskSpace": { "status": "UP", "free": "84.2GB" }\n  }\n}',
        'java-engineer@darkspace-enterprise:~$ _',
      ],
      initialModules: [
        { id: 'm1', title: '1. Core Java OOP, Multithreading & Memory Management', type: 'lecture', duration: '50 Min' },
        { id: 'm2', title: '2. Live Masterclass: Spring Boot 3 & Microservice Security', type: 'live', duration: 'LIVE', statusBadge: 'LIVE' },
        { id: 'm3', title: '3. Hands-on Lab: Enterprise JPA & Transactional Services', type: 'lab', duration: '+100 pts' },
        { id: 'm4', title: '4. Java Enterprise Patterns & Spring Cloud Notes', type: 'notes', duration: 'PDF' },
      ],
      initialNotes: [
        { id: 'n1', title: 'Java Concurrency & JVM Tuning Guide', description: 'Thread pools, volatile vs synchronized, garbage collection algorithms, and heap optimization.', fileName: 'java-concurrency-guide.pdf', fileSize: '4.1 MB' },
        { id: 'n2', title: 'Spring Boot 3 Microservices Architecture', description: 'Eureka discovery, OpenFeign clients, and Resilience4j circuit breakers.', fileName: 'spring-cloud-reference.pdf', fileSize: '2.9 MB' },
      ],
    };
  }

  // 3. UI/UX DESIGN
  if (lowerTitle.includes('ui/ux') || lowerTitle.includes('design')) {
    return {
      objectiveTitle: 'Design Systems, Cyber UI Micro-Interactions & Figma Tokens',
      targetRole: 'UI/UX Product Designer',
      defaultHostIp: ip,
      attackPodOrCluster: '10.10.14.82 (Design Host)',
      devOrAttackPodLabel: 'Design Host',
      terminalUser: 'designer',
      terminalHostname: 'darkspace-studio',
      steps: [
        {
          stepNumber: 1,
          title: 'DESIGN SYSTEM TOKEN COMPILATION',
          description: 'Validate Tailwind CSS tokens and CSS variables against the dark-mode cyber design spec:',
          command: 'pnpm run tokens:validate --theme darkspace-crimson',
        },
        {
          stepNumber: 2,
          title: 'WCAG 2.2 AA ACCESSIBILITY & CONTRAST AUDIT',
          description: 'Execute automated accessibility test verifying 4.5:1 text contrast on crimson buttons:',
          command: 'npx axe-cli http://localhost:3000/catalog --tags wcag2aa',
        },
      ],
      terminalInitialHistory: [
        'designer@darkspace-studio:~$ pnpm run tokens:validate --theme darkspace-crimson',
        '[PASS] All 48 Design Tokens compliant with WCAG 2.2 AA high contrast standard.',
        'designer@darkspace-studio:~$ _',
      ],
      initialModules: [
        { id: 'm1', title: '1. Cyber UI Design Systems & Dark-Mode Aesthetics', type: 'lecture', duration: '40 Min' },
        { id: 'm2', title: '2. Live Class: Figma Component Variants & Micro-Interactions', type: 'live', duration: 'LIVE', statusBadge: 'LIVE' },
        { id: 'm3', title: '3. Interactive Lab: Building High-Fidelity HUD Dashboards', type: 'lab', duration: '+80 pts' },
        { id: 'm4', title: '4. Figma Design UI Kit & Icon Assets Pack', type: 'notes', duration: 'ASSETS' },
      ],
      initialNotes: [
        { id: 'n1', title: 'Dark Space UI System Specification', description: 'Color hex codes, typography scales, glassmorphism blur recipes, and button state matrices.', fileName: 'darkspace-design-spec.pdf', fileSize: '5.2 MB' },
      ],
    };
  }

  // 4. MOBILE APP DEVELOPMENT
  if (lowerTitle.includes('mobile') || lowerTitle.includes('android') || lowerTitle.includes('ios')) {
    return {
      objectiveTitle: 'Cross-Platform Native Apps with React Native & Flutter',
      targetRole: 'Mobile Software Engineer',
      defaultHostIp: ip,
      attackPodOrCluster: '10.10.14.82 (Emulator Pod)',
      devOrAttackPodLabel: 'Emulator Pod',
      terminalUser: 'mobile-dev',
      terminalHostname: 'darkspace-mobile',
      steps: [
        {
          stepNumber: 1,
          title: 'METRO BUNDLER & APK RELEASE BUILD',
          description: 'Trigger React Native Hermes byte-code compilation for Android release build:',
          command: 'cd android && ./gradlew assembleRelease --no-daemon',
        },
        {
          stepNumber: 2,
          title: 'BIOMETRIC SECURE KEYCHAIN AUDIT',
          description: 'Verify encrypted biometric token storage on Android Keystore / iOS Keychain:',
          command: 'npx react-native-keychain test-encryption',
        },
      ],
      terminalInitialHistory: [
        'mobile-dev@darkspace-mobile:~$ cd android && ./gradlew assembleRelease --no-daemon',
        'BUILD SUCCESSFUL in 42s (APK generated at /build/outputs/apk/release/app-release.apk)',
        'mobile-dev@darkspace-mobile:~$ _',
      ],
      initialModules: [
        { id: 'm1', title: '1. Cross-Platform Mobile Architecture with React Native', type: 'lecture', duration: '45 Min' },
        { id: 'm2', title: '2. Live Class: Native Bridges, Push Notifications & Offline Sync', type: 'live', duration: 'LIVE', statusBadge: 'LIVE' },
        { id: 'm3', title: '3. Hands-on Lab: Secure Authentication & API State Caching', type: 'lab', duration: '+100 pts' },
        { id: 'm4', title: '4. Mobile Architecture & App Store Deployment Checklist', type: 'notes', duration: 'PDF' },
      ],
      initialNotes: [
        { id: 'n1', title: 'Mobile Security & App Publishing Playbook', description: 'Google Play Console and Apple App Store production submission guides and signing certs.', fileName: 'mobile-deployment-playbook.pdf', fileSize: '2.7 MB' },
      ],
    };
  }

  // 5. DATA & AI (Artificial Intelligence, Python AI & ML/DL, Data Science, Data Analyst, Generative AI)
  if (lowerCat.includes('data') || lowerCat.includes('ai') || lowerTitle.includes('python') || lowerTitle.includes('intelligence') || lowerTitle.includes('analyst') || lowerTitle.includes('generative')) {
    return {
      objectiveTitle: 'Machine Learning Pipelines, Transformer LLMs & Neural Networks',
      targetRole: 'AI & Data Research Engineer',
      defaultHostIp: ip,
      attackPodOrCluster: '10.10.14.82 (GPU Node)',
      devOrAttackPodLabel: 'GPU Node',
      terminalUser: 'ai-researcher',
      terminalHostname: 'darkspace-ai',
      steps: [
        {
          stepNumber: 1,
          title: 'DATASET PREPROCESSING & TOKENIZATION',
          description: 'Run Pandas & HuggingFace tokenization pipeline on 500k row clean telemetry dataset:',
          command: 'python3 -m data.preprocess --dataset corpus_clean.parquet --tokenizer bert-base',
        },
        {
          stepNumber: 2,
          title: 'PYTORCH MODEL TRAINING WITH CUDA ACCELERATION',
          description: 'Train deep neural network classifier with mixed precision and gradient accumulation:',
          command: 'python3 train.py --epochs 20 --batch-size 64 --device cuda:0 --fp16',
        },
        {
          stepNumber: 3,
          title: 'FASTAPI INFERENCE BENCHMARK & METRICS',
          description: 'Test deployed low-latency model inference API under high throughput:',
          command: `curl -X POST http://${ip}:8000/v1/predict -H "Content-Type: application/json" -d '{"features": [0.42, 1.88, 0.95, -0.31]}'`,
        },
      ],
      terminalInitialHistory: [
        `ai-researcher@darkspace-ai:~$ curl -X POST http://${ip}:8000/v1/predict -H "Content-Type: application/json" -d '{"features": [0.42, 1.88, 0.95, -0.31]}'`,
        '{\n  "prediction": "CLASS_NORMAL_OPERATION",\n  "confidence": 0.9842,\n  "inference_latency_ms": 3.8\n}',
        'ai-researcher@darkspace-ai:~$ _',
      ],
      initialModules: [
        { id: 'm1', title: '1. Deep Learning, Backpropagation & Transformers', type: 'lecture', duration: '55 Min' },
        { id: 'm2', title: '2. Live Masterclass: Fine-Tuning Open Source LLMs & RAG', type: 'live', duration: 'LIVE', statusBadge: 'LIVE' },
        { id: 'm3', title: '3. Hands-on Lab: Neural Network Model Training & Deployment', type: 'lab', duration: '+100 pts' },
        { id: 'm4', title: '4. Python Data Science & PyTorch Tensor Cheatsheet', type: 'notes', duration: 'PDF' },
      ],
      initialNotes: [
        { id: 'n1', title: 'Modern Deep Learning & PyTorch Architecture', description: 'Transformer self-attention formulas, AdamW optimization, LoRA fine-tuning, and model quantization.', fileName: 'deep-learning-foundations.pdf', fileSize: '6.5 MB' },
        { id: 'n2', title: 'Prompt Engineering & RAG Implementation Notes', description: 'Vector databases (Pinecone/Milvus), cosine similarity thresholds, and LangChain agents.', fileName: 'rag-production-guide.pdf', fileSize: '3.1 MB' },
      ],
    };
  }

  // 6. INTERNSHIP TRACKS (4, 8, 12, 24 WEEKS)
  if (lowerCat.includes('intern') || lowerTitle.includes('intern')) {
    return {
      objectiveTitle: 'Industry Capstone Project, Sprint Deliverables & Mentorship Review',
      targetRole: 'Associate Software & Security Intern',
      defaultHostIp: ip,
      attackPodOrCluster: '10.10.14.82 (Staging Pod)',
      devOrAttackPodLabel: 'Staging Pod',
      terminalUser: 'intern',
      terminalHostname: 'darkspace-incubator',
      steps: [
        {
          stepNumber: 1,
          title: 'SPRINT CODE AUDIT & PIPELINE VALIDATION',
          description: 'Run automated linting, test suites, and security scans on the sprint repository:',
          command: 'pnpm run test && pnpm run audit:security',
        },
        {
          stepNumber: 2,
          title: 'CLOUD STAGING ENVIRONMENT DEPLOYMENT',
          description: 'Deploy release candidates to the Dark Space client staging infrastructure:',
          command: `curl -s -X POST http://${ip}:9000/deploy/staging --header "Authorization: Bearer INTERN_TOKEN"`,
        },
      ],
      terminalInitialHistory: [
        'intern@darkspace-incubator:~$ pnpm run test && pnpm run audit:security',
        '[PASS] 24/24 Test suites green. Zero critical CVE vulnerabilities detected.',
        'intern@darkspace-incubator:~$ _',
      ],
      initialModules: [
        { id: 'm1', title: '1. Professional Engineering Standards & Enterprise Git Workflows', type: 'lecture', duration: '40 Min' },
        { id: 'm2', title: '2. Live Interactive Mentorship: Code Review & System Architecture', type: 'live', duration: 'LIVE', statusBadge: 'LIVE' },
        { id: 'm3', title: '3. Hands-on Industry Project: Client Milestone Deliverables', type: 'lab', duration: 'SPRINT' },
        { id: 'm4', title: '4. Internship Career Guide, Resume Prep & ISO Certificate Info', type: 'notes', duration: 'CAREER' },
      ],
      initialNotes: [
        { id: 'n1', title: 'Internship Roadmap & ISO Certificate Guidelines', description: 'Milestone checkpoints for 4, 8, 12, and 24-week tracks, Govt + ISO recognition, and job placement assistance.', fileName: 'internship-roadmap-2026.pdf', fileSize: '2.1 MB' },
      ],
    };
  }

  // 7. CYBER SECURITY (DEFAULT / FALLBACK)
  return {
    objectiveTitle: 'Vulnerability Reconnaissance, Exploitation & Active Defense',
    targetRole: 'Cyber Security Operator',
    defaultHostIp: ip,
    attackPodOrCluster: '10.10.14.82 (Attack Pod)',
    devOrAttackPodLabel: 'Attack Pod',
    terminalUser: 'kali',
    terminalHostname: 'darkspace-lab',
    steps: [
      {
        stepNumber: 1,
        title: 'NETWORK SERVICE ENUMERATION',
        description: 'Probe open ports on the target range using aggressive timing and service fingerprint scripts:',
        command: `nmap -sC -sV -p 80,8080 ${ip}`,
      },
      {
        stepNumber: 2,
        title: 'ACTUATOR ENDPOINT VERIFICATION',
        description: 'Inspect the Spring Boot Actuator health endpoint on port 8080 for unsanitized environment secrets:',
        command: `curl -s http://${ip}:8080/actuator/env | jq .`,
      },
      {
        stepNumber: 3,
        title: 'PRIVILEGE ESCALATION & PROOF SUBMISSION',
        description: 'Extract system flag token and prepare CTF proof for automated validation:',
        command: 'cat /root/proof.txt',
      },
    ],
    terminalInitialHistory: [
      `kali@darkspace-lab:~$ nmap -sC -sV -p 80,8080 ${ip}`,
      'PORT     STATE SERVICE VERSION',
      `80/tcp   open  http    Apache httpd 2.4.52 on ${ip}`,
      '8080/tcp open  http    Spring Boot Actuator (Exploitable Target Range)',
      'kali@darkspace-lab:~$ _',
    ],
    initialModules: [
      { id: 'm1', title: '1. Recorded Lecture: Offensive Cyber Operations & Exploitation', type: 'lecture', duration: '45 Min' },
      { id: 'm2', title: '2. Live Interactive Class: Live Exploit Walkthrough & Defense', type: 'live', duration: 'LIVE', statusBadge: 'LIVE' },
      { id: 'm3', title: '3. Kali Virtual Attack Lab: Target Machine Enumeration', type: 'lab', duration: '+100 pts' },
      { id: 'm4', title: '4. Kali Linux Exploitation Notes & Burp Suite Cheatsheet', type: 'notes', duration: 'PDF' },
      { id: 'm5', title: '5. Proof Flag Submission (CTF Verification)', type: 'lab', duration: 'CTF' },
    ],
    initialNotes: [
      { id: 'n1', title: 'Offensive Cyber Operations & Exploit Chains', description: 'Burp Suite Repeater tricks, SQL injection bypasses, SSRF escalations, and Active Directory persistence.', fileName: 'offensive-cyber-handbook.pdf', fileSize: '4.8 MB' },
      { id: 'n2', title: 'Linux & Windows Privilege Escalation Cheatsheet', description: 'SUID binaries, Linux kernel exploits, Windows token impersonation, and automated enumeration scripts.', fileName: 'privilege-escalation-cheatsheet.pdf', fileSize: '1.9 MB' },
    ],
  };
}
