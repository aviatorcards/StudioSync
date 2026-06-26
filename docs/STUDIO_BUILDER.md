# Studio Builder - Vision

## Overview
The Studio Builder is a visual interface that allows studio owners to design their physical studio layout, define rooms, and manage equipment placement.

## Features

- **Drag & Drop Interface**: Drag room templates (Studio A, Reception, Waiting Area) onto a grid.
- **Room Configuration**: Define room name, capacity, hourly rate, and included equipment.
- **Inventory Integration**: Link inventory items (pianos, drum kits) to specific rooms.
- **Visual Status**: Real-time occupancy status (which rooms are currently in use).

## Data Model

### StudioRoom
- `studio`: Link to Studio.
- `name`: string.
- `type`: 'lesson_room', 'waiting_area', 'performance_hall'.
- `capacity`: integer.
- `grid_x`, `grid_y`: Positioning for the visual builder.
- `width`, `height`: Dimensions.

## Implementation Plan

1. **Backend**:
   - Create `StudioRoom` model and API endpoints.
   - Add positioning fields to allow persistence of the layout.

2. **Frontend**:
   - Create a grid-based canvas for the builder.
   - Use `dnd-kit` or similar for drag-and-drop.
   - Implement a "Room Library" with presets.

3. **Integration**:
   - Link rooms to the main scheduling system.
   - Allow students to book specific rooms during lesson scheduling.
