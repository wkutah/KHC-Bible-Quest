import { WheelSegment } from '../types/game';

export const WHEEL_SEGMENTS: WheelSegment[] = [
    { id: '1', type: 'POINTS', value: 100, color: '#3B82F6', label: '100' },
    { id: '2', type: 'POINTS', value: 200, color: '#22C55E', label: '200' },
    { id: '3', type: 'POINTS', value: 300, color: '#EAB308', label: '300' },
    { id: '4', type: 'LOSE_TURN', color: '#EF4444', label: 'LOSE TURN' },
    { id: '5', type: 'POINTS', value: 50, color: '#A855F7', label: '50' },
    { id: '6', type: 'FREE_HINT', color: '#F97316', label: 'FREE HINT' },
    { id: '7', type: 'POINTS', value: 500, color: '#EC4899', label: '500' },
    { id: '8', type: 'BANKRUPT', color: '#1E293B', label: 'BANKRUPT' },
];

export const getWheelSegmentAtAngle = (angle: number): WheelSegment => {
    // detailed logic for determining segment based on rotation angle would go here
    // for now, we process index
    const segmentCount = WHEEL_SEGMENTS.length;
    const segmentAngle = 360 / segmentCount;
    const index = Math.floor(((angle % 360) / segmentAngle));
    return WHEEL_SEGMENTS[index];
};
