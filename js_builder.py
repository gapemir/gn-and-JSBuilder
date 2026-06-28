import argparse
import hashlib
import pickle
import time
from graphlib import TopologicalSorter
import jsbeautifier

from parse import parse
from cache import *

VERSION = "1.0.0"
VERBOSE = False

CACHE_FOLDER = ".bdata/"

def calc_hash(string :str):
    md5 = hashlib.md5()
    sha1 = hashlib.sha1()
    md5.update(string.encode())
    sha1.update(string.encode())
    return {
        "md5" : md5.hexdigest(),
        "sha1" : sha1.hexdigest()
    }

def analyze_file(hashes :dict, filename :str, js_src :str):
    file_path = os.path.join(js_src, filename)

    with open(file_path, 'r') as f:
        code = f.read()

    new_hash = calc_hash(code)
    if filename in hashes and hashes[filename]["md5"] == new_hash["md5"] and hashes[filename]["sha1"] == new_hash["sha1"] and os.path.exists(os.path.join(CACHE_FOLDER, filename + ".obj")):
        with open(os.path.join(CACHE_FOLDER, filename + ".obj"), 'rb') as f:
            return pickle.load(f)

    if VERBOSE:
        print(f"Processing {file_path}.")

    start_time = time.time()

    hashes[filename] = new_hash

    pret = parse(code)
    if not pret:
        return False

    code, curr_namespace, deps, provs, static = pret

    # format code
    opts = jsbeautifier.default_options()
    opts.indent_size = 4
    code = jsbeautifier.beautify(code, opts)

    ret = {
        "path": file_path,
        "namespace": curr_namespace,
        "provides": provs,
        "requires": deps,
        "static" : static,
        "content": code
    }

    with open(os.path.join(CACHE_FOLDER, filename + ".obj"), 'wb') as f:
        pickle.dump(ret, f, protocol=pickle.HIGHEST_PROTOCOL)

    if VERBOSE:
        print("--- %s seconds ---" % (time.time() - start_time))

    return ret


def write_compiled(js_out, file_metadata, ordered_file_paths):
    initialized_namespaces = set()
    static_calls = list()
    with (open(js_out, "w") as bundle):
        file_lookup = {m["path"]: m for m in file_metadata}

        bundle.write("\"use strict\";\n\n")
        for path in ordered_file_paths:
            namespace = file_lookup[path]["namespace"]
            static_calls = static_calls + file_lookup[path]["static"]

            if namespace and namespace not in initialized_namespaces:
                parts = namespace.split(".")

                current_path = ""
                for i, part in enumerate(parts):
                    if i == 0:
                        current_path = part
                        if current_path not in initialized_namespaces:
                            bundle.write(f"var {current_path} = {{}};\n")
                            initialized_namespaces.add(current_path)
                    else:
                        current_path += "." + part
                        if current_path not in initialized_namespaces:
                            bundle.write(f"if(!{current_path}) {current_path} = {{}};\n")
                            initialized_namespaces.add(current_path)
        bundle.write("\n")

        for path in ordered_file_paths:
            bundle.write(file_lookup[path]["content"])
            bundle.write("\n")

        for s in static_calls:
            bundle.write(s + ".static();\n")

def sortFiles(file_metadata):
    ts = TopologicalSorter()

    namespace_to_file = {}
    for meta in file_metadata:
        for prov in meta["provides"]:
            namespace_to_file[prov] = meta["path"]

    for meta in file_metadata:
        predecessors = []
        for req in meta["requires"]:
            if req in namespace_to_file:
                predecessors.append(namespace_to_file[req])

        ts.add(meta["path"], *predecessors)

    return list(ts.static_order())


def build(hashes: dict, js_folder :str, js_out :str):
    file_metadata = []

    for filename in os.listdir(js_folder):
        if filename.endswith(".js"):
            meta = analyze_file(hashes, filename, js_folder)
            if not meta:
                return False
            else:
                file_metadata.append(meta)

    ordered_file_paths = sortFiles(file_metadata)

    write_compiled(js_out, file_metadata, ordered_file_paths)

    return True

def main():
    parser = argparse.ArgumentParser(description="A script to generate bundled .js file from many js files")
    parser.add_argument("-c", "--clean", help="clean the cache files", action="store_true")
    parser.add_argument("-s","--src", help="dir where .js files are located")
    parser.add_argument("-o", "--out", help="name of output .js file")
    parser.add_argument("-v", "--verbose", help="output verbose", action="store_true")
    parser.add_argument("--version", help="show version and exit", action="store_true")

    args = parser.parse_args()

    if args.version:
        print(f"js_builder version: {VERSION}")
        exit(0)

    global VERBOSE
    VERBOSE = args.verbose
    parse.VERBOSE = VERBOSE

    js_folder = "js_src"
    if args.src is not None:
        js_folder = args.src

    js_out = "out.js"
    if args.out is not None:
        js_out = args.out
    if js_out[-3:] != ".js":
        js_out += ".js"

    init_cache(CACHE_FOLDER)

    if args.clean:
        remove_cache(VERBOSE)

    hashes = read_builder_hashes()

    bOk = build(hashes, js_folder, js_out)

    if bOk:
        write_builder_hashes(hashes)
        print(f"Successfully compiled {js_out}")
        return 0
    else:
        print("Something when wrong")
        return 1


if __name__ == "__main__":
    start_time = time.time()
    code = main()
    print("--- %s seconds ---" % (time.time() - start_time))
    exit(code)

