import os
import json

def merge_chunks(manifest_file, output_dir="chunks"):
    """Merges chunks from a JSON manifest back into a single file."""
    with open(manifest_file, "r") as f:
        manifest = json.load(f)

    output_file = manifest["original_file"]
    chunk_files = manifest["chunks"]

    with open(output_file, "wb") as out_f:
        for chunk_name in chunk_files:
            chunk_path = os.path.join(output_dir, chunk_name)
            with open(chunk_path, "rb") as chunk_f:
                out_f.write(chunk_f.read())
            print(f"Chunk {chunk_name} merged.")

    print(f"Merging completed: {output_file}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python merger.py <manifest.json>")
        sys.exit(1)
    merge_chunks(sys.argv[1])
