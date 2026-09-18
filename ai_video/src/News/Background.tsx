import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLOR_BG_END, COLOR_BG_START } from './Constants';

export const Background: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const rotation = interpolate(frame, [0, durationInFrames], [0, 360]);
    const opacity = interpolate(
        Math.sin((frame / durationInFrames) * Math.PI * 10),
        [-1, 1],
        [0.8, 1]
    );

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(${rotation}deg, ${COLOR_BG_START}, ${COLOR_BG_END})`,
                opacity,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background:
                        'radial-gradient(circle, rgba(26,115,232,0.1) 0%, rgba(0,0,0,0) 70%)',
                    transform: `translate(${Math.sin(frame / 60) * 10}%, ${Math.cos(frame / 60) * 10
                        }%)`,
                }}
            />
        </div>
    );
};
