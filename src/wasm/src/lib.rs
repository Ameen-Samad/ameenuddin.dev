use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[derive(Clone, Copy, Debug)]
struct AIMove {
    x: i32,
    y: i32,
    rotation: i32,
    score: f64,
}

#[wasm_bindgen]
pub struct TetrisAI {
    beam_width: usize,
    future_discount: f64,
}

#[wasm_bindgen]
impl TetrisAI {
    #[wasm_bindgen(constructor)]
    pub fn new() -> TetrisAI {
        TetrisAI {
            beam_width: 5,           // Keep top 5 positions for beam search
            future_discount: 0.75,   // Weight future moves at 75% of current
        }
    }

    #[wasm_bindgen]
    pub fn get_best_move(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
        piece_shape: &[i32],
        piece_width: usize,
        piece_height: usize,
    ) -> JsValue {
        // Fallback to simple heuristic if no next piece provided
        self.get_best_move_simple(grid, grid_width, grid_height, piece_shape, piece_width, piece_height)
    }

    #[wasm_bindgen]
    pub fn get_best_move_with_lookahead(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
        piece_shape: &[i32],
        piece_width: usize,
        piece_height: usize,
        next_piece_shape: &[i32],
        next_piece_width: usize,
        next_piece_height: usize,
    ) -> JsValue {
        let mut best_move = AIMove {
            x: 0,
            y: 0,
            rotation: 0,
            score: f64::NEG_INFINITY,
        };

        // PHASE 1: Evaluate all possible moves for current piece
        let mut candidate_moves = Vec::new();

        for rotation in 0..4 {
            let (rotated_piece, rotated_width, rotated_height) =
                self.rotate_piece(piece_shape, piece_width, piece_height, rotation);

            for x in 0..=(grid_width as i32 - rotated_width as i32) {
                if let Some(landing_y) = self.find_landing_position(
                    grid,
                    grid_width,
                    grid_height,
                    &rotated_piece,
                    rotated_width,
                    rotated_height,
                    x as usize,
                ) {
                    // Calculate immediate score
                    let immediate_score = self.evaluate_position(
                        grid,
                        grid_width,
                        grid_height,
                        &rotated_piece,
                        rotated_width,
                        rotated_height,
                        x as usize,
                        landing_y,
                    );

                    candidate_moves.push((
                        AIMove {
                            x,
                            y: landing_y as i32,
                            rotation: rotation as i32,
                            score: immediate_score,
                        },
                        rotated_piece.clone(),
                        rotated_width,
                        rotated_height,
                    ));
                }
            }
        }

        // Sort by immediate score and keep top beam_width candidates
        candidate_moves.sort_by(|a, b| b.0.score.partial_cmp(&a.0.score).unwrap());
        candidate_moves.truncate(self.beam_width);

        // PHASE 2: For each candidate, evaluate best next piece placement
        for (candidate_move, piece, piece_w, piece_h) in candidate_moves {
            // Create temporary grid with current piece placed
            let temp_grid = self.place_piece_on_grid(
                grid,
                grid_width,
                grid_height,
                &piece,
                piece_w,
                piece_h,
                candidate_move.x as usize,
                candidate_move.y as usize,
            );

            // Clear any complete lines from temp grid
            let (cleared_grid, _lines_cleared) = self.clear_lines_from_grid(&temp_grid, grid_width, grid_height);

            // Find best placement for next piece on this future board
            let next_piece_score = self.evaluate_best_next_piece(
                &cleared_grid,
                grid_width,
                grid_height,
                next_piece_shape,
                next_piece_width,
                next_piece_height,
            );

            // Combined score: immediate + discounted future
            let combined_score = candidate_move.score + self.future_discount * next_piece_score;

            if combined_score > best_move.score {
                best_move = AIMove {
                    x: candidate_move.x,
                    y: candidate_move.y,
                    rotation: candidate_move.rotation,
                    score: combined_score,
                };
            }
        }

        // Return as JavaScript array
        let result = vec![
            best_move.x,
            best_move.y,
            best_move.rotation,
            (best_move.score * 100.0) as i32,
        ];
        serde_wasm_bindgen::to_value(&result).unwrap()
    }

    fn get_best_move_simple(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
        piece_shape: &[i32],
        piece_width: usize,
        piece_height: usize,
    ) -> JsValue {
        let mut best_move = AIMove {
            x: 0,
            y: 0,
            rotation: 0,
            score: f64::NEG_INFINITY,
        };

        // Try all 4 rotations
        for rotation in 0..4 {
            let (rotated_piece, rotated_width, rotated_height) =
                self.rotate_piece(piece_shape, piece_width, piece_height, rotation);

            // Try all horizontal positions
            for x in 0..=(grid_width as i32 - rotated_width as i32) {
                // Find the landing position (drop simulation)
                if let Some(landing_y) = self.find_landing_position(
                    grid,
                    grid_width,
                    grid_height,
                    &rotated_piece,
                    rotated_width,
                    rotated_height,
                    x as usize,
                ) {
                    let move_score = self.evaluate_position(
                        grid,
                        grid_width,
                        grid_height,
                        &rotated_piece,
                        rotated_width,
                        rotated_height,
                        x as usize,
                        landing_y,
                    );

                    if move_score > best_move.score {
                        best_move = AIMove {
                            x,
                            y: landing_y as i32,
                            rotation: rotation as i32,
                            score: move_score,
                        };
                    }
                }
            }
        }

        // Return as JavaScript array
        let result = vec![
            best_move.x,
            best_move.y,
            best_move.rotation,
            (best_move.score * 100.0) as i32,
        ];
        serde_wasm_bindgen::to_value(&result).unwrap()
    }

    fn evaluate_best_next_piece(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
        piece_shape: &[i32],
        piece_width: usize,
        piece_height: usize,
    ) -> f64 {
        let mut best_score = f64::NEG_INFINITY;

        // Try all rotations and positions for next piece
        for rotation in 0..4 {
            let (rotated_piece, rotated_width, rotated_height) =
                self.rotate_piece(piece_shape, piece_width, piece_height, rotation);

            for x in 0..=(grid_width as i32 - rotated_width as i32) {
                if let Some(landing_y) = self.find_landing_position(
                    grid,
                    grid_width,
                    grid_height,
                    &rotated_piece,
                    rotated_width,
                    rotated_height,
                    x as usize,
                ) {
                    let score = self.evaluate_position(
                        grid,
                        grid_width,
                        grid_height,
                        &rotated_piece,
                        rotated_width,
                        rotated_height,
                        x as usize,
                        landing_y,
                    );

                    if score > best_score {
                        best_score = score;
                    }
                }
            }
        }

        best_score
    }

    fn place_piece_on_grid(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
        piece: &[i32],
        piece_width: usize,
        piece_height: usize,
        x: usize,
        y: usize,
    ) -> Vec<i32> {
        let mut temp_grid = grid.to_vec();

        for py in 0..piece_height {
            for px in 0..piece_width {
                let piece_idx = py * piece_width + px;
                if piece[piece_idx] != 0 {
                    let grid_x = x + px;
                    let grid_y = y + py;
                    if grid_y < grid_height && grid_x < grid_width {
                        let grid_idx = grid_y * grid_width + grid_x;
                        temp_grid[grid_idx] = 1;
                    }
                }
            }
        }

        temp_grid
    }

    fn clear_lines_from_grid(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
    ) -> (Vec<i32>, usize) {
        let mut new_grid = Vec::new();
        let mut lines_cleared = 0;

        // Copy non-complete rows
        for row in 0..grid_height {
            let row_start = row * grid_width;
            let row_end = row_start + grid_width;
            let row_slice = &grid[row_start..row_end];

            let is_complete = row_slice.iter().all(|&cell| cell != 0);

            if !is_complete {
                new_grid.extend_from_slice(row_slice);
            } else {
                lines_cleared += 1;
            }
        }

        // Add empty rows at top
        for _ in 0..lines_cleared {
            new_grid.splice(0..0, vec![0; grid_width]);
        }

        (new_grid, lines_cleared)
    }

    fn rotate_piece(
        &self,
        piece: &[i32],
        width: usize,
        height: usize,
        rotation: usize,
    ) -> (Vec<i32>, usize, usize) {
        let mut current_piece = piece.to_vec();
        let mut current_width = width;
        let mut current_height = height;

        for _ in 0..(rotation % 4) {
            let new_width = current_height;
            let new_height = current_width;
            let mut new_piece = vec![0; new_width * new_height];

            for y in 0..current_height {
                for x in 0..current_width {
                    let old_idx = y * current_width + x;
                    let new_x = current_height - 1 - y;
                    let new_y = x;
                    let new_idx = new_y * new_width + new_x;
                    new_piece[new_idx] = current_piece[old_idx];
                }
            }

            current_piece = new_piece;
            current_width = new_width;
            current_height = new_height;
        }

        (current_piece, current_width, current_height)
    }

    fn find_landing_position(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
        piece: &[i32],
        piece_width: usize,
        piece_height: usize,
        x: usize,
    ) -> Option<usize> {
        // Start from top and drop down until collision
        for y in 0..grid_height {
            if !self.can_place(grid, grid_width, grid_height, piece, piece_width, piece_height, x, y)
            {
                // Hit something, return previous valid position
                if y > 0 {
                    return Some(y - 1);
                } else {
                    return None; // Can't place at all
                }
            }
        }
        // If we got here, piece can go to bottom
        Some(grid_height - 1)
    }

    fn can_place(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
        piece: &[i32],
        piece_width: usize,
        piece_height: usize,
        x: usize,
        y: usize,
    ) -> bool {
        for py in 0..piece_height {
            for px in 0..piece_width {
                let piece_idx = py * piece_width + px;
                if piece[piece_idx] != 0 {
                    let grid_x = x + px;
                    let grid_y = y + py;

                    // Check bounds
                    if grid_x >= grid_width || grid_y >= grid_height {
                        return false;
                    }

                    // Check collision
                    let grid_idx = grid_y * grid_width + grid_x;
                    if grid[grid_idx] != 0 {
                        return false;
                    }
                }
            }
        }
        true
    }

    fn evaluate_position(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
        piece: &[i32],
        piece_width: usize,
        piece_height: usize,
        x: usize,
        y: usize,
    ) -> f64 {
        // Create temporary grid with piece placed
        let mut temp_grid = grid.to_vec();
        for py in 0..piece_height {
            for px in 0..piece_width {
                let piece_idx = py * piece_width + px;
                if piece[piece_idx] != 0 {
                    let grid_x = x + px;
                    let grid_y = y + py;
                    if grid_y < grid_height && grid_x < grid_width {
                        let grid_idx = grid_y * grid_width + grid_x;
                        temp_grid[grid_idx] = 1; // Mark as filled
                    }
                }
            }
        }

        // Calculate heuristic features
        let complete_lines = self.calculate_complete_lines(&temp_grid, grid_width, grid_height);
        let holes = self.calculate_holes(&temp_grid, grid_width, grid_height);
        let bumpiness = self.calculate_bumpiness(&temp_grid, grid_width, grid_height);
        let aggregate_height = self.calculate_aggregate_height(&temp_grid, grid_width, grid_height);
        let max_height = self.calculate_max_height(&temp_grid, grid_width, grid_height);
        let wells = self.calculate_wells(&temp_grid, grid_width, grid_height);

        // GA-optimized heuristic weights with slight boost to line clearing
        let score = complete_lines as f64 * 3.8
            - holes as f64 * 0.8
            - bumpiness * 0.36
            - aggregate_height * 0.51
            - max_height * 0.65
            - wells as f64 * 0.12;

        score
    }

    fn calculate_complete_lines(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
    ) -> usize {
        let mut complete_lines = 0;

        for row in 0..grid_height {
            let mut is_complete = true;
            for col in 0..grid_width {
                if grid[row * grid_width + col] == 0 {
                    is_complete = false;
                    break;
                }
            }
            if is_complete {
                complete_lines += 1;
            }
        }

        complete_lines
    }

    fn calculate_holes(&self, grid: &[i32], grid_width: usize, grid_height: usize) -> usize {
        let mut holes = 0;

        for col in 0..grid_width {
            let mut block_found = false;
            for row in 0..grid_height {
                let idx = row * grid_width + col;
                if grid[idx] != 0 {
                    block_found = true;
                } else if block_found {
                    holes += 1;
                }
            }
        }

        holes
    }

    fn calculate_bumpiness(&self, grid: &[i32], grid_width: usize, grid_height: usize) -> f64 {
        let mut bumpiness = 0.0;
        let mut prev_height: Option<usize> = None;

        for col in 0..grid_width {
            let col_height = self.get_column_height(grid, grid_width, grid_height, col);

            if let Some(ph) = prev_height {
                bumpiness += (col_height as i32 - ph as i32).abs() as f64;
            }
            prev_height = Some(col_height);
        }

        bumpiness
    }

    fn calculate_aggregate_height(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
    ) -> f64 {
        let mut total_height = 0;

        for col in 0..grid_width {
            total_height += self.get_column_height(grid, grid_width, grid_height, col);
        }

        total_height as f64
    }

    fn calculate_max_height(&self, grid: &[i32], grid_width: usize, grid_height: usize) -> f64 {
        let mut max_height = 0;

        for col in 0..grid_width {
            let height = self.get_column_height(grid, grid_width, grid_height, col);
            if height > max_height {
                max_height = height;
            }
        }

        max_height as f64
    }

    fn calculate_wells(&self, grid: &[i32], grid_width: usize, grid_height: usize) -> usize {
        let mut wells = 0;

        for col in 0..grid_width {
            for row in 0..grid_height {
                let idx = row * grid_width + col;
                if grid[idx] == 0 {
                    let left_blocked = col == 0 || grid[row * grid_width + (col - 1)] != 0;
                    let right_blocked =
                        col == grid_width - 1 || grid[row * grid_width + (col + 1)] != 0;

                    if left_blocked && right_blocked {
                        // Count depth of well
                        let mut depth = 0;
                        for check_row in row..grid_height {
                            let check_idx = check_row * grid_width + col;
                            if grid[check_idx] == 0 {
                                depth += 1;
                            } else {
                                break;
                            }
                        }
                        wells += depth;
                    }
                }
            }
        }

        wells
    }

    fn get_column_height(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
        col: usize,
    ) -> usize {
        for row in 0..grid_height {
            if grid[row * grid_width + col] != 0 {
                return grid_height - row;
            }
        }
        0
    }
}
