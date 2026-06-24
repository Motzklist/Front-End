'use client';

import { useTranslations } from 'next-intl';
import Layout from '@/components/Layout';

interface TeamMember {
    login: string;
    name:  string | null;
    role:  'Mentor' | 'Team Member';
}

const teamMembers: TeamMember[] = [
    { login: 'Avnermond12344',    name: 'Avner Mondshine', role: 'Team Member' },
    { login: 'danielyehoshua123', name: null,              role: 'Team Member' },
    { login: 'HarelZeevi',        name: 'Harel Zeevi',     role: 'Team Member' },
    { login: 'idanC1111',         name: null,              role: 'Team Member' },
    { login: 'NoamBenShimon',     name: 'Noam Ben Shimon', role: 'Team Member' },
    { login: 'roishm',            name: 'Roi Shmerling',   role: 'Team Member' },
    { login: 'Tomer-David',       name: null,              role: 'Team Member' },
    { login: 'DianaCohenCS',      name: 'Diana Cohen',     role: 'Mentor' },
];

export default function AboutPage() {
    const t = useTranslations('About');
    const mentors = teamMembers.filter(m => m.role === 'Mentor');
    const members = teamMembers.filter(m => m.role === 'Team Member');

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
                {/* Hero */}
                <header className="mb-14 max-w-2xl animate-rise-in">
                    <p className="eyebrow mb-3">{t('eyebrow')}</p>
                    <h1 className="font-display text-[2.6rem] sm:text-[3rem] leading-[1.05] tracking-tight text-(--ink-1) mb-5">
                        {t('title')}
                    </h1>
                    <p className="text-[1.05rem] leading-relaxed text-ink-2">
                        {t('intro')}
                    </p>
                </header>

                {/* Team */}
                <section>
                    <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
                        <div>
                            <p className="eyebrow mb-2">{t('teamEyebrow')}</p>
                            <h2 className="font-display text-[2rem] tracking-tight text-(--ink-1) leading-tight">
                                {t('teamHeading')}
                            </h2>
                        </div>
                        <p className="text-[13px] text-ink-2 max-w-xs">
                            {t('teamDescription')}
                        </p>
                    </div>

                    {mentors.length > 0 && (
                        <div className="mb-10">
                            <h3 className="text-[11px] uppercase tracking-[0.18em] font-semibold text-(--ink-3) mb-4">
                                {t('roleMentor')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {mentors.map((m, i) => (
                                    <MemberCard key={m.login} member={m} delay={i} mentor mentorLabel={t('roleMentor')} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-[11px] uppercase tracking-[0.18em] font-semibold text-(--ink-3) mb-4">
                            {t('teamMembersHeading')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {members.map((m, i) => (
                                <MemberCard key={m.login} member={m} delay={i + mentors.length} mentorLabel={t('roleMentor')} />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

function MemberCard({
    member,
    delay,
    mentor = false,
    mentorLabel,
}: {
    member: TeamMember;
    delay: number;
    mentor?: boolean;
    mentorLabel: string;
}) {
    return (
        <a
            href={`https://github.com/${member.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group surface-card p-5 hover:border-(--ink-3) hover:-translate-y-0.5 transition-all duration-200 animate-rise-in"
            style={{ animationDelay: `${120 + delay * 50}ms` }}
        >
            <div className="flex items-start gap-4">
                <img
                    src={`https://github.com/${member.login}.png`}
                    alt=""
                    className={`w-14 h-14 rounded-full border ${
                        mentor ? 'border-(--clay-500)' : 'border-(--line-strong)'
                    } group-hover:border-(--brand-700) transition-colors`}
                />
                <div className="min-w-0 flex-1">
                    <h4 className="font-display text-[1.05rem] text-(--ink-1) tracking-tight leading-tight truncate">
                        {member.name || member.login}
                    </h4>
                    <p className="text-[12px] text-(--ink-3) truncate mt-0.5">@{member.login}</p>
                    {mentor && (
                        <p className="mt-2 inline-block text-[10px] uppercase tracking-[0.16em] font-semibold text-(--clay-900) bg-(--clay-50) px-1.5 py-0.5 rounded-sm">
                            {mentorLabel}
                        </p>
                    )}
                </div>
            </div>
        </a>
    );
}
