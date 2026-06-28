import os
import json
import shutil

CACHE_FOLDER = "/tmp"

def remove_cache(verbose):
    if os.path.exists(CACHE_FOLDER):
        if verbose:
            print("Cleaning cache folder")
        shutil.rmtree(CACHE_FOLDER)

    os.mkdir(CACHE_FOLDER)

def init_cache(cache_folder):
    global CACHE_FOLDER
    CACHE_FOLDER = cache_folder
    if not os.path.exists(CACHE_FOLDER):
        os.mkdir(CACHE_FOLDER)

def read_builder_hashes():
    if not os.path.isfile(CACHE_FOLDER + ".data"):
        return {}
    with open(CACHE_FOLDER + ".data", "r") as f:
        return json.load(f)
    return {}

def write_builder_hashes(hashes : dict):
    with open(CACHE_FOLDER + ".data", "w") as f:
        json.dump(hashes, f, indent=2)

