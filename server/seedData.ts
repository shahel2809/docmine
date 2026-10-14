import type { DocumentMeta, DocumentChunk, SmartHighlight, DiagramData, Quiz } from '../src/types/index.ts';

export const SAMPLE_DOCUMENTS: DocumentMeta[] = [
  {
    id: 'doc-os-ostep',
    title: 'Open Educational Resource: Operating Systems & Concurrency',
    filename: 'OER_Operating_Systems_Essentials.pdf',
    subject: 'Computer Science',
    pageCount: 48,
    fileSize: 3450200,
    uploadDate: '2026-10-10T09:00:00Z',
    status: 'ready',
    chunksCount: 8,
    isSample: true,
    summary: 'Open Educational Resource (Free / Unrestricted Academic License) covering Virtual Memory, Paging, CPU Scheduling, Concurrency Locks, and Deadlock Conditions.',
    keyTopics: ['Virtual Memory', 'Paging & TLB', 'CPU Scheduling Algorithms', 'Deadlock & Coffman Conditions', 'Mutex & Semaphores', 'Page Replacement (LRU/FIFO)']
  },
  {
    id: 'doc-econ-principles',
    title: 'Open Educational Resource: Principles of Economics',
    filename: 'OER_Principles_of_Economics.pdf',
    subject: 'Economics',
    pageCount: 42,
    fileSize: 2890400,
    uploadDate: '2026-10-11T11:30:00Z',
    status: 'ready',
    chunksCount: 7,
    isSample: true,
    summary: 'Open Educational Resource (Free / Unrestricted Academic License) covering Market Equilibrium, Price Elasticity, Keynesian Multiplier, and Fiscal Policy.',
    keyTopics: ['Market Equilibrium & Price Controls', 'Price Elasticity of Demand', 'The Keynesian Multiplier Effect', 'Fiscal vs Monetary Policy', 'Consumer & Producer Surplus', 'Negative Externalities & Pigouvian Taxes']
  },
  {
    id: 'doc-bio-molecular',
    title: 'Open Educational Resource: Molecular & Cellular Biology',
    filename: 'OER_Molecular_Biology.pdf',
    subject: 'Biology',
    pageCount: 52,
    fileSize: 4120800,
    uploadDate: '2026-10-12T14:15:00Z',
    status: 'ready',
    chunksCount: 8,
    isSample: true,
    summary: 'Open Educational Resource (Free / Unrestricted Academic License) covering DNA Replication, Transcription, Translation, and ATP Chemiosmosis.',
    keyTopics: ['DNA Replication Fork Dynamics', 'Transcription & RNA Processing', 'Translation & Ribosome Mechanism', 'Mitochondrial Chemiosmosis & ATP Synthase', 'Mendelian Genetics & Punnett Squares', 'Cell Cycle Checkpoints']
  }
];

export const SAMPLE_CHUNKS: DocumentChunk[] = [
  // OS Chunks
  {
    id: 'chunk-os-1',
    documentId: 'doc-os-ostep',
    documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
    pageNumber: 12,
    content: 'Paging divides the virtual address space into fixed-sized units called pages. Correspondingly, physical memory is viewed as an array of fixed-sized slots called page frames. To translate a virtual address, the hardware divides the address into a Virtual Page Number (VPN) and an offset. The page table is a per-process data structure that maps VPN to Physical Frame Number (PFN). Because page tables can be large, modern hardware uses a Translation Lookaside Buffer (TLB) as a fast hardware cache of address translations.',
    keywords: ['paging', 'virtual memory', 'page frames', 'vpn', 'pfn', 'page table', 'tlb', 'translation lookaside buffer']
  },
  {
    id: 'chunk-os-2',
    documentId: 'doc-os-ostep',
    documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
    pageNumber: 18,
    content: 'A Page Fault occurs when an accessed virtual page is not currently resident in physical memory (its present bit in the page table entry is 0). The hardware traps into the OS kernel page fault handler. The OS locates the page on swap storage, issues disk I/O, allocates a physical frame, updates the page table entry, marks present bit to 1, and restarts the instruction that caused the fault.',
    keywords: ['page fault', 'present bit', 'swap storage', 'disk io', 'physical frame', 'kernel trap', 'page replacement']
  },
  {
    id: 'chunk-os-3',
    documentId: 'doc-os-ostep',
    documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
    pageNumber: 27,
    content: 'CPU Scheduling determines which ready thread or process runs next. Multi-Level Feedback Queue (MLFQ) attempts to optimize both turnaround time for long jobs and response time for interactive jobs without prior knowledge of job length. Rule 1: If Priority(A) > Priority(B), A runs. Rule 2: If Priority(A) == Priority(B), A and B run in round-robin. Rule 3: When a job enters the system, it is placed at the topmost queue. Rule 4: Once a job uses its time allotment at a given priority, its priority is reduced. Rule 5: After some time period S, boost all jobs to the topmost queue to prevent starvation.',
    keywords: ['mlfq', 'cpu scheduling', 'turnaround time', 'response time', 'priority boost', 'starvation', 'round robin']
  },
  {
    id: 'chunk-os-4',
    documentId: 'doc-os-ostep',
    documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
    pageNumber: 35,
    content: 'Deadlock can occur only if all four Coffman conditions hold simultaneously: 1. Mutual Exclusion: threads claim exclusive control of resources. 2. Hold and Wait: threads hold resources while waiting for additional resources. 3. No Preemption: resources cannot be forcibly confiscated from holding threads. 4. Circular Wait: a circular chain of two or more threads exists where each waits for a resource held by the next. Breaking any one of these four conditions prevents deadlock entirely; for example, enforcing a total ordering on lock acquisition eliminates circular wait.',
    keywords: ['deadlock', 'coffman conditions', 'mutual exclusion', 'hold and wait', 'no preemption', 'circular wait', 'lock ordering']
  },
  {
    id: 'chunk-os-5',
    documentId: 'doc-os-ostep',
    documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
    pageNumber: 41,
    content: 'Semaphores, introduced by Edsger Dijkstra, are an integer synchronization primitive manipulated via two atomic operations: sem_wait() (or P()) and sem_post() (or V()). A binary semaphore initialized to 1 behaves as a mutual exclusion lock (mutex). Counting semaphores initialized to N can regulate access to a finite pool of N identical resources or coordinate producer-consumer bounded buffers.',
    keywords: ['semaphore', 'dijkstra', 'sem_wait', 'sem_post', 'mutex', 'binary semaphore', 'counting semaphore', 'bounded buffer']
  },

  // Economics Chunks
  {
    id: 'chunk-econ-1',
    documentId: 'doc-econ-principles',
    documentTitle: 'Principles of Economics: Macro & Micro Essentials',
    pageNumber: 8,
    content: 'Market equilibrium occurs at the price level where the quantity demanded equals quantity supplied (Qd = Qs). When the market price is above equilibrium, an excess supply (surplus) develops, placing downward pressure on prices. When the market price is below equilibrium, an excess demand (shortage) develops, driving prices upward. A price ceiling placed below equilibrium causes persistent shortages and deadweight loss.',
    keywords: ['market equilibrium', 'quantity demanded', 'quantity supplied', 'shortage', 'surplus', 'price ceiling', 'deadweight loss']
  },
  {
    id: 'chunk-econ-2',
    documentId: 'doc-econ-principles',
    documentTitle: 'Principles of Economics: Macro & Micro Essentials',
    pageNumber: 15,
    content: 'The Price Elasticity of Demand (PED) measures the percentage responsiveness of quantity demanded to a percentage change in price: PED = (% change in Qd) / (% change in P). When |PED| > 1, demand is elastic; increasing price reduces total revenue. When |PED| < 1, demand is inelastic; increasing price increases total revenue. When |PED| = 1, demand is unit elastic, maximizing total revenue.',
    keywords: ['price elasticity of demand', 'ped', 'elastic', 'inelastic', 'total revenue', 'percentage change']
  },
  {
    id: 'chunk-econ-3',
    documentId: 'doc-econ-principles',
    documentTitle: 'Principles of Economics: Macro & Micro Essentials',
    pageNumber: 26,
    content: 'The Keynesian Spending Multiplier explains how an initial injection of autonomous spending generates a more than proportional increase in national income. Multiplier k = 1 / (1 - MPC) = 1 / MPS, where MPC is the Marginal Propensity to Consume and MPS is Marginal Propensity to Save. If MPC = 0.8, the multiplier is 1 / (1 - 0.8) = 5. A $10 billion government expenditure increase raises equilibrium GDP by $50 billion.',
    keywords: ['keynesian multiplier', 'marginal propensity to consume', 'mpc', 'mps', 'autonomous spending', 'gdp', 'fiscal policy']
  },
  {
    id: 'chunk-econ-4',
    documentId: 'doc-econ-principles',
    documentTitle: 'Principles of Economics: Macro & Micro Essentials',
    pageNumber: 34,
    content: 'Monetary policy is conducted by the central bank to manage macroeconomic liquidity. Expansionary monetary policy involves lowering reserve requirements, reducing the discount rate, or purchasing government securities on the open market. This increases commercial bank reserves, lowers interest rates, stimulates private investment and consumer borrowing, and shifts the Aggregate Demand curve rightward.',
    keywords: ['monetary policy', 'central bank', 'reserve requirement', 'discount rate', 'open market operations', 'interest rates', 'aggregate demand']
  },

  // Biology Chunks
  {
    id: 'chunk-bio-1',
    documentId: 'doc-bio-molecular',
    documentTitle: 'Molecular Biology of the Cell: Genetics & Energetics',
    pageNumber: 14,
    content: 'During DNA replication, DNA Helicase unwinds the double helix at the replication fork by breaking hydrogen bonds between base pairs. Single-Stranded Binding Proteins (SSBs) stabilize the unwound single strands to prevent re-annealing. Topoisomerase (gyrase) relieves supercoiling tension ahead of the replication fork. Because DNA Polymerase III can only synthesize in the 5\' to 3\' direction, the leading strand is synthesized continuously, while the lagging strand is synthesized discontinuously as Okazaki fragments initiated by RNA primase.',
    keywords: ['dna replication', 'helicase', 'topoisomerase', 'single stranded binding proteins', 'dna polymerase', 'leading strand', 'lagging strand', 'okazaki fragments']
  },
  {
    id: 'chunk-bio-2',
    documentId: 'doc-bio-molecular',
    documentTitle: 'Molecular Biology of the Cell: Genetics & Energetics',
    pageNumber: 22,
    content: 'Transcription is the process by which RNA Polymerase synthesizes a complementary mRNA transcript from the template DNA strand. In eukaryotes, pre-mRNA undergoes three essential post-transcriptional modifications: 1. Addition of a 7-methylguanosine 5\' cap for ribosomal recognition and stability; 2. Addition of a 3\' poly-A tail (150-250 adenines) to protect against enzymatic degradation; 3. Splicing by the spliceosome to excise non-coding introns and ligate coding exons.',
    keywords: ['transcription', 'rna polymerase', 'mrna', '5 cap', 'poly-a tail', 'splicing', 'introns', 'exons', 'spliceosome']
  },
  {
    id: 'chunk-bio-3',
    documentId: 'doc-bio-molecular',
    documentTitle: 'Molecular Biology of the Cell: Genetics & Energetics',
    pageNumber: 36,
    content: 'Peter Mitchell\'s Chemiosmotic Hypothesis describes cellular ATP synthesis in mitochondria. Electrons from NADH and FADH2 traverse the electron transport chain (Complexes I-IV), pumping protons (H+) from the mitochondrial matrix into the intermembrane space, generating a steep electrochemical proton gradient (proton-motive force). As protons flow down their gradient back into the matrix through the F0 rotor subunit of ATP Synthase, mechanical rotation drives the F1 catalytic head to phosphorylate ADP and inorganic phosphate into ATP.',
    keywords: ['chemiosmosis', 'atp synthase', 'electron transport chain', 'mitochondria', 'proton motive force', 'nadh', 'fadh2', 'oxidative phosphorylation']
  }
];

export const SAMPLE_HIGHLIGHTS: SmartHighlight[] = [
  {
    id: 'hl-1',
    documentId: 'doc-os-ostep',
    documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
    pageNumber: 12,
    category: 'definition',
    title: 'Translation Lookaside Buffer (TLB)',
    content: 'A high-speed hardware cache located directly on the CPU chip containing recently accessed virtual-to-physical address mappings, circumventing multi-level memory lookups.',
    importance: 'high'
  },
  {
    id: 'hl-2',
    documentId: 'doc-os-ostep',
    documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
    pageNumber: 35,
    category: 'concept',
    title: 'Coffman Conditions for Deadlock',
    content: 'Deadlock requires 4 simultaneous conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Breaking any single condition prevents deadlock entirely.',
    importance: 'high'
  },
  {
    id: 'hl-3',
    documentId: 'doc-os-ostep',
    documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
    pageNumber: 41,
    category: 'algorithm',
    title: 'Dijkstra Semaphore Operations',
    content: 'sem_wait() decrements the semaphore counter and blocks if counter < 0. sem_post() increments the counter and unblocks one waiting thread. Both operations are atomic.',
    importance: 'medium'
  },
  {
    id: 'hl-4',
    documentId: 'doc-econ-principles',
    documentTitle: 'Principles of Economics: Macro & Micro Essentials',
    pageNumber: 15,
    category: 'formula',
    title: 'Price Elasticity of Demand (PED)',
    content: 'PED = (% Δ in Quantity Demanded) / (% Δ in Price). If |PED| > 1, demand is elastic; if |PED| < 1, demand is inelastic. Revenue is maximized when |PED| = 1.',
    importance: 'high'
  },
  {
    id: 'hl-5',
    documentId: 'doc-econ-principles',
    documentTitle: 'Principles of Economics: Macro & Micro Essentials',
    pageNumber: 26,
    category: 'formula',
    title: 'Keynesian Expenditure Multiplier Formula',
    content: 'k = 1 / (1 - MPC) = 1 / MPS. An initial government spending injection ΔG expands equilibrium national income by ΔY = k × ΔG.',
    importance: 'high'
  },
  {
    id: 'hl-6',
    documentId: 'doc-bio-molecular',
    documentTitle: 'Molecular Biology of the Cell: Genetics & Energetics',
    pageNumber: 14,
    category: 'comparison',
    title: 'Leading vs Lagging Strand Synthesis',
    content: 'The leading strand is synthesized continuously in the 5\' to 3\' direction toward the replication fork. The lagging strand is synthesized discontinuously away from the fork as discrete Okazaki fragments requiring repeated RNA primers.',
    importance: 'high'
  },
  {
    id: 'hl-7',
    documentId: 'doc-bio-molecular',
    documentTitle: 'Molecular Biology of the Cell: Genetics & Energetics',
    pageNumber: 36,
    category: 'exam_question',
    title: 'Potential Exam Question: Mitchell\'s Chemiosmotic Hypothesis',
    content: 'Explain how the mitochondrial electron transport chain establishes a proton-motive force across the inner membrane and how ATP Synthase couples this gradient to ATP synthesis.',
    importance: 'high'
  }
];

export const SAMPLE_DIAGRAMS: Record<string, DiagramData> = {
  'os-page-fault': {
    id: 'diag-os-1',
    topic: 'Page Fault Handling Flow in Virtual Memory',
    mermaidCode: `flowchart TD
    A[CPU Accesses Virtual Address] --> B{TLB Hit?}
    B -- Yes --> C[Read/Write Physical Frame]
    B -- No --> D{PTE Present Bit == 1?}
    D -- Yes --> E[Update TLB & Proceed]
    D -- No --> F[Trigger Page Fault Kernel Trap]
    F --> G[OS Locates Page in Swap Space]
    G --> H[Allocate Physical Frame / Evict if Full]
    H --> I[Execute Disk I/O Read]
    I --> J[Update Page Table PTE & Present Bit]
    J --> K[Restart Faulting Instruction]
    K --> C
    
    classDef default fill:#f8fafc,stroke:#64748b,stroke-width:1.5px;
    classDef active fill:#e0e7ff,stroke:#4338ca,stroke-width:2.5px;
    classDef success fill:#dcfce7,stroke:#15803d,stroke-width:2px;`,
    title: 'Step-by-Step Page Fault Handling',
    description: 'Hardware and kernel interaction during a translation miss and disk swap load in modern operating systems.',
    steps: [
      {
        stepNumber: 1,
        title: 'CPU Memory Request & TLB Check',
        description: 'The CPU tries to translate a virtual address. If present in the hardware TLB cache, translation completes in ~1 nanosecond.',
        highlightedNode: 'B',
        formulaOrAnalogy: 'Analogy: Checking your desk sticky-note before looking up the library archive.'
      },
      {
        stepNumber: 2,
        title: 'Page Table Entry & Present Bit',
        description: 'On a TLB miss, the MMU accesses the Page Table. If the Present Bit is 0, the page is currently on disk swap, triggering a hardware trap.',
        highlightedNode: 'D',
        formulaOrAnalogy: 'Present Bit: 1 = In RAM, 0 = On Disk Swap.'
      },
      {
        stepNumber: 3,
        title: 'Kernel Page Fault Handler & Disk I/O',
        description: 'The OS takes control via a software trap, pauses the user process, and initiates an asynchronous disk transfer to read the page into RAM.',
        highlightedNode: 'G',
        formulaOrAnalogy: 'Disk latency is ~100,000x slower than RAM (milliseconds vs nanoseconds).'
      },
      {
        stepNumber: 4,
        title: 'Page Replacement & Frame Allocation',
        description: 'If physical RAM is completely occupied, the OS page replacement algorithm (e.g. LRU or Clock) evicts a victim page back to swap.',
        highlightedNode: 'H',
        formulaOrAnalogy: 'Victim Page Selection: If modified (dirty), write back to disk first.'
      },
      {
        stepNumber: 5,
        title: 'PTE Update & Instruction Restart',
        description: 'Once the page is copied into RAM, the OS updates the Page Table Entry, sets Present Bit to 1, loads the TLB, and restarts the original instruction.',
        highlightedNode: 'K',
        formulaOrAnalogy: 'Key insight: The user program never realizes it was briefly suspended.'
      }
    ]
  },
  'econ-multiplier': {
    id: 'diag-econ-1',
    topic: 'Keynesian Multiplier & Aggregate Demand Expansion',
    mermaidCode: `flowchart TD
    A[Initial Government Spending Injection ΔG] --> B[Direct Increase in Firm Revenue & Production]
    B --> C[Payment of Wages & Profits to Households]
    C --> D[Households Consume Fraction: MPC × Income]
    D --> E[Second-Round Business Revenue Increase]
    E --> F[Further Household Income & Consumption]
    F --> G[Diminishing Infinite Geometric Series]
    G --> H[Total Equilibrium GDP Expansion: ΔY = k × ΔG]
    
    classDef default fill:#f8fafc,stroke:#64748b,stroke-width:1.5px;
    classDef active fill:#fef3c7,stroke:#b45309,stroke-width:2.5px;`,
    title: 'The Keynesian Circular Multiplier Cascade',
    description: 'Visual breakdown of how autonomous government or investment expenditure ripples through household consumption.',
    steps: [
      {
        stepNumber: 1,
        title: 'Autonomous Injection (ΔG)',
        description: 'The government launches a $10B infrastructure project. Builders, contractors, and suppliers receive this as initial revenue.',
        highlightedNode: 'A',
        formulaOrAnalogy: 'Round 1 Impact = $10 Billion'
      },
      {
        stepNumber: 2,
        title: 'Household Income Distribution',
        description: 'Businesses distribute the revenue as wages, salaries, rents, and profits to workers and shareholders.',
        highlightedNode: 'C',
        formulaOrAnalogy: 'Income = Revenue - Intermediate Costs'
      },
      {
        stepNumber: 3,
        title: 'Marginal Propensity to Consume (MPC)',
        description: 'Workers spend a fraction of their new disposable income (e.g. MPC = 0.8 means 80% spent, 20% saved).',
        highlightedNode: 'D',
        formulaOrAnalogy: 'Round 2 Consumption = $10B × 0.8 = $8 Billion'
      },
      {
        stepNumber: 4,
        title: 'Cumulative Geometric Expansion',
        description: 'The $8B spent becomes revenue for grocery stores, retailers, and services, who spend 80% again ($6.4B), cascading downward.',
        highlightedNode: 'G',
        formulaOrAnalogy: 'Sum = ΔG × (1 + MPC + MPC² + MPC³...) = ΔG / (1 - MPC)'
      },
      {
        stepNumber: 5,
        title: 'Equilibrium GDP Outcome',
        description: 'For MPC = 0.8, the multiplier k = 5. The total GDP growth reaches $50 Billion from the initial $10 Billion injection.',
        highlightedNode: 'H',
        formulaOrAnalogy: 'Final Expansion ΔY = 5 × $10B = $50 Billion'
      }
    ]
  },
  'bio-dna-replication': {
    id: 'diag-bio-1',
    topic: 'DNA Replication Fork Molecular Machinery',
    mermaidCode: `flowchart TD
    A[Double-Stranded DNA Helix] --> B[DNA Helicase Unwinds Hydrogen Bonds]
    B --> C[Topoisomerase Relieves Supercoiling Tension]
    B --> D[Single-Stranded Binding Proteins SSBs Stabilize Strands]
    D --> E[Leading Strand: 3' to 5' Template]
    D --> F[Lagging Strand: 5' to 3' Template]
    E --> G[DNA Polymerase III Synthesizes Continuously 5' to 3']
    F --> H[RNA Primase Synthesizes RNA Primers]
    H --> I[DNA Polymerase III Extends Okazaki Fragments]
    I --> J[DNA Polymerase I Replaces RNA with DNA]
    J --> K[DNA Ligase Seals Phosphodiester Backbone]
    
    classDef default fill:#f8fafc,stroke:#64748b,stroke-width:1.5px;
    classDef active fill:#dbeafe,stroke:#1d4ed8,stroke-width:2.5px;`,
    title: 'DNA Replication Fork Asymmetry',
    description: 'Detailed enzyme orchestration coordinating continuous leading and discontinuous lagging strand synthesis.',
    steps: [
      {
        stepNumber: 1,
        title: 'Helicase Unwinding & Tension Relief',
        description: 'Helicase cuts hydrogen bonds separating the two parental strands, while Topoisomerase snips and swivels DNA ahead of the fork to prevent tangling.',
        highlightedNode: 'B',
        formulaOrAnalogy: 'Analogy: Unzipping a jacket while untangling knots in the fabric.'
      },
      {
        stepNumber: 2,
        title: 'SSB Protein Stabilization',
        description: 'Single-Stranded Binding Proteins coat each exposed parental strand, preventing them from snapping back together.',
        highlightedNode: 'D',
        formulaOrAnalogy: 'Keeps template strands planar and accessible to polymerases.'
      },
      {
        stepNumber: 3,
        title: 'Continuous Leading Strand',
        description: 'Because the replication fork opens toward the 5\' end of the nascent strand, DNA Polymerase III adds dNTPs smoothly without interruption.',
        highlightedNode: 'G',
        formulaOrAnalogy: 'Directionality: DNA Polymerase adds nucleotides strictly to the 3\'-OH group.'
      },
      {
        stepNumber: 4,
        title: 'Lagging Strand & Okazaki Fragments',
        description: 'The opposite strand runs antiparallel. RNA Primase lays short RNA primers, and Polymerase III synthesizes 1000-2000 nucleotide chunks away from the fork.',
        highlightedNode: 'I',
        formulaOrAnalogy: 'Fragments named after Reiji and Tsuneko Okazaki (1968).'
      },
      {
        stepNumber: 5,
        title: 'Primer Replacement & Ligase Sealing',
        description: 'DNA Polymerase I chews away the RNA primers and inserts DNA nucleotides. DNA Ligase uses ATP to catalyze the final phosphodiester bond.',
        highlightedNode: 'K',
        formulaOrAnalogy: 'Result: Two identical double-stranded DNA molecules (semiconservative).'
      }
    ]
  }
};

export const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: 'quiz-os-core',
    title: 'Operating Systems: Virtual Memory & Concurrency Mastery',
    documentId: 'doc-os-ostep',
    topic: 'Virtual Memory & Concurrency',
    timeLimitMinutes: 10,
    difficulty: 'intermediate',
    questions: [
      {
        id: 'q-os-1',
        type: 'mcq',
        question: 'Which hardware component acts as an ultra-fast translation cache for Virtual Page Numbers (VPN) to Physical Frame Numbers (PFN)?',
        options: ['Translation Lookaside Buffer (TLB)', 'Memory Management Unit (MMU) Register', 'Direct Memory Access (DMA) Controller', 'Level 3 Shared Cache'],
        correctAnswer: 'Translation Lookaside Buffer (TLB)',
        explanation: 'The TLB is a dedicated hardware cache on the CPU chip that caches recent virtual-to-physical address translations, eliminating redundant multi-level page table lookups.',
        topic: 'Virtual Memory & Paging',
        documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
        pageNumber: 12
      },
      {
        id: 'q-os-2',
        type: 'mcq',
        question: 'What immediate action does the CPU hardware take when a virtual page with a Present Bit of 0 is accessed?',
        options: ['Terminates the program with a Segfault', 'Generates a hardware trap into the OS page fault handler', 'Allocates a random physical frame directly without OS help', 'Stalls indefinitely until the thread is killed'],
        correctAnswer: 'Generates a hardware trap into the OS page fault handler',
        explanation: 'A present bit of 0 indicates the page resides on swap space rather than physical RAM. The hardware traps into the kernel, allowing the OS page fault handler to issue disk I/O and swap in the missing page.',
        topic: 'Virtual Memory & Paging',
        documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
        pageNumber: 18
      },
      {
        id: 'q-os-3',
        type: 'true_false',
        question: 'True or False: Breaking the "Circular Wait" condition by enforcing a strict global lock ordering prevents deadlock.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'All four Coffman conditions must hold simultaneously for deadlock to occur. Enforcing a total ordering on lock acquisition (e.g. always acquire Lock A before Lock B) makes circular waiting impossible, thereby eliminating deadlock.',
        topic: 'Deadlock & Concurrency',
        documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
        pageNumber: 35
      },
      {
        id: 'q-os-4',
        type: 'fill_in_the_blank',
        question: 'In Dijkstra\'s semaphore specification, the operation that decrements the semaphore counter and blocks if counter < 0 is named __________ (or P).',
        correctAnswer: 'sem_wait',
        explanation: 'sem_wait() (or P() from Dutch "proberen" to test) atomically decrements the counter and suspends the calling thread if no resources remain available.',
        topic: 'Deadlock & Concurrency',
        documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
        pageNumber: 41
      },
      {
        id: 'q-os-5',
        type: 'mcq',
        question: 'In the Multi-Level Feedback Queue (MLFQ) scheduling algorithm, what mechanism prevents long-running CPU-bound processes from starving?',
        options: ['Periodic Priority Boost (Rule 5)', 'Strict First-Come First-Served queue ordering', 'Random priority lottery tickets', 'Dynamic time quantum halving'],
        correctAnswer: 'Periodic Priority Boost (Rule 5)',
        explanation: 'Rule 5 states that after a configurable time period S, all jobs in the system are boosted back to the topmost priority queue, guaranteeing that CPU-bound jobs will periodically make progress and avoid starvation.',
        topic: 'CPU Scheduling Algorithms',
        documentTitle: 'Operating Systems: Three Easy Pieces (Core Chapters)',
        pageNumber: 27
      }
    ]
  },
  {
    id: 'quiz-econ-core',
    title: 'Economics: Elasticity, Multipliers & Monetary Policy',
    documentId: 'doc-econ-principles',
    topic: 'Micro & Macroeconomics Essentials',
    timeLimitMinutes: 10,
    difficulty: 'intermediate',
    questions: [
      {
        id: 'q-econ-1',
        type: 'mcq',
        question: 'If the Marginal Propensity to Consume (MPC) is 0.75, what is the value of the Keynesian government spending multiplier?',
        options: ['4.0', '2.5', '1.33', '0.25'],
        correctAnswer: '4.0',
        explanation: 'The Keynesian expenditure multiplier is k = 1 / (1 - MPC). With MPC = 0.75, k = 1 / (1 - 0.75) = 1 / 0.25 = 4.0.',
        topic: 'Keynesian Multiplier',
        documentTitle: 'Principles of Economics: Macro & Micro Essentials',
        pageNumber: 26
      },
      {
        id: 'q-econ-2',
        type: 'true_false',
        question: 'True or False: If a good has price-inelastic demand (|PED| < 1), raising its price will increase total revenue for the seller.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'When demand is inelastic, the percentage drop in quantity demanded is smaller than the percentage increase in price. Therefore, the higher price per unit more than offsets the slight reduction in volume, increasing total revenue.',
        topic: 'Price Elasticity of Demand',
        documentTitle: 'Principles of Economics: Macro & Micro Essentials',
        pageNumber: 15
      },
      {
        id: 'q-econ-3',
        type: 'mcq',
        question: 'Which policy action is a direct example of expansionary monetary policy conducted by a central bank?',
        options: ['Purchasing government bonds on the open market', 'Increasing the legal reserve requirement for banks', 'Raising the benchmark discount interest rate', 'Cutting income tax rates for corporations'],
        correctAnswer: 'Purchasing government bonds on the open market',
        explanation: 'When the central bank buys bonds in open market operations, it credits cash to commercial bank reserves, lowering interbank interest rates and expanding credit availability.',
        topic: 'Fiscal vs Monetary Policy',
        documentTitle: 'Principles of Economics: Macro & Micro Essentials',
        pageNumber: 34
      }
    ]
  }
];
