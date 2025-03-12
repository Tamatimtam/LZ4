def lz4_compress(data):
    # This will hold our compressed data
    result = []

    # Start from the beginning of the data
    current_position = 0

    # Process the entire data
    while current_position < len(data):
        # We'll try to find repeated patterns in the data
        best_match_length = 0  # How many characters match
        best_match_position = 0  # Where the match was found

        # Look back at what we've already seen (up to 255 bytes back)
        # This is like looking in the rear-view mirror
        earliest_position = max(0, current_position - 255)

        # Check each previous position to see if it matches current data
        for previous_position in range(earliest_position, current_position):
            # Start counting matching bytes
            matching_bytes = 0

            # Keep counting as long as bytes match (up to 255 max)
            while (data[previous_position + matching_bytes] == data[current_position + matching_bytes] and  # Bytes match
                   matching_bytes < 255 and  # Don't match more than 255 bytes
                   current_position + matching_bytes < len(data)):  # Don't go past the end
                matching_bytes += 1

            # Remember if this is the best match so far
            if matching_bytes > best_match_length:
                best_match_length = matching_bytes
                best_match_position = current_position - previous_position  # This is the "distance" back

        # If we found a good match (at least 3 bytes long)
        if best_match_length >= 3:
            # Store the match as: (how far to look back, how many bytes to copy)
            result.append((best_match_position, best_match_length))
            # Move forward by the match length
            current_position += best_match_length
        else:
            # No good match found, just store the original byte
            result.append(data[current_position])
            # Move to the next byte
            current_position += 1

    return result


def lz4_decompress(compressed):
    # This will hold our decompressed data
    decompressed = []

    # Start from the beginning of the compressed data
    current_position = 0

    # Process the entire compressed data
    while current_position < len(compressed):
        # Check if this is a match reference (offset, length) or a literal byte
        if isinstance(compressed[current_position], tuple):
            # It's a match reference
            offset, length = compressed[current_position]

            # Calculate where to start copying from (looking back in our output)
            start_pos = len(decompressed) - offset

            # Copy the matched bytes from our already decompressed data
            for i in range(length):
                decompressed.append(decompressed[start_pos + i])
        else:
            # It's a literal byte, just add it to our output
            decompressed.append(compressed[current_position])

        # Move to the next element in the compressed data
        current_position += 1

    # Convert the list of bytes to a bytes object
    return bytes(decompressed)



original_data = b"AAABBB AAABBB"
compressed_data = lz4_compress(original_data)
print(f"Original Data: {original_data}")
print(f"Compressed: {compressed_data}")

decompressed_data = lz4_decompress(compressed_data)
print(f"Decompressed: {decompressed_data}")

assert decompressed_data == original_data, "Decompression failed!"
print("Compression and decompression successful!")
