def crossed_line(prev_x, curr_x, line_x):
    if prev_x < line_x and curr_x >= line_x:
        return "LEFT_TO_RIGHT"
    elif prev_x > line_x and curr_x <= line_x:
        return "RIGHT_TO_LEFT"
    return None
