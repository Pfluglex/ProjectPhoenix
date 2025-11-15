import type { Space3D, GridPosition } from '../types';
import { GRID_CONFIG } from './constants';

export class GridManager {
  private occupiedCells: Set<string> = new Set();
  private spaces: Map<string, Space3D> = new Map();
  private snapSize: number;

  constructor(snapSize: number = GRID_CONFIG.defaultSnap) {
    this.snapSize = snapSize;
  }

  // ===== SNAP TO GRID =====

  /**
   * Snap a value to the grid
   */
  snapToGrid(value: number): number {
    return Math.round(value / this.snapSize) * this.snapSize;
  }

  /**
   * Snap a position to the grid
   */
  snapPosition(position: GridPosition): GridPosition {
    return {
      x: this.snapToGrid(position.x),
      y: this.snapToGrid(position.y),
      z: position.z, // Don't snap vertical
    };
  }

  /**
   * Set snap size
   */
  setSnapSize(size: number) {
    if ((GRID_CONFIG.snapSizes as readonly number[]).includes(size)) {
      this.snapSize = size;
    }
  }

  /**
   * Get current snap size
   */
  getSnapSize(): number {
    return this.snapSize;
  }

  // ===== PLACEMENT & COLLISION =====

  /**
   * Check if a space can be placed at position without collision
   */
  canPlace(space: Space3D, position: GridPosition): boolean {
    const cells = this.getCellsForSpace(space, position);
    return cells.every(cell => !this.occupiedCells.has(cell));
  }

  /**
   * Get all grid cells occupied by a space (accounting for rotation)
   * Uses 1-foot grid cells for accurate collision detection
   */
  getCellsForSpace(space: Space3D, position: GridPosition): string[] {
    const cells: string[] = [];

    // Rotation swaps width/depth for 90° and 270°
    const [w, d] = space.rotation % 180 === 0
      ? [space.width, space.depth]
      : [space.depth, space.width];

    // Iterate through all 1-foot cells the space occupies
    for (let x = Math.floor(position.x); x < Math.floor(position.x + w); x++) {
      for (let y = Math.floor(position.y); y < Math.floor(position.y + d); y++) {
        cells.push(`${x},${y},${position.z}`);
      }
    }

    return cells;
  }

  /**
   * Place a space on the grid
   */
  placeSpace(space: Space3D): boolean {
    if (!this.canPlace(space, space.position)) {
      return false;
    }

    const cells = this.getCellsForSpace(space, space.position);
    cells.forEach(cell => this.occupiedCells.add(cell));
    this.spaces.set(space.id, space);
    return true;
  }

  /**
   * Remove a space from the grid
   */
  removeSpace(spaceId: string): void {
    const space = this.spaces.get(spaceId);
    if (!space) return;

    const cells = this.getCellsForSpace(space, space.position);
    cells.forEach(cell => this.occupiedCells.delete(cell));
    this.spaces.delete(spaceId);
  }

  /**
   * Move a space (remove from old position, place at new)
   */
  moveSpace(spaceId: string, newPosition: GridPosition): boolean {
    const space = this.spaces.get(spaceId);
    if (!space) return false;

    // Remove from current position
    this.removeSpace(spaceId);

    // Try to place at new position
    const updatedSpace = { ...space, position: newPosition };
    if (this.placeSpace(updatedSpace)) {
      return true;
    }

    // If failed, restore to original position
    this.placeSpace(space);
    return false;
  }

  /**
   * Rotate a space 90° clockwise
   */
  rotateSpace(spaceId: string): boolean {
    const space = this.spaces.get(spaceId);
    if (!space) return false;

    this.removeSpace(spaceId);

    const rotatedSpace = {
      ...space,
      rotation: ((space.rotation + 90) % 360) as 0 | 90 | 180 | 270
    };

    if (this.placeSpace(rotatedSpace)) {
      return true;
    }

    // If failed, restore original
    this.placeSpace(space);
    return false;
  }

  // ===== ADJACENCY DETECTION =====

  /**
   * Find all adjacencies (spaces sharing edges)
   */
  findAdjacencies(spaces: Space3D[]): Map<string, Set<string>> {
    const adjacencies = new Map<string, Set<string>>();

    for (let i = 0; i < spaces.length; i++) {
      for (let j = i + 1; j < spaces.length; j++) {
        if (this.areAdjacent(spaces[i], spaces[j])) {
          this.addAdjacency(adjacencies, spaces[i].id, spaces[j].id);
        }
      }
    }

    return adjacencies;
  }

  /**
   * Check if two spaces share an edge
   */
  private areAdjacent(a: Space3D, b: Space3D): boolean {
    // Must be on same floor
    if (a.position.z !== b.position.z) return false;

    // Get actual dimensions accounting for rotation
    const [aW, aD] = a.rotation % 180 === 0
      ? [a.width, a.depth]
      : [a.depth, a.width];
    const [bW, bD] = b.rotation % 180 === 0
      ? [b.width, b.depth]
      : [b.depth, b.width];

    const aRight = a.position.x + aW;
    const aBottom = a.position.y + aD;
    const bRight = b.position.x + bW;
    const bBottom = b.position.y + bD;

    // Check if A's right edge touches B's left edge (vertical adjacency)
    if (aRight === b.position.x &&
        this.rangesOverlap(a.position.y, aBottom, b.position.y, bBottom)) {
      return true;
    }

    // Check if A's bottom edge touches B's top edge (horizontal adjacency)
    if (aBottom === b.position.y &&
        this.rangesOverlap(a.position.x, aRight, b.position.x, bRight)) {
      return true;
    }

    // Check if B's right edge touches A's left edge
    if (bRight === a.position.x &&
        this.rangesOverlap(b.position.y, bBottom, a.position.y, aBottom)) {
      return true;
    }

    // Check if B's bottom edge touches A's top edge
    if (bBottom === a.position.y &&
        this.rangesOverlap(b.position.x, bRight, a.position.x, aRight)) {
      return true;
    }

    return false;
  }

  /**
   * Helper: Check if two 1D ranges overlap
   */
  private rangesOverlap(a1: number, a2: number, b1: number, b2: number): boolean {
    return Math.max(a1, b1) < Math.min(a2, b2);
  }

  /**
   * Helper: Add bidirectional adjacency
   */
  private addAdjacency(
    adjacencies: Map<string, Set<string>>,
    id1: string,
    id2: string
  ): void {
    if (!adjacencies.has(id1)) adjacencies.set(id1, new Set());
    if (!adjacencies.has(id2)) adjacencies.set(id2, new Set());
    adjacencies.get(id1)!.add(id2);
    adjacencies.get(id2)!.add(id1);
  }

  // ===== SPATIAL QUERIES =====

  /**
   * Get bounding box of all spaces
   */
  getBoundingBox(spaces: Space3D[]): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    depth: number;
  } {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    spaces.forEach(space => {
      const [w, d] = space.rotation % 180 === 0
        ? [space.width, space.depth]
        : [space.depth, space.width];

      minX = Math.min(minX, space.position.x);
      minY = Math.min(minY, space.position.y);
      maxX = Math.max(maxX, space.position.x + w);
      maxY = Math.max(maxY, space.position.y + d);
    });

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      depth: maxY - minY
    };
  }

  /**
   * Check if space is on building perimeter
   */
  isOnPerimeter(space: Space3D, bounds: ReturnType<typeof this.getBoundingBox>): boolean {
    const [w, d] = space.rotation % 180 === 0
      ? [space.width, space.depth]
      : [space.depth, space.width];

    const spaceRight = space.position.x + w;
    const spaceBottom = space.position.y + d;

    return (
      space.position.x === bounds.minX ||
      spaceRight === bounds.maxX ||
      space.position.y === bounds.minY ||
      spaceBottom === bounds.maxY
    );
  }

  /**
   * Get all spaces
   */
  getAllSpaces(): Space3D[] {
    return Array.from(this.spaces.values());
  }

  /**
   * Get space by ID
   */
  getSpace(id: string): Space3D | undefined {
    return this.spaces.get(id);
  }

  /**
   * Clear all spaces
   */
  clear(): void {
    this.occupiedCells.clear();
    this.spaces.clear();
  }
}
