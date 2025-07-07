import { Object3D } from "three";

/**
 * Helper utility to prevent objects from getting stuck inside colliders
 * by applying more aggressive collision response and detection
 */
export const getEnhancedCollisionConfig = (colliderRadius: number, shapeFactor = 1) => {
  return {
    // Physics settings optimized for preventing penetration
    linearDamping: 0.05,  // Even lower damping for more responsive movement
    angularDamping: 0.05, // Even lower damping for better rotation
    material: {
      friction: 0.5,     // Higher friction to slow objects on contact
      restitution: 0.6   // Lower restitution to reduce bouncing inside
    },
    allowSleep: false,
    fixedRotation: false,
    collisionResponse: true,
    // Critical collision settings for proper detection
    collisionFilterGroup: 1,
    collisionFilterMask: -1,
    // Enhanced continuous collision detection settings with much more aggressive parameters
    contactEquationRelaxation: 0.5, // Lower for more immediate response
    contactEquationStiffness: 5e8,  // Much higher for stronger collision force
    frictionEquationStiffness: 5e7, 
    // Use a higher restitution speed for better collision detection
    restitutionSpeed: 15,
    // Very important to prevent sinking - increase collision skin significantly
    contactSkinSize: 0.08 * shapeFactor, // Larger collision skin to catch objects sooner
  };
};

// Store the last time we applied an enhanced impulse per object
const lastImpulseTimes = new Map<any, number>();

/**
 * Enhanced collision handler that applies stronger repulsive forces to prevent objects from sticking
 */
export const getEnhancedCollisionHandler = (api: any) => (e: any) => {
  // Get collision data
  const contactNormal = e.contact.ni;
  const penetrationDepth = e.contact.penetrationDepth || 0.01;
  const impactVelocity = e.contact.impactVelocity || 0.1;
  
  // Calculate impulse strength based on penetration depth - make it significantly stronger
  const impulseStrength = Math.max(0.5, penetrationDepth * 4 * impactVelocity);
  
  // Apply stronger repulsive impulse to push objects out
  api.applyImpulse(
    [contactNormal[0] * impulseStrength, contactNormal[1] * impulseStrength, contactNormal[2] * impulseStrength],
    [0, 0, 0]
  );
  
  // Apply impulse to the colliding body to push it away with more force
  if (e.body && e.body.applyImpulse) {
    const pushStrength = Math.max(0.3, penetrationDepth * 8); // Much stronger push
    e.body.applyImpulse(
      [
        -contactNormal[0] * pushStrength,
        -contactNormal[1] * pushStrength,
        -contactNormal[2] * pushStrength
      ],
      [0, 0, 0]
    );
    
    // Apply a secondary perpendicular impulse to help unstick
    // This creates slight sideways motion that can help break objects free
    const perpVector = [
      contactNormal[1], // y component becomes x
      -contactNormal[0], // -x component becomes y
      0 // keep z unchanged
    ];
    const perpStrength = pushStrength * 0.3;
    e.body.applyImpulse(
      [perpVector[0] * perpStrength, perpVector[1] * perpStrength, perpVector[2] * perpStrength],
      [0, 0, 0]
    );
    
    // Ensure the other body is also awake with high priority
    if (e.body.wakeUp) {
      e.body.wakeUp();
      // Store the wake-up time for this body
      lastImpulseTimes.set(e.body, Date.now());
    }
  }
  
  // Wake up our body with high priority
  api.wakeUp();
  // Store the wake-up time
  lastImpulseTimes.set(api, Date.now());
};

// Track last time we moved and last position for each collider
const lastMoveTimes = new Map<any, number>();
const lastPositions = new Map<any, [number, number, number]>();

/**
 * Helper to add continuous movement detection and collision maintenance during movement
 * with enhanced persistence after mouse movements
 */
export const applyContinuousCollisionWakeup = (
  api: any, 
  hasMoved: boolean, 
  currentPos: [number, number, number] = [0, 0, 0]
) => {
  const now = Date.now();
  const lastMoveTime = lastMoveTimes.get(api) || 0;
  const timeSinceMove = now - lastMoveTime;
  
  // If the object has moved, update its last move time
  if (hasMoved) {
    lastMoveTimes.set(api, now);
    lastPositions.set(api, currentPos);
  }
  
  // Create a more persistent effect after movement
  // Apply impulses for up to 2 seconds after the last movement
  const recentlyMoved = hasMoved || timeSinceMove < 2000;
  const impulseDecayFactor = Math.max(0.2, Math.min(1.0, 1.0 - (timeSinceMove / 2000))); 
  
  // If recently moved, apply a stronger impulse
  if (recentlyMoved) {
    // Apply a random impulse in a slightly upward direction to counter gravity and keep physics active
    const randomDir = Math.random() * Math.PI * 2;
    const baseStrength = hasMoved ? 0.005 : 0.003 * impulseDecayFactor;
    
    // Create a slightly upward-biased impulse
    api.applyImpulse(
      [
        Math.cos(randomDir) * baseStrength, 
        Math.sin(randomDir) * baseStrength + baseStrength * 0.5, // Slight upward bias
        0
      ],
      [0, 0, 0]
    );
    
    // If we actually moved this frame, apply a second directed impulse
    if (hasMoved) {
      // Apply an additional impulse in the direction of movement
      const lastPos = lastPositions.get(api) || [0, 0, 0];
      if (lastPos && lastPos !== currentPos) {
        const moveVector = [
          currentPos[0] - lastPos[0],
          currentPos[1] - lastPos[1],
          currentPos[2] - lastPos[2]
        ];
        
        // Normalize and apply a small impulse in movement direction
        const magnitude = Math.sqrt(moveVector[0]**2 + moveVector[1]**2 + moveVector[2]**2);
        if (magnitude > 0.001) {
          const directedStrength = 0.01;
          api.applyImpulse(
            [
              (moveVector[0] / magnitude) * directedStrength,
              (moveVector[1] / magnitude) * directedStrength,
              (moveVector[2] / magnitude) * directedStrength
            ],
            [0, 0, 0]
          );
        }
      }
    }
  }
  
  // ALWAYS wake up the physics body every frame with high priority
  api.wakeUp();
};
