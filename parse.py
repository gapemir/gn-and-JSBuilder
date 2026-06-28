from tree_sitter import Query, Language, Parser, QueryCursor
import tree_sitter_javascript as tsjs
from colorama import Fore, Back, Style

VERBOSE = False

JS = Language(tsjs.language())  # or load from a .so if custom
parser = Parser(JS)

def parse(code):
    code, current_namespace = extract_namespace(code)

    tree = parser.parse(bytes(code, "utf8"))

    code = remove_comments(tree, code)

    tree = parser.parse(bytes(code, "utf8"))

    if find_errors(tree.root_node, bytes(code, "utf8")):
        return False

    code, deps, provides, static = find_deps_and_classes(tree.root_node, current_namespace, code)

    return code, current_namespace, deps, provides, static

def remove_comments(tree, code :str):
    comment_query = Query(JS, "(comment) @comment")
    query_cursor = QueryCursor(comment_query)
    captures = query_cursor.captures(tree.root_node)

    comment_ranges = []
    if "comment" in captures:
        for node in captures["comment"]:
            comment_ranges.append((node.start_byte, node.end_byte))

    comment_ranges.sort(key=lambda x: x[0], reverse=True)

    mutable_code = bytearray(code, "utf8")
    for start_byte, end_byte in comment_ranges:
        del mutable_code[start_byte:end_byte]

    return mutable_code.decode("utf8")

def find_errors(node, code_bytes):
    if node.is_missing:
        start_row, start_col = node.start_point
        missing_token = node.type

        lines = code_bytes.decode("utf8").splitlines()
        context_line = lines[start_row].strip() if start_row < len(lines) else ""

        print(Fore.RED + f"Syntax Error at Line {start_row + 1}, Col {start_col + 1}:")
        print(f"   Missing expected token: {Style.RESET_ALL}'{missing_token}'")
        if context_line:
            print(f"   Near code: {Style.DIM}{context_line}{Style.RESET_ALL}\n")
        return True

    elif node.type == "ERROR":
        start_row, start_col = node.start_point
        error_span = code_bytes[node.start_byte: node.end_byte].decode("utf8")
        first_err_line = ""
        if error_span:
            split = error_span.splitlines()
            first_err_line = split[0]
            if len(split) > 1:
                first_err_line += "\n" + split[1]
        if len(first_err_line) > 140:
            first_err_line = first_err_line[:140] + "..."

        print(Fore.RED + f"Syntax Error at Line {start_row + 1}, Col {start_col + 1}:")
        print(f"   Invalid syntax starting at:{Style.RESET_ALL}\n{first_err_line}\n")
        return True

    for child in node.children:
        if find_errors(child, code_bytes):
            return True

    return False

def extract_namespace(code :str):
    code.strip()
    # code = remove_comments(code)
    idx = code.find("namespace")
    if idx < 0:
        return code, False

    cidx = code.find("{", idx)
    currNamespace = code[idx+9:cidx].strip()

    if VERBOSE:
        print("provides namespace", currNamespace)
    code = code[:idx] + code[cidx+1:]
    lcidx = code.rfind("}")
    code = code[:lcidx] + code[lcidx + 1:]
    return code, currNamespace

def find_deps_and_classes(node, curr_namespace :str, code :str):
    deps = set()
    provides = set()
    static = list()
    idx = 0

    className = ""
    for child in node.children:
        if child.type == "class_declaration":
            for cchild in child.children:
                if cchild.type == "identifier":
                    onlyClassName = cchild.text.decode('utf-8')
                    className = onlyClassName
                    if curr_namespace is not None:
                        className = curr_namespace + "." + className
                    provides.add(className)

                    safeClassName = className.replace(".", "_")

                    newCode = className + " = class " + safeClassName

                    idx = code.find("class ", idx)
                    endidx = code.find(onlyClassName, idx) + len(onlyClassName)
                    code = code[:idx] + newCode + code[endidx:]

                    idx += len(child.text) + len(newCode) - len(onlyClassName) - 6

                elif cchild.type == "class_heritage":
                    deps.add(cchild.children[1].text.decode('utf-8'))

                elif cchild.type == "class_body":
                    for bchild in cchild.children:
                        if len(bchild.children) > 1 and bchild.children[0].type == "static" and bchild.children[1].text == b"static":
                            static.append(className)
        else:
            idx = code.find(child.text.decode('utf-8'))
            code = code[:idx] + curr_namespace + "." + code[idx:]
            idx += len(curr_namespace) +1


    return code, deps.difference(provides), provides, static