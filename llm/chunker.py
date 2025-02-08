import os
import json

CHUNK_SIZE = 50 * 1024 * 1024  # 50 MB Max Github free size :D

def chunk_file(input_file, output_dir="chunks"):
    """Splits a binary file into chunks and saves their names in a JSON manifest."""
    os.makedirs(output_dir, exist_ok=True)
    chunk_list = []

    with open(input_file, "rb") as f:
        chunk_index = 0
        while chunk := f.read(CHUNK_SIZE):
            chunk_name = f"{input_file}.chunk{chunk_index}"
            chunk_path = os.path.join(output_dir, chunk_name)
            with open(chunk_path, "wb") as chunk_file:
                chunk_file.write(chunk)
            chunk_list.append("/llm/chunks/"+chunk_name)
            chunk_index += 1

    # Save JSON manifest
    manifest = { "original_file": input_file, "chunks": chunk_list }
    json_path = os.path.join(output_dir, f"{input_file}.json")
    with open(json_path, "w") as f:
        json.dump(manifest, f, indent=4)

    print(f"Chunking completed. Manifest saved as {json_path}.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python chunker.py <file.bin>")
        sys.exit(1)
    chunk_file(sys.argv[1])
