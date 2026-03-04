// app/organizer/layout.tsx
import React from 'react';

interface OrganizerLayoutProps {
    children: React.ReactNode;
}

// Minimal layout - the ConditionalLayout already handles the OrganizerClientLayout
const OrganizerLayout: React.FC<OrganizerLayoutProps> = ({ children }) => {
    return <>{children}</>;
};

export default OrganizerLayout;