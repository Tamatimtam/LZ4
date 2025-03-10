def lz4_compress(data):
    compressed = []
    i = 0
    while i < len(data):
        # Find the longest match
        max_match_len = 0
        match_offset = 0
        
        # Look back in the data to find matches
        for j in range(max(0, i - 255), i):
            match_len = 0
            while (match_len < 255 and i + match_len < len(data) and data[j + match_len] == data[i + match_len]):
                match_len += 1
            
            if match_len > max_match_len:
                max_match_len = match_len
                match_offset = i - j
        
        if max_match_len >= 3:  # Store match if it's useful
            compressed.append((match_offset, max_match_len))
            i += max_match_len  # Move forward
        else:
            compressed.append(data[i])  # Store as raw byte (literal)
            i += 1
    
    return compressed




def lz4_decompress(compressed):
    decompressed = []
    
    i = 0
    while i < len(compressed):
        if isinstance(compressed[i], tuple):  # Match reference (offset, length)
            offset, length = compressed[i]
            start_pos = len(decompressed) - offset
            for j in range(length):
                decompressed.append(decompressed[start_pos + j])
        else:
            decompressed.append(compressed[i])  # Literal byte
        
        i += 1
    
    return bytes(decompressed)



original_data = b"AAABBBCCC AAABBBCCC AAABBBCCC"
compressed_data = lz4_compress(original_data)
print(f"Original Data: {original_data}")
print(f"Compressed: {compressed_data}")

decompressed_data = lz4_decompress(compressed_data)
print(f"Decompressed: {decompressed_data}")

assert decompressed_data == original_data, "Decompression failed!"
print("Compression and decompression successful!")
