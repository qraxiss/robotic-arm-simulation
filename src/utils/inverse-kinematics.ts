export interface IKResult {
    baseAngle: number;
    upperArmAngle: number;
    lowerArmAngle: number;
}

export function calculateInverseKinematics(
    targetX: number,
    targetY: number,
    targetZ: number,
    upperArmLength: number = 25,
    lowerArmLength: number = 25,
    baseHeight: number = 16.5
): IKResult | null {
    const horizontalDistance = Math.sqrt(targetX * targetX + targetZ * targetZ);
    const baseAngle = Math.atan2(targetZ, targetX);
    
    const adjustedY = targetY - baseHeight;
    const totalDistance = Math.sqrt(horizontalDistance * horizontalDistance + adjustedY * adjustedY);
    
    if (totalDistance > upperArmLength + lowerArmLength) {
        return null;
    }
    
    const cosLowerAngle = (upperArmLength * upperArmLength + lowerArmLength * lowerArmLength - totalDistance * totalDistance) / (2 * upperArmLength * lowerArmLength);
    const lowerArmAngle = Math.acos(cosLowerAngle);
    
    const alpha = Math.atan2(adjustedY, horizontalDistance);
    const beta = Math.acos((upperArmLength * upperArmLength + totalDistance * totalDistance - lowerArmLength * lowerArmLength) / (2 * upperArmLength * totalDistance));
    const upperArmAngle = alpha + beta;
    
    return {
        baseAngle: baseAngle,
        upperArmAngle: upperArmAngle,
        lowerArmAngle: Math.PI - lowerArmAngle
    };
}