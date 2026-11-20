'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@lms/ui';
import { Logo } from '@/components/Logo';
import {
  Search,
  ArrowLeft,
  Award,
  Briefcase,
  Layers,
  Clock,
  Code,
  Shield,
  Cpu,
  Smartphone,
  CheckCircle,
} from 'lucide-react';

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const programs = [
    // --- WEB & SOFTWARE ---
    {
      id: 'ws-1',
      title: 'Full Stack Development',
      category: 'WEB',
      categoryLabel: 'Web & Software',
      duration: '60 Hours Lab · 4-12 Weeks',
      level: 'Intermediate',
      highlight: 'MERN + Deployment + Projects',
      description: 'Master MongoDB, Express, React, Node.js, cloud containerization, and enterprise production deployments.',
      icon: Code,
    },
    {
      id: 'ws-2',
      title: 'Java (Core + Adv + JSP)',
      category: 'WEB',
      categoryLabel: 'Web & Software',
      duration: '55 Hours Lab · 4-8 Weeks',
      level: 'Intermediate',
      highlight: 'Enterprise Applications',
      description: 'Build robust enterprise services using Core Java, advanced OOP, multithreading, JSP, and Spring architecture.',
      icon: Code,
    },
    {
      id: 'ws-3',
      title: 'UI/UX Design',
      category: 'WEB',
      categoryLabel: 'Web & Software',
      duration: '40 Hours Lab · 4-8 Weeks',
      level: 'Beginner to Pro',
      highlight: 'Engaging Graphics & Interfaces',
      description: 'Design dark-mode cyber design systems, user personas, wireframes, and interactive prototypes with Figma.',
      icon: Layers,
    },
    {
      id: 'ws-4',
      title: 'Mobile App Development',
      category: 'WEB',
      categoryLabel: 'Web & Software',
      duration: '50 Hours Lab · 4-12 Weeks',
      level: 'Intermediate',
      highlight: 'Android & iOS Applications',
      description: 'Develop cross-platform native mobile applications with React Native, Flutter, and local secure storage.',
      icon: Smartphone,
    },

    // --- CYBER SECURITY ---
    {
      id: 'cs-1',
      title: 'Cyber Security Core',
      category: 'SECURITY',
      categoryLabel: 'Cyber Security',
      duration: '70 Hours Lab · 4-12 Weeks',
      level: 'Intermediate',
      highlight: 'Defensive + Offensive + Tools',
      description: 'Comprehensive cybersecurity foundations covering SIEM, SOC monitoring, network sniffing, and active countermeasures.',
      icon: Shield,
    },
    {
      id: 'cs-2',
      title: 'Ethical Hacking',
      category: 'SECURITY',
      categoryLabel: 'Cyber Security',
      duration: '80 Hours Lab · 4-12 Weeks',
      level: 'Advanced',
      highlight: 'Practical Vulnerability Testing',
      description: 'Exploitation techniques with Kali Linux, Metasploit, privilege escalation, Wireshark, and Active Directory penetration.',
      icon: Shield,
    },
    {
      id: 'cs-3',
      title: 'Web Hacking (VAPT)',
      category: 'SECURITY',
      categoryLabel: 'Cyber Security',
      duration: '65 Hours Lab · 4-8 Weeks',
      level: 'Advanced',
      highlight: 'OWASP Top 10 & API Hacking',
      description: 'Burp Suite Pro, SQL Injection, Cross-Site Scripting, SSRF, JWT bypass, and GraphQL vulnerability assessments.',
      icon: Shield,
    },

    // --- DATA & AI ---
    {
      id: 'ai-1',
      title: 'Artificial Intelligence',
      category: 'DATA_AI',
      categoryLabel: 'Data & AI',
      duration: '75 Hours Lab · 8-12 Weeks',
      level: 'Advanced',
      highlight: 'ML + AI + Neural Networks',
      description: 'Deep dive into computer vision, NLP transformers, backpropagation, and distributed model training architectures.',
      icon: Cpu,
    },
    {
      id: 'ai-2',
      title: 'Data Analyst',
      category: 'DATA_AI',
      categoryLabel: 'Data & AI',
      duration: '45 Hours Lab · 4-8 Weeks',
      level: 'Beginner',
      highlight: 'Excel, SQL, Power BI, Python',
      description: 'Clean raw enterprise datasets, write performant SQL queries, and build executive intelligence dashboards.',
      icon: Layers,
    },
    {
      id: 'ai-3',
      title: 'Generative AI',
      category: 'DATA_AI',
      categoryLabel: 'Data & AI',
      duration: '40 Hours Lab · 4-8 Weeks',
      level: 'Intermediate',
      highlight: 'AI-Powered Content Creation',
      description: 'Prompt engineering, LangChain agents, retrieval-augmented generation (RAG), and fine-tuning open-source LLMs.',
      icon: Cpu,
    },
    {
      id: 'ai-4',
      title: 'Data Science',
      category: 'DATA_AI',
      categoryLabel: 'Data & AI',
      duration: '65 Hours Lab · 8-12 Weeks',
      level: 'Advanced',
      highlight: 'Data-Driven Decision Making',
      description: 'Statistical modeling, predictive algorithms, Pandas, Scikit-learn, and operational data pipelines.',
      icon: Cpu,
    },
    {
      id: 'ai-5',
      title: 'Python with AI & DL',
      category: 'DATA_AI',
      categoryLabel: 'Data & AI',
      duration: '60 Hours Lab · 4-12 Weeks',
      level: 'Advanced',
      highlight: 'AI-Powered with Deep Learning',
      description: 'TensorFlow, PyTorch, Convolutional Neural Networks, and GPU-accelerated deep learning architectures.',
      icon: Code,
    },
    {
      id: 'ai-6',
      title: 'Python with AI & ML',
      category: 'DATA_AI',
      categoryLabel: 'Data & AI',
      duration: '55 Hours Lab · 4-12 Weeks',
      level: 'Intermediate',
      highlight: 'Machine Learning Pipelines',
      description: 'Supervised and unsupervised learning, regression, classification, random forests, and production inference.',
      icon: Code,
    },

    // --- INTERNSHIPS ---
    {
      id: 'int-1',
      title: 'Cyber Security Internship',
      category: 'INTERNSHIP',
      categoryLabel: 'Industry Internship',
      duration: '4 / 8 / 12 / 24 Weeks',
      level: 'Beginner to Advanced',
      highlight: 'Red Team + Blue Team Exposure',
      description: 'Work on live security audits, simulate adversary attacks, submit vulnerability reports, and earn a Govt + ISO recognized credential.',
      icon: Shield,
    },
    {
      id: 'int-2',
      title: 'Full Stack Development Internship',
      category: 'INTERNSHIP',
      categoryLabel: 'Industry Internship',
      duration: '4 / 8 / 12 / 24 Weeks',
      level: 'Beginner to Advanced',
      highlight: 'Frontend + Backend + Hosting',
      description: 'Work on production SaaS features, participate in code reviews, deploy microservices, and receive placement interview assistance.',
      icon: Code,
    },
    {
      id: 'int-3',
      title: 'AI / ML Internship',
      category: 'INTERNSHIP',
      categoryLabel: 'Industry Internship',
      duration: '4 / 8 / 12 / 24 Weeks',
      level: 'Beginner to Advanced',
      highlight: 'Machine Learning + Projects',
      description: 'Train production models on real-world datasets, build AI agents, and build a resume-ready portfolio with senior mentors.',
      icon: Cpu,
    },
  ];

  const filtered = programs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.highlight.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#040406] text-white font-sans">
      {/* Top Header */}
      <header className="border-b border-[#1E1E28] bg-[#07070A]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-xs text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 text-red-500" />
              <span>Back to Portal</span>
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <span className="text-zinc-600 font-mono">/</span>
            <span className="font-bold text-xs text-white uppercase tracking-wider">Official Curriculum</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Banner with Official Internship Highlights */}
        <section className="bg-[#0B0B10] border border-[#1E1E28] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-6 relative z-10">
            <div>
              <span className="text-[10px] font-mono uppercase bg-red-950/60 text-red-400 border border-red-900/60 px-2.5 py-0.5 rounded tracking-widest font-bold">
                DARK SPACE SECURITY CURRICULUM
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-2">
                Courses & Professional Internships
              </h1>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                Hands-on technical certifications and industry internships across Cyber Security, Web & Software Development, and Data & AI.
              </p>
            </div>

            {/* Official Internship Pillars Strip from image */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-zinc-900">
              {/* Duration Options */}
              <div className="bg-[#07070A] border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-red-500 font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Internship Durations</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-300">
                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <strong className="text-white block">4 Weeks</strong>
                    <span className="text-[10px] text-zinc-500">Beginner Friendly</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <strong className="text-white block">8 Weeks</strong>
                    <span className="text-[10px] text-zinc-500">Project-Based</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <strong className="text-white block">12 Weeks</strong>
                    <span className="text-[10px] text-zinc-500">Skill-Focused</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <strong className="text-white block">24 Weeks</strong>
                    <span className="text-[10px] text-zinc-500">Advanced + Real</span>
                  </div>
                </div>
              </div>

              {/* Domains */}
              <div className="bg-[#07070A] border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-red-500 font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Core Domains</span>
                </div>
                <ul className="text-xs space-y-2 text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span><strong>Cyber Security:</strong> Red team + blue team</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Full Stack Dev:</strong> Frontend + Backend + Host</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span><strong>AI / ML Intern:</strong> Machine learning + projects</span>
                  </li>
                </ul>
              </div>

              {/* Benefits */}
              <div className="bg-[#07070A] border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-red-500 font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Program Benefits</span>
                </div>
                <ul className="text-xs space-y-2 text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span><strong>Certificate:</strong> Govt + ISO Recognised</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span><strong>Live Projects:</strong> Work on industry tasks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span><strong>Placement:</strong> Resume + interview prep</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filter Strip */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Input
              placeholder="Search tracks, tools, topics (e.g. MERN, Python, Ethical Hacking)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#0E0E14] border-zinc-800 text-white placeholder:text-zinc-500 text-xs"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {[
              { id: 'ALL', label: 'All Programs' },
              { id: 'WEB', label: 'Web & Software' },
              { id: 'SECURITY', label: 'Cyber Security' },
              { id: 'DATA_AI', label: 'Data & AI' },
              { id: 'INTERNSHIP', label: 'Internships' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                    : 'bg-[#0E0E14] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="bg-[#0B0B10] border border-[#1E1E28] hover:border-red-600/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-red-950/20 group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-red-400 border border-red-900/40">
                      {p.categoryLabel}
                    </span>
                    <span className="text-zinc-500 text-[11px] font-mono">{p.duration}</span>
                  </div>

                  <div className="flex items-start gap-3 mt-1">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-red-500 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-red-400 transition-colors">
                        {p.title}
                      </h3>
                      <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                        {p.highlight}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                    {p.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase">
                    Level: <strong className="text-zinc-300">{p.level}</strong>
                  </span>
                  <Link href="/login">
                    <Button variant="primary" size="sm" className="bg-gradient-to-r from-red-600 to-red-800 border-none font-bold text-xs">
                      Enroll & Access
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
