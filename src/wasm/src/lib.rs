use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[derive(Clone, Copy)]
struct AIMove {
    x: i32,
    y: i32,
    rotation: i32,
    score: f64,
}

#[wasm_bindgen]
pub struct TetrisAI {
    _private: (),
}

#[wasm_bindgen]
impl TetrisAI {
    #[wasm_bindgen(constructor)]
    pub fn new() -> TetrisAI {
        TetrisAI { _private: () }
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
        let mut best_move = AIMove {
            x: 0,
            y: 0,
            rotation: 0,
            score: f64::NEG_INFINITY,
        };

        // Try all rotations (0-3)
        for rotation in 0..4 {
            let rotated_piece = self.rotate_piece(piece_shape, piece_width, piece_height, rotation);

            // Try all positions
            for y in 0..grid_height {
                for x in 0..grid_width {
                    if self.can_place(grid, grid_width, grid_height, &rotated_piece, x, y) {
                        let move_score = self.evaluate_position(
                            grid,
                            grid_width,
                            grid_height,
                            &rotated_piece,
                            x,
                            y,
                        );

                        if move_score > best_move.score {
                            best_move = AIMove {
                                x: x as i32,
                                y: y as i32,
                                rotation: rotation as i32,
                                score: move_score,
                            };
                        }
                    }
                }
            }
        }

        // Return as array [x, y, rotation, score]
        let result = vec![
            best_move.x,
            best_move.y,
            best_move.rotation,
            (best_move.score * 100.0) as i32, // Scale for integer conversion
        ];
        serde_wasm_bindgen::to_value(&result).unwrap()
    }

    fn rotate_piece(
        &self,
        piece: &[i32],
        width: usize,
        height: usize,
        rotation: usize,
    ) -> Vec<i32> {
        let mut rotated = piece.to_vec();
        let mut current_width = width;
        let mut current_height = height;

        for _ in 0..rotation {
            let mut new_piece = vec![0; current_width * current_height];
            for y in 0..current_height {
                for x in 0..current_width {
                    new_piece[x * current_height + (current_height - 1 - y)] =
                        rotated[y * current_width + x];
                }
            }
            rotated = new_piece;
            std::mem::swap(&mut current_width, &mut current_height);
        }

        rotated
    }

    fn can_place(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
        piece: &[i32],
        x: usize,
        y: usize,
    ) -> bool {
        for py in 0..piece.len() {
            if piece[py] != 0 {
                let grid_y = y + py / 10;
                let grid_x = x + py % 10;

                if grid_x >= grid_width || grid_y >= grid_height {
                    return false;
                }

                if grid_y < grid_height && grid[grid_y * grid_width + grid_x] != 0 {
                    return false;
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
        x: usize,
        y: usize,
    ) -> f64 {
        // Create temporary grid with piece placed
        let mut temp_grid = grid.to_vec();
        for py in 0..piece.len() {
            if piece[py] != 0 {
                let grid_y = y + py / 10;
                let grid_x = x + py % 10;
                if grid_y < grid_height && grid_x < grid_width {
                    temp_grid[grid_y * grid_width + grid_x] = piece[py];
                }
            }
        }

        // Calculate metrics
        let aggregate_height = self.calculate_aggregate_height(&temp_grid, grid_width, grid_height);
        let complete_lines = self.calculate_complete_lines(&temp_grid, grid_width, grid_height);
        let holes = self.calculate_holes(&temp_grid, grid_width, grid_height);
        let bumpiness = self.calculate_bumpiness(&temp_grid, grid_width, grid_height);

        // Weighted score
        complete_lines as f64 * 0.76
            + aggregate_height * -0.51
            + holes as f64 * -0.36
            + bumpiness * -0.18
    }

    fn calculate_aggregate_height(
        &self,
        grid: &[i32],
        grid_width: usize,
        grid_height: usize,
    ) -> f64 {
        let mut total_height = 0.0;

        for col in 0..grid_width {
            for row in 0..grid_height {
                if grid[row * grid_width + col] != 0 {
                    total_height += (grid_height - row) as f64;
                    break;
                }
            }
        }

        total_height
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
                if grid[row * grid_width + col] != 0 {
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
        let mut prev_height: Option<f64> = None;

        for col in 0..grid_width {
            let mut col_height = 0.0;
            for row in 0..grid_height {
                if grid[row * grid_width + col] != 0 {
                    col_height = (grid_height - row) as f64;
                    break;
                }
            }

            if let Some(ph) = prev_height {
                bumpiness += (col_height - ph).abs();
            }
            prev_height = Some(col_height);
        }

        bumpiness
    }
}
