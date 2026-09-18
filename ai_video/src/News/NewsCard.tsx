import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { COLOR_PRIMARY, COLOR_SECONDARY } from './Constants';

interface NewsCardProps {
    title: string;
    body: string;
    subtitle: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({ title, body, subtitle }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const entrance = spring({
        frame,
        fps,
        config: {
            damping: 15,
            stiffness: 100,
        },
    });

    const subtitleEntrance = spring({
        frame: frame - 10,
        fps,
        config: {
            damping: 15,
        },
    });

    const exit = spring({
        frame: frame - (durationInFrames - 15),
        fps,
        config: {
            damping: 15,
        },
    });

    const opacity = interpolate(
        frame,
        [0, 10, durationInFrames - 10, durationInFrames],
        [0, 1, 1, 0]
    );

    const translateY =
        interpolate(entrance, [0, 1], [100, 0]) +
        interpolate(exit, [0, 1], [0, -100]);

    const subtitleTranslateY = interpolate(subtitleEntrance, [0, 1], [20, 0]);
    const subtitleOpacity = interpolate(subtitleEntrance, [0, 1], [0, 0.8]);

    const scale = interpolate(entrance, [0, 1], [0.8, 1]);
    const blur = interpolate(entrance, [0, 1], [20, 0]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '80px 40px',
                fontFamily: '"Pretendard", "Noto Sans KR", system-ui, sans-serif',
                color: COLOR_SECONDARY,
                textAlign: 'center',
                opacity,
                transform: `translateY(${translateY}px) scale(${scale})`,
                filter: `blur(${blur}px)`,
            }}
        >
            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(30px)',
                    borderRadius: '48px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '80px 40px',
                    width: '100%',
                    boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <div
                    style={{
                        background: 'linear-gradient(90deg, #1a73e8, #60a5fa)',
                        padding: '12px 32px',
                        borderRadius: '100px',
                        fontSize: '22px',
                        fontWeight: '800',
                        marginBottom: '60px',
                        letterSpacing: '5px',
                        color: 'white',
                        textTransform: 'uppercase',
                        boxShadow: '0 10px 20px rgba(26, 115, 232, 0.3)',
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        fontSize: '68px',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        whiteSpace: 'pre-line',
                        background: 'linear-gradient(to bottom, #ffffff, #e2e8f0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-2px',
                        marginBottom: '40px',
                    }}
                >
                    {body}
                </div>

                <div
                    style={{
                        fontSize: '32px',
                        fontWeight: 500,
                        lineHeight: 1.5,
                        color: 'rgba(255, 255, 255, 0.8)',
                        whiteSpace: 'pre-line',
                        opacity: subtitleOpacity,
                        transform: `translateY(${subtitleTranslateY}px)`,
                        maxWidth: '90%',
                    }}
                >
                    {subtitle}
                </div>

                <div
                    style={{
                        marginTop: '80px',
                        width: '60px',
                        height: '4px',
                        background: 'linear-gradient(90deg, transparent, #1a73e8, transparent)',
                        opacity: 0.8,
                    }}
                />
            </div>
        </div>
    );
};
