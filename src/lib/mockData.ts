// Mock data for Hoollow - used for initial population and demo
export interface MockUser {
    id: string;
    name: string;
    email: string;
    image: string;
    role: "builder" | "founder" | "investor";
    impactXP: number;
    bio: string;
    skills: string[];
    openToCollab: boolean;
    rank?: number;
}

export interface MockPost {
    id: string;
    title: string;
    body: string;
    tags: string[];
    upvotes: number;
    authorId: string;
    author: MockUser;
    createdAt: string;
    commentCount: number;
    isProject?: boolean;
}

export interface MockProject {
    id: string;
    name: string;
    description: string;
    tags: string[];
    upvotes: number;
    xpThreshold: number;
    authorId: string;
    author: MockUser;
    expiresAt: string;
    createdAt: string;
    thumbnail: string;
}

export interface MockClub {
    id: string;
    name: string;
    description: string;
    type: "open" | "invite" | "application";
    domain: string;
    impactXP: number;
    memberCount: number;
    members: MockUser[];
    tags: string[];
    featured?: boolean;
    gradient: string;
}

export interface MockOpportunity {
    id: string;
    title: string;
    company: string;
    type: "internship" | "hackathon" | "accelerator";
    deadline: string;
    xpRequired: number;
}

export interface MockEndorsement {
    id: string;
    from: MockUser;
    text: string;
}

// ─── Users ──────────────────────────────────────────
export const mockUsers: MockUser[] = [
    {
        id: "u1",
        name: "Ayush Kumar",
        email: "ayush@hoollow.com",
        image: "",
        role: "founder",
        impactXP: 2140,
        bio: "15-year-old building Hoollow. Obsessed with making opportunities merit-based for every young builder.",
        skills: ["Product Design", "React", "Next.js", "Leadership"],
        openToCollab: true,
        rank: 1,
    },
    {
        id: "u2",
        name: "Priya Sharma",
        email: "priya@example.com",
        image: "",
        role: "builder",
        impactXP: 1840,
        bio: "Full-stack developer building tools for education. React, Node.js, and a lot of coffee.",
        skills: ["React", "Node.js", "TypeScript", "Figma"],
        openToCollab: true,
        rank: 2,
    },
    {
        id: "u3",
        name: "Arjun Mehta",
        email: "arjun@example.com",
        image: "",
        role: "builder",
        impactXP: 1620,
        bio: "AI/ML enthusiast. Building intelligent systems that solve real problems.",
        skills: ["Python", "TensorFlow", "FastAPI", "Data Science"],
        openToCollab: true,
        rank: 3,
    },
    {
        id: "u4",
        name: "Sneha Patel",
        email: "sneha@example.com",
        image: "",
        role: "founder",
        impactXP: 1450,
        bio: "Co-founding an EdTech startup. Previously built 3 products with 10k+ users.",
        skills: ["Go-to-Market", "Product Strategy", "UI/UX", "Pitch Decks"],
        openToCollab: false,
        rank: 4,
    },
    {
        id: "u5",
        name: "Rohan Gupta",
        email: "rohan@example.com",
        image: "",
        role: "builder",
        impactXP: 1280,
        bio: "Hardware hacker and maker. Love building IoT devices and embedded systems.",
        skills: ["Arduino", "Raspberry Pi", "C++", "3D Printing"],
        openToCollab: true,
        rank: 5,
    },
    {
        id: "u6",
        name: "Kavya Nair",
        email: "kavya@example.com",
        image: "",
        role: "builder",
        impactXP: 1150,
        bio: "Designer turned developer. Building beautiful and accessible web experiences.",
        skills: ["Figma", "CSS", "React", "Accessibility"],
        openToCollab: true,
        rank: 6,
    },
    {
        id: "u7",
        name: "Vikram Singh",
        email: "vikram@example.com",
        image: "",
        role: "investor",
        impactXP: 980,
        bio: "Angel investor focused on student-led startups. Previously exited 2 companies.",
        skills: ["Venture Capital", "Due Diligence", "Mentoring"],
        openToCollab: false,
        rank: 7,
    },
    {
        id: "u8",
        name: "Ananya Reddy",
        email: "ananya@example.com",
        image: "",
        role: "builder",
        impactXP: 890,
        bio: "Mobile developer creating apps that matter. Flutter enthusiast.",
        skills: ["Flutter", "Dart", "Firebase", "UI Design"],
        openToCollab: true,
        rank: 8,
    },
];

// ─── Posts ──────────────────────────────────────────
export const mockPosts: MockPost[] = [
    {
        id: "p1",
        title: "Just shipped v2.0 of StudySync — AI-powered study groups",
        body: "After 3 months of building, we finally launched the complete rewrite. New features include AI-generated study plans, real-time collaboration, and smart matching based on learning styles. The response has been incredible — 500 sign-ups in the first 24 hours. Here's what I learned about shipping fast as a solo builder...",
        tags: ["EdTech", "AI/ML", "Open to Collab"],
        upvotes: 47,
        authorId: "u2",
        author: mockUsers[1],
        createdAt: "2024-03-05T10:30:00Z",
        commentCount: 12,
        isProject: true,
    },
    {
        id: "p2",
        title: "Why ImpactXP matters more than your LinkedIn profile",
        body: "Traditional platforms reward credentials and connections. But what if your work spoke for itself? I've been using Hoollow's ImpactXP system for 2 months now, and the difference is night and day. Investors actually reached out to me based on my project scores, not my college name...",
        tags: ["Opinion", "ImpactXP"],
        upvotes: 89,
        authorId: "u1",
        author: mockUsers[0],
        createdAt: "2024-03-04T15:20:00Z",
        commentCount: 34,
    },
    {
        id: "p3",
        title: "Building a hardware prototype on a ₹5,000 budget",
        body: "Everyone says hardware is expensive. I disagree. Here's how I built a fully functional IoT weather station using off-the-shelf components, a Raspberry Pi Zero, and a lot of creative problem-solving. Total cost: ₹4,800. The key is knowing where to source components...",
        tags: ["Hardware", "IoT", "Tutorial"],
        upvotes: 62,
        authorId: "u5",
        author: mockUsers[4],
        createdAt: "2024-03-04T09:15:00Z",
        commentCount: 18,
    },
    {
        id: "p4",
        title: "Looking for a co-founder: AI-powered career guidance for Tier 2/3 students",
        body: "I'm building CareerLens — an AI tool that gives personalized career guidance to students in Tier 2 and Tier 3 cities who don't have access to expensive counselors. I need a technical co-founder who can help build the ML pipeline. If you're passionate about education equity, let's chat...",
        tags: ["Co-founder", "AI/ML", "EdTech"],
        upvotes: 35,
        authorId: "u4",
        author: mockUsers[3],
        createdAt: "2024-03-03T18:45:00Z",
        commentCount: 22,
    },
    {
        id: "p5",
        title: "From 0 to 1,000 XP: My first month on Hoollow",
        body: "One month ago, I joined Hoollow with zero projects and zero reputation. Today, I'm at 1,150 XP and have connected with 3 potential collaborators. Here's exactly what I did: I shipped one small project every week, participated in 2 Launchpad cycles, and actively gave feedback in clubs...",
        tags: ["Journey", "ImpactXP", "Tips"],
        upvotes: 73,
        authorId: "u6",
        author: mockUsers[5],
        createdAt: "2024-03-03T11:00:00Z",
        commentCount: 28,
    },
    {
        id: "p6",
        title: "The accessibility problem in Indian EdTech — and how we can fix it",
        body: "I audited 15 popular EdTech platforms in India. The results are shocking: 12 out of 15 fail basic WCAG 2.1 guidelines. Screen reader support is almost non-existent. Color contrast ratios are terrible. As builders, we have a responsibility to build inclusively. Here's my framework...",
        tags: ["Accessibility", "EdTech", "Design"],
        upvotes: 56,
        authorId: "u6",
        author: mockUsers[5],
        createdAt: "2024-03-02T14:30:00Z",
        commentCount: 15,
    },
    {
        id: "p7",
        title: "Shipped: Open-source component library for Indian startups",
        body: "Introducing BharatUI — a free, open-source React component library designed specifically for Indian startups. It includes UPI payment components, Aadhaar verification flows, GST calculators, and multilingual support out of the box. 100% accessible, 100% customizable...",
        tags: ["Open Source", "React", "SaaS"],
        upvotes: 112,
        authorId: "u3",
        author: mockUsers[2],
        createdAt: "2024-03-01T16:00:00Z",
        commentCount: 41,
        isProject: true,
    },
    {
        id: "p8",
        title: "What I look for when investing in student-led startups",
        body: "As an angel investor, I've reviewed over 200 student pitches this year. Here are the 5 things that make me say yes: 1) A working product, not just a pitch deck. 2) Evidence of user traction, even if small. 3) A team that ships fast. 4) Clear understanding of the problem space...",
        tags: ["Investing", "Advice", "Startups"],
        upvotes: 94,
        authorId: "u7",
        author: mockUsers[6],
        createdAt: "2024-02-29T12:00:00Z",
        commentCount: 37,
    },
];

// ─── Projects ──────────────────────────────────────────
export const mockProjects: MockProject[] = [
    {
        id: "proj1",
        name: "StudySync",
        description: "AI-powered study groups that match students by learning style and schedule. Real-time collaboration with smart study plans.",
        tags: ["EdTech", "AI/ML", "SaaS"],
        upvotes: 234,
        xpThreshold: 500,
        authorId: "u2",
        author: mockUsers[1],
        expiresAt: "2024-03-07T10:30:00Z",
        createdAt: "2024-03-05T10:30:00Z",
        thumbnail: "",
    },
    {
        id: "proj2",
        name: "BharatUI",
        description: "Open-source React component library for Indian startups — UPI, Aadhaar, GST, multilingual support out of the box.",
        tags: ["Open Source", "React", "Developer Tools"],
        upvotes: 187,
        xpThreshold: 0,
        authorId: "u3",
        author: mockUsers[2],
        expiresAt: "2024-03-07T16:00:00Z",
        createdAt: "2024-03-05T16:00:00Z",
        thumbnail: "",
    },
    {
        id: "proj3",
        name: "WeatherNode",
        description: "₹5,000 IoT weather station built with Raspberry Pi Zero. Open-source hardware design with cloud dashboard.",
        tags: ["Hardware", "IoT", "Open Source"],
        upvotes: 156,
        xpThreshold: 200,
        authorId: "u5",
        author: mockUsers[4],
        expiresAt: "2024-03-07T09:15:00Z",
        createdAt: "2024-03-05T09:15:00Z",
        thumbnail: "",
    },
    {
        id: "proj4",
        name: "CareerLens",
        description: "AI-powered career guidance for Tier 2/3 students. Personalized paths based on skills, interests, and local opportunities.",
        tags: ["AI/ML", "EdTech", "Social Impact"],
        upvotes: 143,
        xpThreshold: 300,
        authorId: "u4",
        author: mockUsers[3],
        expiresAt: "2024-03-07T18:45:00Z",
        createdAt: "2024-03-05T18:45:00Z",
        thumbnail: "",
    },
    {
        id: "proj5",
        name: "AccessAudit",
        description: "Automated accessibility auditing tool for web apps. Scans for WCAG 2.1 compliance and generates actionable fix reports.",
        tags: ["Accessibility", "Developer Tools", "SaaS"],
        upvotes: 128,
        xpThreshold: 0,
        authorId: "u6",
        author: mockUsers[5],
        expiresAt: "2024-03-07T14:30:00Z",
        createdAt: "2024-03-05T14:30:00Z",
        thumbnail: "",
    },
    {
        id: "proj6",
        name: "SkillBridge",
        description: "Peer-to-peer skill exchange platform. Teach what you know, learn what you need — no money involved.",
        tags: ["Social", "EdTech", "Community"],
        upvotes: 98,
        xpThreshold: 100,
        authorId: "u8",
        author: mockUsers[7],
        expiresAt: "2024-03-07T11:00:00Z",
        createdAt: "2024-03-05T11:00:00Z",
        thumbnail: "",
    },
];

// ─── Clubs ──────────────────────────────────────────
export const mockClubs: MockClub[] = [
    {
        id: "c1",
        name: "AI Builders Collective",
        description: "A club for builders shipping AI-powered products. Weekly demos, code reviews, and collaboration opportunities.",
        type: "open",
        domain: "Tech",
        impactXP: 4200,
        memberCount: 34,
        members: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3], mockUsers[7]],
        tags: ["AI/ML", "Product", "Demos"],
        featured: true,
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
        id: "c2",
        name: "Design Systems Guild",
        description: "Exploring and building design systems together. From tokens to components, we ship beautiful interfaces.",
        type: "application",
        domain: "Design",
        impactXP: 3100,
        memberCount: 22,
        members: [mockUsers[5], mockUsers[1], mockUsers[0], mockUsers[7], mockUsers[3]],
        tags: ["Design", "UI/UX", "Components"],
        featured: true,
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
        id: "c3",
        name: "Hardware Hackers",
        description: "Building physical products from scratch. Arduino, RPi, 3D printing, PCB design — if it beeps, we build it.",
        type: "open",
        domain: "Tech",
        impactXP: 2800,
        memberCount: 18,
        members: [mockUsers[4], mockUsers[2], mockUsers[0], mockUsers[7], mockUsers[5]],
        tags: ["Hardware", "IoT", "Maker"],
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
        id: "c4",
        name: "Startup Strategy Lab",
        description: "For early-stage founders figuring out GTM, pricing, fundraising. Weekly office hours with experienced mentors.",
        type: "invite",
        domain: "Business",
        impactXP: 3600,
        memberCount: 15,
        members: [mockUsers[3], mockUsers[0], mockUsers[6], mockUsers[1], mockUsers[4]],
        tags: ["Strategy", "Fundraising", "GTM"],
        gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    },
    {
        id: "c5",
        name: "Open Source India",
        description: "Contributing to and creating open source projects that solve Indian problems. Code, document, ship, repeat.",
        type: "open",
        domain: "Tech",
        impactXP: 2400,
        memberCount: 42,
        members: [mockUsers[2], mockUsers[1], mockUsers[5], mockUsers[4], mockUsers[7]],
        tags: ["Open Source", "India", "Community"],
        gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
        id: "c6",
        name: "Research & Papers Club",
        description: "Reading, discussing, and implementing cutting-edge research papers. From arxiv to production.",
        type: "application",
        domain: "Research",
        impactXP: 1900,
        memberCount: 12,
        members: [mockUsers[2], mockUsers[0], mockUsers[3], mockUsers[5], mockUsers[7]],
        tags: ["Research", "ML", "Papers"],
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
];

// ─── Opportunities ──────────────────────────────────────────
export const mockOpportunities: MockOpportunity[] = [
    {
        id: "opp1",
        title: "Frontend Intern — Razorpay",
        company: "Razorpay",
        type: "internship",
        deadline: "2024-03-15",
        xpRequired: 500,
    },
    {
        id: "opp2",
        title: "Smart India Hackathon 2024",
        company: "Government of India",
        type: "hackathon",
        deadline: "2024-03-20",
        xpRequired: 200,
    },
    {
        id: "opp3",
        title: "Y Combinator S24 Applications",
        company: "Y Combinator",
        type: "accelerator",
        deadline: "2024-04-01",
        xpRequired: 1000,
    },
    {
        id: "opp4",
        title: "Backend Developer Intern — CRED",
        company: "CRED",
        type: "internship",
        deadline: "2024-03-25",
        xpRequired: 600,
    },
];

// ─── Endorsements ──────────────────────────────────────────
export const mockEndorsements: MockEndorsement[] = [
    {
        id: "e1",
        from: mockUsers[1],
        text: "Ayush is one of the most driven young founders I've worked with. His vision for Hoollow is exactly what the ecosystem needs.",
    },
    {
        id: "e2",
        from: mockUsers[2],
        text: "Incredible product sense and execution speed. Built and shipped a complete feature in under a week.",
    },
    {
        id: "e3",
        from: mockUsers[5],
        text: "Great collaborator with deep design thinking. Always pushes for accessibility and inclusivity in every project.",
    },
];

// ─── Team Members ──────────────────────────────────────────
export const teamMembers = [
    { name: "Ayush Kumar", role: "Founder & CEO", age: 15 },
    { name: "Riya Kapoor", role: "CTO" },
    { name: "Aditya Joshi", role: "Lead Designer" },
    { name: "Meera Iyer", role: "Backend Lead" },
    { name: "Karan Thakur", role: "Frontend Developer" },
    { name: "Divya Srinivasan", role: "ML Engineer" },
    { name: "Harsh Pandey", role: "DevOps" },
    { name: "Nisha Verma", role: "Community Lead" },
    { name: "Siddharth Roy", role: "Mobile Developer" },
    { name: "Pooja Agarwal", role: "Growth Lead" },
    { name: "Rahul Deshmukh", role: "Content & Comms" },
];

// ─── XP History (for sparkline) ──────────────────────────────
export const xpHistory = [
    { month: "Sep", xp: 50 },
    { month: "Oct", xp: 220 },
    { month: "Nov", xp: 580 },
    { month: "Dec", xp: 890 },
    { month: "Jan", xp: 1340 },
    { month: "Feb", xp: 1780 },
    { month: "Mar", xp: 2140 },
];

// ─── Helper functions ──────────────────────────────────────────
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function formatXP(xp: number): string {
    return xp.toLocaleString() + " XP";
}

export function getTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function getRoleName(role: string): string {
    switch (role) {
        case "builder": return "Student Builder";
        case "founder": return "Early Founder";
        case "investor": return "Investor";
        default: return "Builder";
    }
}
