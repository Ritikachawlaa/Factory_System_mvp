def crossed_line(prev_y, curr_y, line_y):
    if prev_y < line_y and curr_y >= line_y:
        return "IN"
    elif prev_y > line_y and curr_y <= line_y:
        return "OUT"
    return None
