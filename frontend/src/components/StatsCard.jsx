// Displays a single statistic in a card (used on Dashboard)
// What this component does: Props = data passed to component (like function parameters[title, value, subtitle, icon])
import React from 'react';

const StatsCard = ({ title, value, subtitle, icon}) => {
    return (
        <div className="stats-card">
            {/* header */}
            <div className="stats-header">
                {icon && <div className="stats-icon">{icon}</div>}
                <h3 className="state-title">{title}</h3>
            </div>

            {/* main value */}
            <div className="stats-value">
                ${value.toFixed(2)}.   {/* always shows 2 decimal places (636.00) */}
            </div>

            {/* optional subtitle */}
            {subtitle && (
                <div className="stats-subtitle">
                    {subtitle}
                </div>
            )}
        </div>
    );
};
export default StatsCard;

// HOW TO USE THIS COMPONENT:
// <StatsCard 
//   title="Today's Earnings" 
//   value={636} 
//   subtitle="Set aside $90 for taxes"
// />