/**
 * Optional React Components for Modern UI
 * Can be integrated gradually without breaking existing vanilla JS
 */

import React, { useState, useEffect } from 'react';

// Modern Button Component
export const ModernButton: React.FC<{
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    children: React.ReactNode;
    disabled?: boolean;
}> = ({ onClick, variant = 'primary', children, disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`modern-btn modern-btn-${variant}`}
            style={{
                padding: '0.875rem 1.75rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: variant === 'primary' 
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    : variant === 'danger'
                    ? '#ef4444'
                    : '#2a2a2a',
                color: 'white',
                opacity: disabled ? 0.5 : 1
            }}
        >
            {children}
        </button>
    );
};

// Status Card Component
export const StatusCard: React.FC<{
    title: string;
    value: string | number;
    status?: 'success' | 'warning' | 'error';
}> = ({ title, value, status = 'success' }) => {
    return (
        <div
            className="status-card"
            style={{
                background: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                minWidth: '200px'
            }}
        >
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                {title}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                {value}
            </div>
        </div>
    );
};

// Performance Monitor Component
export const PerformanceMonitor: React.FC<{
    fps: number;
    memory: number;
    cpu: number;
}> = ({ fps, memory, cpu }) => {
    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'rgba(26, 26, 26, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'white',
                zIndex: 10000
            }}
        >
            <div>FPS: {fps}</div>
            <div>Memory: {memory}MB</div>
            <div>CPU: {cpu}%</div>
        </div>
    );
};

// Image Upload Component
export const ImageUploader: React.FC<{
    onUpload: (file: File) => void;
}> = ({ onUpload }) => {
    const [dragging, setDragging] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onUpload(file);
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            style={{
                border: `2px dashed ${dragging ? '#6366f1' : 'rgba(255, 255, 255, 0.2)'}`,
                borderRadius: '12px',
                padding: '3rem',
                textAlign: 'center',
                background: dragging ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                transition: 'all 0.3s',
                cursor: 'pointer'
            }}
        >
            <div style={{ color: 'white', marginBottom: '1rem' }}>
                Drop Windows image here or click to browse
            </div>
            <input
                type="file"
                accept=".img,.iso,.vmdk,.vdi"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file);
                }}
                style={{ display: 'none' }}
                id="image-upload"
            />
            <label htmlFor="image-upload">
                <ModernButton onClick={() => {}}>
                    Select Image
                </ModernButton>
            </label>
        </div>
    );
};

