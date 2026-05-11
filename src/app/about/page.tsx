'use client';

import Layout from '@/components/Layout';

interface TeamMember {
    login:  string;
    name:   string | null;
    role:   'Mentor' | 'Team Member';
}

// Team members sorted alphabetically by login, with roles assigned
const teamMembers: TeamMember[] = [
    { login: 'Avnermond12344',      name: 'Avner Mondshine',    role: 'Team Member' },
    { login: 'danielyehoshua123',   name: null,                 role: 'Team Member' },
    { login: 'HarelZeevi',          name: 'Harel Zeevi',        role: 'Team Member' },
    { login: 'idanC1111',           name: null,                 role: 'Team Member' },
    { login: 'NoamBenShimon',       name: 'Noam Ben Shimon',    role: 'Team Member' },
    { login: 'roishm',              name: 'Roi Shmerling',      role: 'Team Member' },
    { login: 'Tomer-David',         name: null,                 role: 'Team Member' },
    { login: 'vMaroon',             name: 'Maroon Ayoub',       role: 'Mentor' },
];

export default function AboutPage() {
    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                        About Us
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        Motzkin Store is a school equipment management system built by a dedicated team
                        of developers. Our goal is to simplify the process of managing and distributing
                        educational equipment to schools.
                    </p>
                </div>

                {/* Team Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white text-center mb-8">
                        Meet Our Team
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {teamMembers.map((member) => (
                            <a
                                key={member.login}
                                href={`https://github.com/${member.login}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200 hover:-translate-y-1"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {/* Avatar */}
                                    <img
                                        src={`https://github.com/${member.login}.png`}
                                        alt={`${member.name || member.login}'s avatar`}
                                        className="w-24 h-24 rounded-full mb-4 ring-2 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-zinc-400 dark:group-hover:ring-zinc-500 transition-all"
                                    />

                                    {/* Name */}
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                                        {member.name || member.login}
                                    </h3>

                                    {/* GitHub Username */}
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                                        @{member.login}
                                    </p>

                                    {/* Role Badge */}
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            member.role === 'Mentor'
                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}
                                    >
                                        {member.role}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

