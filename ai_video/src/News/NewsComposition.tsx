import React from 'react';
import { Audio, Series, staticFile, useVideoConfig } from 'remotion';
import { Background } from './Background';
import { NEWS_DATA } from './Constants';
import { NewsCard } from './NewsCard';

export const NewsComposition: React.FC = () => {
    const { fps } = useVideoConfig();

    return (
        <div style={{ flex: 1, backgroundColor: 'black', position: 'relative' }}>
            <Background />
            <Series>
                {NEWS_DATA.map((item) => (
                    <Series.Sequence
                        key={item.id}
                        durationInFrames={item.duration * fps}
                    >
                        <Audio src={staticFile(`audio/${item.id}.mp3`)} />
                        <NewsCard
                            title={item.title}
                            body={item.body}
                            subtitle={item.subtitle}
                        />
                    </Series.Sequence>
                ))}
            </Series>

            {/* Decorative Elements */}
            <div
                style={{
                    position: 'absolute',
                    top: '100px',
                    left: '60px',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: 'white',
                    opacity: 0.8,
                    borderLeft: '4px solid #1a73e8',
                    paddingLeft: '16px',
                }}
            >
                NEWS LIVE
            </div>

            <div
                style={{
                    position: 'absolute',
                    bottom: '100px',
                    right: '60px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                    opacity: 0.6,
                }}
            >
                2026.02.19
            </div>

            {/* Corner News Ticker Style */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '60px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#ff0000',
                    boxShadow: '0 0 10px #ff0000',
                }}
            />
        </div>
    );
};
