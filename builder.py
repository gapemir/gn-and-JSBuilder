import json
import os
import re
import sys
import hashlib
from unittest import case
VERSION = "1.0.0"

BUF_SIZE = 65536  # lets read stuff in 64kb chunks!

def calc_file_sha256(filename):
    md5 = hashlib.md5()
    sha1 = hashlib.sha1()
    with open(filename, "rb") as f:
        while True:
            data = f.read(BUF_SIZE)
            if not data:
                break
            md5.update(data)
            sha1.update(data)
    return md5.hexdigest(), sha1.hexdigest()
#NO SPACES
def print_help():
    print("JS_builder...")
    print("Usage: JS_builder [OPTIONS]...")
    print("Options:")
    print("  -h, --help  Show this help message")
    print("  -v, --version  Show version")
    print("  -q, --quiet   Quiet mode")
    print("There must be builder.conf.old file present in working directory. example:")
def print_version():
    print("JS_builder: "+VERSION)
def readBuilderBinary():
    map = {}
    if not os.path.isdir(".bdata/"):
        os.mkdir(".bdata")
    if not os.path.isfile(".bdata/data"):
        return map
    with open(".bdata/data", "r") as f:
        map = json.load(f)
    return map
def writeBuilderBinary(map):
    with open(".bdata/data", "w") as f:
        json.dump(map, f, indent=2)

def find_all(a_str, sub):
    start = 0
    while True:
        start = a_str.find(sub, start)
        if start == -1: return
        yield start
        start += len(sub)


def build(files: list[str], out):
    defNamespaces = []
    currNamespace = ""
    spacesToRem = 0;
    with (open(".bdata/tmp", "w", encoding='utf-8') as fout):
        for filename in files:
            with open(filename, "r", encoding='utf-8') as fin:
                while line := fin.readline():
                    if line.strip().startswith("//") or not line.strip():
                        continue
                    ##line = line.replace("\n", "")
                    line = line.rstrip()
                    copy = re.sub(r'".*"|\'.*\'|`.*`', "", line)
                    if line.strip().startswith("namespace"):
                        line = line.strip()
                        currNamespace = line[10:line.index("{")].strip()
                        if currNamespace not in defNamespaces:
                            splIndx = find_all(line, ".")
                            for indx in splIndx:
                                if line[10:indx] not in defNamespaces:
                                    defNamespaces.append(line[10:indx])
                            defNamespaces.append(currNamespace)
                    elif " class " in copy or "class " in copy:
                    #elif (" class " in line and (not(re.match(r".*\".*class.*\".*", line))) or re.match(r".*\'.*class.*\.*", line) or re.match(r".*\`.*class.*\`.*", line)) or line.strip().startswith("class "):
                        spacesToRem = line.index("class")
                        if("extends" in line):
                            line = currNamespace + "." + line[line.index("class")+6:line.index("extends")] + "= class " + line[line.index("extends"):line.index("{")] + " {"
                        else:
                            line = currNamespace + "." + line[line.index("class ")+6:line.index("{")] + "= class {"
                        fout.write(line+"\n")
                        print(line)
                    else:
                        line = line[spacesToRem:]
                        if not line:
                            continue
                        fout.write(line+"\n")
                        print(line)
    defNamespaces.sort()
    print(defNamespaces)
    with open(out, "w", encoding='utf-8') as fout:
        for namespace in defNamespaces:
            fout.write("if (!"+namespace + ") "+namespace+" = {}\n")
        fout.write("\n\n")
        with open(".bdata/tmp", "r", encoding='utf-8') as ftmp:
            while line := ftmp.readline():
                fout.write(line)



def main():
    #if len(sys.argv)==1:
        #print_help()
        #return
    i=1;
    while i<len(sys.argv):
        match sys.argv[i].lower():
            case "-h" | "--help":
                print_help()
                return
            case "-v" | "--version":
                print_version()
                return
            case _:
                print_help()
                return

    #if ".bdata" not in os.listdir("."):
    #    os.mkdir(".bdata")

    oldHashes = readBuilderBinary()
    newHashes = {}

    configFile = open("./builder.conf","r", encoding="utf-8")
    multilineComment = False
    version = None
    src = "."
    out = "./out.js"
    strict = False
    needToBuild = False
    files = []
    while line := configFile.readline():
        line = line.strip()
        if line.startswith("#") or line.startswith("//") or multilineComment or not line:
            continue
        if line.startswith("/*"):
            multilineComment = True
            continue
        if "*/" in line:
            multilineComment = False
            continue
        if line.startswith("version"):
            version = line.split("=")[1].strip()
        elif line.startswith("strict"):
            strict = line.split("=")[1].strip().lower() == "true"
        elif line.startswith("src"):
            src = line.split("=")[1].strip()
        elif line.startswith("out"):
            out = line.split("=")[1].strip()
        elif ".js" in line:
            files.append(src+line)
            newHashes[line]= calc_file_sha256(src+line)
            if not oldHashes.get(line) or newHashes.get(line)[0] != oldHashes.get(line)[0] or not oldHashes.get(line) or newHashes.get(line)[1] != oldHashes.get(line)[1]:
                needToBuild=True
        else:
            print("error parsing "+line)
            print("exiting")
            return

    if needToBuild:
        #writeBuilderBinary(newHashes)
        print("Building " + out)
        build(files, out)
    else:
        print("nothing to be done")




if __name__ == "__main__":
    main()
