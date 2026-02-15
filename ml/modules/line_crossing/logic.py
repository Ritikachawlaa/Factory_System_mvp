def crossed_line(prev_y, curr_y, line_y):
    if prev_y < line_y and curr_y >= line_y:
        return "UP_TO_DOWN"
    elif prev_y > line_y and curr_y <= line_y:
        return "DOWN_TO_UP"
    return None
