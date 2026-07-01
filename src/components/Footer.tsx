import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Footer');
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative z-10 mt-auto border-t border-[var(--line)] bg-[var(--surface-band)]">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-8 md:gap-12 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="crest" aria-hidden="true">M</span>
                            <span className="flex flex-col leading-none">
                                <span className="font-display text-[1.25rem] tracking-tight text-[var(--ink-1)]">
                                    {t('brand')}
                                </span>
                                <span className="text-[10.5px] uppercase tracking-[0.18em] text-[var(--ink-3)] mt-1">
                                    {t('tagline')}
                                </span>
                            </span>
                        </div>
                        <p className="text-[13.5px] leading-relaxed text-[var(--ink-2)] max-w-sm">
                            {t('description')}
                        </p>
                    </div>

                    <div>
                        <h4 className="eyebrow mb-3">{t('siteHeading')}</h4>
                        <ul className="space-y-2 text-[14px] text-[var(--ink-2)]">
                            <li><Link href="/" className="hover:text-[var(--ink-1)] transition-colors">{t('orderEquipment')}</Link></li>
                            <li><Link href="/cart" className="hover:text-[var(--ink-1)] transition-colors">{t('cart')}</Link></li>
                            <li><Link href="/about" className="hover:text-[var(--ink-1)] transition-colors">{t('about')}</Link></li>
                            <li><Link href="/contact" className="hover:text-[var(--ink-1)] transition-colors">{t('contact')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="eyebrow mb-3">{t('helpHeading')}</h4>
                        <ul className="space-y-2 text-[14px] text-[var(--ink-2)]">
                            <li>
                                <a href="tel:+97248780900" className="hover:text-[var(--ink-1)] transition-colors">
                                    {t('serviceCenter')} · 04-878-0900
                                </a>
                            </li>
                            <li>
                                <a href="tel:*5470" className="hover:text-[var(--ink-1)] transition-colors">
                                    {t('quickDial')} · *5470
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.kiryat-motzkin.muni.il"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[var(--ink-1)] transition-colors"
                                >
                                    kiryat-motzkin.muni.il
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="divider-soft mb-6" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[12.5px] text-[var(--ink-3)]">
                    <p>
                        {t.rich('copyright', {
                            year: currentYear,
                            highlight: (chunks) => (
                                <span className="text-[var(--ink-2)]">{chunks}</span>
                            ),
                        })}
                    </p>
                </div>
            </div>
        </footer>
    );
}
