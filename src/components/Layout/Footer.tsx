import React from 'react';

export const Footer: React.FC = () => {
    return (
        <>
            <footer className="zen-footer">
                <div className="zen-footer-inner">
                    <span>Heaven</span><span>Earth</span><span>Water</span><span>Fire</span>
                </div>
            </footer>
            {/* Extended footer — uses CSS vars directly to guarantee dark mode works */}
            <footer
                style={{
                    backgroundColor: 'var(--bg)',
                    borderTop: '1px solid var(--fg, #1a1a1a)',
                    borderTopColor: 'color-mix(in srgb, var(--fg) 8%, transparent)',
                    paddingTop: '4rem',
                    paddingBottom: '2rem',
                    transition: 'background-color 0.3s ease',
                }}
            >
                <div className="px-6 lg:px-20 max-w-[1400px] mx-auto text-center">
                    <p
                        style={{
                            fontSize: '0.75rem',
                            color: 'color-mix(in srgb, var(--fg) 40%, transparent)',
                        }}
                    >
                        © 2026 My Grimoria Oracle. All rights reserved.
                    </p>
                </div>
            </footer>
        </>
    );
};
